-- Migration: Add timezone to mentee_profiles and update create_booking_hold RPC
-- Description: Adds timezone column to mentee_profiles and updates create_booking_hold to capture and store it.

-- 1. Add timezone column to mentee_profiles if not exists
ALTER TABLE public.mentee_profiles
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

-- 2. Update create_booking_hold RPC to accept and store mentee_timezone
CREATE OR REPLACE FUNCTION public.create_booking_hold(
  p_mentor_id uuid,
  p_service_id uuid,
  p_mentee_user_id uuid,
  p_date date,
  p_start_time_local text,
  p_timezone text, -- This is the Mentor's timezone (used for slot conversion)
  p_mentee_timezone text, -- New param: The Mentee's local timezone
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
  v_existing_reservation RECORD;
BEGIN
  -- A. Idempotency Check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing_reservation
    FROM public.booking_reservations
    WHERE mentee_user_id = p_mentee_user_id
      AND idempotency_key = p_idempotency_key;

    IF v_existing_reservation.id IS NOT NULL THEN
       IF (v_existing_reservation.status = 'held' OR v_existing_reservation.status = 'pending_payment') 
          AND v_existing_reservation.expires_at > NOW() THEN
          
          RETURN jsonb_build_object(
            'status', 'success',
            'reservation_id', v_existing_reservation.id,
            'expires_at', v_existing_reservation.expires_at,
            'message', 'Retrieved existing reservation'
          );
       ELSE
          RAISE EXCEPTION 'IDEMPOTENCY_KEY_EXPIRED';
       END IF;
    END IF;
  END IF;

  -- B. Validate Mentee & Update Timezone
  SELECT id INTO v_mentee_profile_id
  FROM public.mentee_profiles
  WHERE user_id = p_mentee_user_id;

  IF v_mentee_profile_id IS NULL THEN
    RAISE EXCEPTION 'MENTEE_PROFILE_NOT_FOUND';
  END IF;

  -- Update Mentee Timezone
  -- We update it only if provided, to ensure profile has the latest info.
  IF p_mentee_timezone IS NOT NULL THEN
    UPDATE public.mentee_profiles
    SET timezone = p_mentee_timezone
    WHERE id = v_mentee_profile_id;
  END IF;

  -- C. Validate Service
  SELECT * INTO v_service_record
  FROM public.mentor_services
  WHERE id = p_service_id AND mentor_id = p_mentor_id;

  IF v_service_record.id IS NULL THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND';
  END IF;

  -- D. Convert Time (Using Mentor's Timezone)
  v_session_start_utc := (
    (p_date || ' ' || p_start_time_local || ':00')::timestamp 
    AT TIME ZONE p_timezone
  )::timestamptz;

  IF v_session_start_utc <= NOW() THEN
    RAISE EXCEPTION 'INVALID_TIMESTAMP: Cannot book past sessions';
  END IF;

  -- E. Lock Availability
  SELECT * INTO v_availability_record
  FROM public.mentor_availability
  WHERE mentor_id = p_mentor_id
    AND date = p_date
    AND is_available = true
  FOR UPDATE;

  IF v_availability_record.id IS NULL THEN
    RAISE EXCEPTION 'NO_AVAILABILITY_RECORD';
  END IF;

  -- F. Find & Mark Slot Used
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

  -- G. Create Reservation
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
    mentor_availability_id,
    slot_start_time,
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
    v_availability_record.id,
    p_start_time_local,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object(
    'status', 'success',
    'reservation_id', v_reservation_id,
    'expires_at', v_expires_at
  );

EXCEPTION 
  WHEN unique_violation THEN
    SELECT * INTO v_existing_reservation
    FROM public.booking_reservations
    WHERE mentee_user_id = p_mentee_user_id
      AND idempotency_key = p_idempotency_key;
      
    IF v_existing_reservation.id IS NOT NULL THEN
       RETURN jsonb_build_object(
         'status', 'success',
         'reservation_id', v_existing_reservation.id,
         'expires_at', v_existing_reservation.expires_at,
         'message', 'Recovered concurrent reservation'
       );
    ELSE
       RAISE;
    END IF;
    
  WHEN OTHERS THEN
    RAISE;
END;
$$;
