-- Migration: Complete Release Expired Holds Logic
-- Description: Adds helper for slot release, ensures audit table exists, and finalizes cleanup function.

-- 1. Helper Function: internal_release_slot
-- Re-enables a specific time slot in mentor_availability
CREATE OR REPLACE FUNCTION public.internal_release_slot(
  p_availability_id uuid,
  p_slot_start_time text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_time_slots jsonb;
  v_slot_index int;
  v_slot_found boolean := false;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT time_slots INTO v_time_slots
  FROM public.mentor_availability
  WHERE id = p_availability_id
  FOR UPDATE;

  IF NOT FOUND THEN 
    RETURN; 
  END IF;

  -- Iterate to find the slot with matching start_time
  FOR v_slot_index IN 0..(jsonb_array_length(v_time_slots) - 1) LOOP
    IF (v_time_slots->v_slot_index->>'start_time') = p_slot_start_time THEN
        -- Set is_available = true
        v_time_slots := jsonb_set(
            v_time_slots, 
            ARRAY[v_slot_index::text, 'is_available'], 
            'true'::jsonb
        );
        v_slot_found := true;
        EXIT;
    END IF;
  END LOOP;

  -- Only update if we actually modified a slot
  IF v_slot_found THEN
    UPDATE public.mentor_availability
    SET time_slots = v_time_slots,
        updated_at = NOW()
    WHERE id = p_availability_id;
  END IF;
END;
$$;

-- 2. Audit Table: hold_cleanup_events
CREATE TABLE IF NOT EXISTS public.hold_cleanup_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.booking_reservations(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hold_cleanup_events ENABLE ROW LEVEL SECURITY;

-- Policy: Admin/Service Role can do anything (implicit), authenticated users can view own
DROP POLICY IF EXISTS "Users can view their own booking events" ON public.hold_cleanup_events;
CREATE POLICY "Users can view their own booking events"
    ON public.hold_cleanup_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.booking_reservations br
            WHERE br.id = hold_cleanup_events.booking_id
            AND br.mentee_user_id = auth.uid()
        )
    );

GRANT SELECT, INSERT ON public.hold_cleanup_events TO service_role;
GRANT SELECT ON public.hold_cleanup_events TO authenticated;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_reservations_expires_at 
    ON public.booking_reservations(expires_at);

CREATE INDEX IF NOT EXISTS idx_booking_reservations_status_expires_at 
    ON public.booking_reservations(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_booking_reservations_mentor_avail 
    ON public.booking_reservations(mentor_availability_id);

-- 4. Main Function: release_expired_holds
CREATE OR REPLACE FUNCTION public.release_expired_holds()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation RECORD;
  v_count int := 0;
BEGIN
  -- Find reservations that are 'held' or 'pending_payment' AND expired AND no session created
  -- Using FOR UPDATE SKIP LOCKED to allow parallel execution if needed
  FOR v_reservation IN 
    SELECT * FROM public.booking_reservations 
    WHERE status IN ('held', 'pending_payment', 'pending') 
      AND expires_at < NOW()
      AND session_id IS NULL
    FOR UPDATE SKIP LOCKED 
  LOOP
    -- 1. Release slot in mentor_availability
    IF v_reservation.mentor_availability_id IS NOT NULL AND v_reservation.slot_start_time IS NOT NULL THEN
       PERFORM public.internal_release_slot(v_reservation.mentor_availability_id, v_reservation.slot_start_time);
    END IF;

    -- 2. Log event
    INSERT INTO public.hold_cleanup_events (booking_id, event_type, metadata)
    VALUES (
      v_reservation.id, 
      'expired_hold_released', 
      jsonb_build_object(
        'reason', 'expired',
        'previous_status', v_reservation.status,
        'expires_at', v_reservation.expires_at,
        'released_at', NOW(),
        'mentor_availability_id', v_reservation.mentor_availability_id,
        'slot_start_time', v_reservation.slot_start_time
      )
    );

    -- 3. Update reservation status
    UPDATE public.booking_reservations
    SET status = 'expired', 
        updated_at = NOW()
    WHERE id = v_reservation.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'status', 'success', 
    'released_count', v_count, 
    'timestamp', NOW()
  );
END;
$$;
