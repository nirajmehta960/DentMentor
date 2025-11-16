-- Migration: Finalize Release Expired Holds & Add Audit Logging
-- Description: Ensures reliable release of expired holds, adds logging, and optimizes queries.

-- 1. Create hold_cleanup_events table for audit logging
CREATE TABLE IF NOT EXISTS public.hold_cleanup_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.booking_reservations(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- RLS for hold_cleanup_events (Admin/Service Role mostly, but users might see their own history later)
ALTER TABLE public.hold_cleanup_events ENABLE ROW LEVEL SECURITY;

drop policy if exists "Users can view their own booking events" on public.hold_cleanup_events;
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

-- 2. Add performance indexes on booking_reservations
CREATE INDEX IF NOT EXISTS idx_booking_reservations_expires_at 
    ON public.booking_reservations(expires_at);

CREATE INDEX IF NOT EXISTS idx_booking_reservations_status_expires_at 
    ON public.booking_reservations(status, expires_at);

-- 3. Update release_expired_holds function
CREATE OR REPLACE FUNCTION public.release_expired_holds()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation RECORD;
  v_count int := 0;
BEGIN
  -- Find reservations that are pending (payment or approval) AND expired
  -- Using FOR UPDATE SKIP LOCKED to allow parallel execution if needed
  FOR v_reservation IN 
    SELECT * FROM public.booking_reservations 
    WHERE status IN ('pending_payment', 'pending') 
      AND expires_at < NOW()
    FOR UPDATE SKIP LOCKED 
  LOOP
    -- 1. Release slot in mentor_availability if applicable
    IF v_reservation.mentor_availability_id IS NOT NULL AND v_reservation.slot_start_time IS NOT NULL THEN
       PERFORM public.internal_release_slot(v_reservation.mentor_availability_id, v_reservation.slot_start_time);
    END IF;

    -- 2. Log event
    INSERT INTO public.hold_cleanup_events (booking_id, event_type, metadata)
    VALUES (
      v_reservation.id, 
      'hold_released', 
      jsonb_build_object(
        'reason', 'expired',
        'expires_at', v_reservation.expires_at,
        'released_at', NOW()
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

-- Grant permissions for the new function/table
GRANT SELECT, INSERT ON public.hold_cleanup_events TO service_role;
GRANT SELECT ON public.hold_cleanup_events TO authenticated; -- View own events
