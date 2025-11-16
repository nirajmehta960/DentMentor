-- Migration: Enable Payments & Booking Holds
-- Description: Adds Stripe columns, updates status enums, and adds booking hold logic.

-- 1. Update booking_reservations table
ALTER TABLE public.booking_reservations
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
ADD COLUMN IF NOT EXISTS amount_total integer, -- amount in cents
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'usd',
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
-- New columns for release logic
ADD COLUMN IF NOT EXISTS mentor_availability_id uuid,
ADD COLUMN IF NOT EXISTS slot_start_time text;

-- 2. Update sessions table
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- 3. Function: create_booking_hold
-- Description: Creates a reservation, locks the slot, and prepares for payment.
CREATE OR REPLACE FUNCTION public.create_booking_hold(
  p_mentor_id uuid,
  p_service_id uuid,
  p_mentee_user_id uuid,
  p_date date,
  p_start_time_local text,
  p_timezone text,
  p_idempotency_key text,
  p_amount_cents int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mentee_profile_id uuid;
  v_service_record RECORD;
  v_session_start_utc timestamptz;
  v_availability_record RECORD;
  v_slot_index int;
  v_slot_found boolean := false;
  v_time_slots jsonb;
  v_reservation_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- A. Validate Mentee
  SELECT id INTO v_mentee_profile_id
  FROM public.mentee_profiles
  WHERE user_id = p_mentee_user_id;

  IF v_mentee_profile_id IS NULL THEN
    RAISE EXCEPTION 'MENTEE_PROFILE_NOT_FOUND';
  END IF;

  -- B. Validate Service
  SELECT * INTO v_service_record
  FROM public.mentor_services
  WHERE id = p_service_id AND mentor_id = p_mentor_id;

  IF v_service_record.id IS NULL THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND';
  END IF;

  -- C. Convert Time
  v_session_start_utc := (
    (p_date || ' ' || p_start_time_local || ':00')::timestamp 
    AT TIME ZONE p_timezone
  )::timestamptz;

  IF v_session_start_utc <= NOW() THEN
    RAISE EXCEPTION 'INVALID_TIMESTAMP: Cannot book past sessions';
  END IF;

  -- D. Lock Availability
  SELECT * INTO v_availability_record
  FROM public.mentor_availability
  WHERE mentor_id = p_mentor_id
    AND date = p_date
    AND is_available = true -- Row level available? Maybe check slots?
    -- Assuming row exists for the date
  FOR UPDATE;

  IF v_availability_record.id IS NULL THEN
    RAISE EXCEPTION 'NO_AVAILABILITY_RECORD';
  END IF;

  -- E. Find & Mark Slot Used
  v_time_slots := v_availability_record.time_slots;
  
  FOR v_slot_index IN 0..(jsonb_array_length(v_time_slots) - 1) LOOP
    IF (v_time_slots->v_slot_index->>'start_time') = p_start_time_local 
       AND (v_time_slots->v_slot_index->>'is_available')::boolean = true THEN
       
       -- Mark as unavailable
       v_time_slots := jsonb_set(
         v_time_slots, 
         ARRAY[v_slot_index::text, 'is_available'], 
         'false'::jsonb
       );
       v_slot_found := true;
       EXIT;
    END IF;
  END LOOP;

  IF NOT v_slot_found THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE';
  END IF;

  -- Update Availability
  UPDATE public.mentor_availability
  SET time_slots = v_time_slots, updated_at = NOW()
  WHERE id = v_availability_record.id;

  -- F. Create Reservation (Hold)
  v_expires_at := (NOW() + interval '15 minutes');

  INSERT INTO public.booking_reservations (
    mentee_user_id,
    mentor_id,
    service_id,
    session_start_utc,
    duration_minutes,
    price_cents,
    amount_total,
    currency,
    idempotency_key,
    status,
    expires_at,
    mentor_availability_id, -- New
    slot_start_time,        -- New
    created_at,
    updated_at
  ) VALUES (
    p_mentee_user_id,
    p_mentor_id,
    p_service_id,
    v_session_start_utc,
    COALESCE(v_service_record.duration_minutes, 60),
    p_amount_cents,
    p_amount_cents,
    'usd',
    p_idempotency_key,
    'pending_payment',
    v_expires_at,
    v_availability_record.id, -- Store for release
    p_start_time_local,       -- Store for release
    NOW(),
    NOW()
  )
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object(
    'status', 'success',
    'reservation_id', v_reservation_id,
    'expires_at', v_expires_at
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

-- 4. Function: confirm_booking_payment
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
  p_reservation_id uuid,
  p_stripe_checkout_id text,
  p_stripe_payment_intent_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation RECORD;
  v_session_id uuid;
  v_mentee_profile_id uuid;
BEGIN
  -- Get Reservation
  SELECT * INTO v_reservation
  FROM public.booking_reservations
  WHERE id = p_reservation_id FOR UPDATE;

  IF v_reservation.id IS NULL THEN
    RAISE EXCEPTION 'RESERVATION_NOT_FOUND';
  END IF;

  IF v_reservation.status = 'confirmed' OR v_reservation.status = 'paid' THEN
    RETURN jsonb_build_object('status', 'already_processed', 'session_id', v_reservation.session_id);
  END IF;

  -- Get Mentee Profile ID
  SELECT id INTO v_mentee_profile_id 
  FROM public.mentee_profiles 
  WHERE user_id = v_reservation.mentee_user_id;

  -- Create Session
  INSERT INTO public.sessions (
    mentor_id,
    mentee_id,
    session_date,
    duration_minutes,
    status,
    payment_status,
    price_paid,
    stripe_payment_intent_id,
    session_type,
    created_at,
    updated_at
  ) VALUES (
    v_reservation.mentor_id,
    v_mentee_profile_id,
    v_reservation.session_start_utc,
    v_reservation.duration_minutes,
    'scheduled',
    'paid',
    v_reservation.price_cents / 100.0,
    p_stripe_payment_intent_id,
    'one_on_one',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_session_id;

  -- Update Reservation
  UPDATE public.booking_reservations
  SET status = 'confirmed',
      session_id = v_session_id,
      stripe_checkout_session_id = p_stripe_checkout_id,
      stripe_payment_intent_id = p_stripe_payment_intent_id,
      updated_at = NOW()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object('status', 'success', 'session_id', v_session_id);
END;
$$;

-- 5. Helper Function: internal_release_slot (Private)
-- Releases the slot in mentor_availability
CREATE OR REPLACE FUNCTION public.internal_release_slot(
  p_availability_id uuid,
  p_slot_start_time text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_availability_record RECORD;
  v_time_slots jsonb;
  v_slot_index int;
BEGIN
  SELECT * INTO v_availability_record
  FROM public.mentor_availability
  WHERE id = p_availability_id
  FOR UPDATE;

  IF v_availability_record.id IS NULL THEN
    RETURN; -- Already gone?
  END IF;

  v_time_slots := v_availability_record.time_slots;
  
  -- Find slot and set is_available = true
  FOR v_slot_index IN 0..(jsonb_array_length(v_time_slots) - 1) LOOP
    IF (v_time_slots->v_slot_index->>'start_time') = p_slot_start_time THEN
       v_time_slots := jsonb_set(
         v_time_slots, 
         ARRAY[v_slot_index::text, 'is_available'], 
         'true'::jsonb
       );
       EXIT;
    END IF;
  END LOOP;

  UPDATE public.mentor_availability
  SET time_slots = v_time_slots, updated_at = NOW()
  WHERE id = p_availability_id;
END;
$$;


-- 6. Function: cancel_booking_hold
-- Used by webhook on cancellation/expiry
CREATE OR REPLACE FUNCTION public.cancel_booking_hold(
  p_reservation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation RECORD;
BEGIN
  SELECT * INTO v_reservation
  FROM public.booking_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_reservation.id IS NULL THEN
    RAISE EXCEPTION 'RESERVATION_NOT_FOUND';
  END IF;

  IF v_reservation.status = 'confirmed' OR v_reservation.status = 'paid' THEN
     RETURN jsonb_build_object('status', 'failed', 'message', 'Already confirmed');
  END IF;
  
  IF v_reservation.status = 'cancelled' OR v_reservation.status = 'expired' THEN
     RETURN jsonb_build_object('status', 'success', 'message', 'Already cancelled');
  END IF;

  -- Release availability slot
  IF v_reservation.mentor_availability_id IS NOT NULL AND v_reservation.slot_start_time IS NOT NULL THEN
     PERFORM public.internal_release_slot(v_reservation.mentor_availability_id, v_reservation.slot_start_time);
  END IF;

  -- Update status
  UPDATE public.booking_reservations
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object('status', 'success');
END;
$$;


-- 7. Function: release_expired_holds
-- Used by Cron Job or Maintenance
CREATE OR REPLACE FUNCTION public.release_expired_holds()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation RECORD;
  v_count int := 0;
BEGIN
  FOR v_reservation IN 
    SELECT * FROM public.booking_reservations 
    WHERE status = 'pending_payment' 
      AND expires_at < NOW()
    FOR UPDATE SKIP LOCKED -- Skip locked rows to allow concurrent processing
  LOOP
    -- Release slot
    IF v_reservation.mentor_availability_id IS NOT NULL AND v_reservation.slot_start_time IS NOT NULL THEN
       PERFORM public.internal_release_slot(v_reservation.mentor_availability_id, v_reservation.slot_start_time);
    END IF;

    -- Search for any other 'pending_payment' reservations that might be holding this? No, we just release ours.

    UPDATE public.booking_reservations
    SET status = 'expired', updated_at = NOW()
    WHERE id = v_reservation.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('status', 'success', 'released_count', v_count);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_booking_hold TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_booking_payment TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_booking_hold TO service_role; -- Private usually
GRANT EXECUTE ON FUNCTION public.release_expired_holds TO service_role;
