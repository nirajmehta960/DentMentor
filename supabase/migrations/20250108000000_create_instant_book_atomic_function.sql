-- Create instant_book_atomic function
-- Atomically books a session by:
-- 1. Checking idempotency via booking_reservations
-- 2. Locking mentor_availability row
-- 3. Validating slot availability
-- 4. Converting local time to UTC
-- 5. Creating session record
-- 6. Updating booking_reservations
-- 7. Marking slot as unavailable in mentor_availability.time_slots

-- Drop all existing overloads of instant_book_atomic function
-- This handles the case where multiple function signatures exist
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT oid::regprocedure as func_name
    FROM pg_proc
    WHERE proname = 'instant_book_atomic'
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_name || ' CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.instant_book_atomic(
  p_mentor_id uuid,
  p_service_id uuid,
  p_mentee_user_id uuid,
  p_date date,
  p_start_time_local text,
  p_timezone text,
  p_idempotency_key text,
  p_reservation_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
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
  v_updated_slots jsonb;
  v_session_id uuid;
  v_reservation_record RECORD;
  v_duration_minutes int;
  v_price_cents int;
  v_price_dollars numeric;
  v_error_code text;
  v_error_message text;
BEGIN
  -- Step 1: Check idempotency via booking_reservations
  -- If reservation exists with session_id, return that session
  IF p_idempotency_key IS NOT NULL THEN
    SELECT session_id, status INTO v_reservation_record
    FROM public.booking_reservations
    WHERE idempotency_key = p_idempotency_key
      AND mentee_user_id = p_mentee_user_id
      AND status = 'confirmed'
      AND session_id IS NOT NULL
    LIMIT 1;
    
    IF v_reservation_record.session_id IS NOT NULL THEN
      -- Return existing session as array (format expected by Edge Function)
      RETURN jsonb_build_array(
        jsonb_build_object(
          'status', 'ok',
          'session_id', v_reservation_record.session_id
        )
      );
    END IF;
  END IF;

  -- Step 2: Lookup mentee profile id from user_id
  SELECT id INTO v_mentee_profile_id
  FROM public.mentee_profiles
  WHERE user_id = p_mentee_user_id
  LIMIT 1;

  IF v_mentee_profile_id IS NULL THEN
    RAISE EXCEPTION 'MENTEE_PROFILE_NOT_FOUND'
      USING MESSAGE = 'Mentee profile not found for user_id: ' || p_mentee_user_id;
  END IF;

  -- Step 3: Get service details
  SELECT id, price, duration_minutes INTO v_service_record
  FROM public.mentor_services
  WHERE id = p_service_id
    AND mentor_id = p_mentor_id
    AND is_active = true
  LIMIT 1;

  IF v_service_record.id IS NULL THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND'
      USING MESSAGE = 'Service not found or inactive: ' || p_service_id;
  END IF;

  v_duration_minutes := COALESCE(v_service_record.duration_minutes, 60);
  
  -- Convert price: mentor_services.price is stored as dollars (numeric)
  -- booking_reservations.price_cents expects cents (integer)
  -- sessions.price_paid stores dollars (numeric)
  v_price_dollars := v_service_record.price;
  v_price_cents := ROUND(v_service_record.price * 100)::int;

  -- Step 4: Convert local time to UTC timestamptz
  -- Build timestamp from date and time, then apply timezone conversion
  -- Format: (date + time) AT TIME ZONE timezone gives local timezone -> UTC
  v_session_start_utc := (
    (p_date || ' ' || p_start_time_local || ':00')::timestamp 
    AT TIME ZONE p_timezone
  )::timestamptz;

  -- Validate UTC timestamp
  IF v_session_start_utc IS NULL THEN
    RAISE EXCEPTION 'INVALID_TIMESTAMP'
      USING MESSAGE = 'Failed to convert date/time/timezone to UTC: ' || p_date || ' ' || p_start_time_local || ' ' || p_timezone;
  END IF;

  -- Check if booking is in the past
  IF v_session_start_utc <= NOW() THEN
    RAISE EXCEPTION 'INVALID_TIMESTAMP'
      USING MESSAGE = 'Cannot book sessions in the past';
  END IF;

  -- Step 5: Lock and get mentor_availability row FOR UPDATE
  SELECT * INTO v_availability_record
  FROM public.mentor_availability
  WHERE mentor_id = p_mentor_id
    AND date = p_date
    AND is_available = true
  FOR UPDATE;

  IF v_availability_record.id IS NULL THEN
    RAISE EXCEPTION 'NO_AVAILABILITY'
      USING MESSAGE = 'No availability found for mentor ' || p_mentor_id || ' on date ' || p_date;
  END IF;

  -- Step 6: Parse and find the matching slot in time_slots JSONB
  v_time_slots := v_availability_record.time_slots;
  
  IF v_time_slots IS NULL OR jsonb_typeof(v_time_slots) != 'array' THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE'
      USING MESSAGE = 'Invalid time_slots format or no slots available';
  END IF;

  -- Find slot with matching start_time and is_available = true
  v_slot_found := false;
  FOR v_slot_index IN 0..(jsonb_array_length(v_time_slots) - 1) LOOP
    DECLARE
      v_slot jsonb;
      v_slot_start_time text;
      v_slot_is_available boolean;
    BEGIN
      v_slot := v_time_slots->v_slot_index;
      v_slot_start_time := v_slot->>'start_time';
      v_slot_is_available := COALESCE((v_slot->>'is_available')::boolean, false);
      
      IF v_slot_start_time = p_start_time_local AND v_slot_is_available THEN
        -- Mark this slot as unavailable
        v_slot := jsonb_set(v_slot, '{is_available}', 'false'::jsonb);
        v_time_slots := jsonb_set(v_time_slots, ARRAY[v_slot_index::text], v_slot);
        v_slot_found := true;
        EXIT;
      END IF;
    END;
  END LOOP;

  IF NOT v_slot_found THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE'
      USING MESSAGE = 'Time slot not available: ' || p_start_time_local || ' on ' || p_date;
  END IF;

  -- Step 7: Insert session record
  INSERT INTO public.sessions (
    mentor_id,
    mentee_id,
    session_date,
    duration_minutes,
    status,
    payment_status,
    price_paid,
    session_type,
    created_at,
    updated_at
  ) VALUES (
    p_mentor_id,
    v_mentee_profile_id,
    v_session_start_utc,
    v_duration_minutes,
    'scheduled',
    'pending',
    v_price_dollars,
    'one_on_one',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_session_id;

  -- Step 8: Insert or update booking_reservations
  IF p_reservation_id IS NOT NULL THEN
    -- Update existing reservation
    UPDATE public.booking_reservations
    SET session_id = v_session_id,
        status = 'confirmed',
        session_start_utc = v_session_start_utc,
        duration_minutes = v_duration_minutes,
        price_cents = v_price_cents,
        updated_at = NOW()
    WHERE id = p_reservation_id
    RETURNING * INTO v_reservation_record;
  ELSE
    -- Insert new reservation if idempotency_key provided
    IF p_idempotency_key IS NOT NULL THEN
      INSERT INTO public.booking_reservations (
        mentee_user_id,
        mentor_id,
        service_id,
        session_start_utc,
        duration_minutes,
        price_cents,
        idempotency_key,
        session_id,
        status,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        p_mentee_user_id,
        p_mentor_id,
        p_service_id,
        v_session_start_utc,
        v_duration_minutes,
        v_price_cents,
        p_idempotency_key,
        v_session_id,
        'confirmed',
        p_metadata,
        NOW(),
        NOW()
      )
      ON CONFLICT (idempotency_key) DO UPDATE
      SET session_id = v_session_id,
          status = 'confirmed',
          session_start_utc = v_session_start_utc,
          duration_minutes = v_duration_minutes,
          price_cents = v_price_cents,
          updated_at = NOW()
      RETURNING * INTO v_reservation_record;
    END IF;
  END IF;

  -- Step 9: Update mentor_availability.time_slots to mark slot as unavailable
  UPDATE public.mentor_availability
  SET time_slots = v_time_slots,
      updated_at = NOW()
  WHERE id = v_availability_record.id;

  -- Return success with session_id as array (format expected by Edge Function)
  RETURN jsonb_build_array(
    jsonb_build_object(
      'status', 'ok',
      'session_id', v_session_id,
      'session_start_utc', v_session_start_utc
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Handle all exceptions and return proper format
    -- Reuse existing variables declared in function
    v_error_code := SQLSTATE;
    v_error_message := SQLERRM;
    
    -- Map known exceptions to readable error codes
    -- RAISE EXCEPTION with custom codes formats message as "ERROR_CODE: message"
    IF v_error_message LIKE '%MENTEE_PROFILE_NOT_FOUND%' THEN
      v_error_code := 'MENTEE_PROFILE_NOT_FOUND';
      -- Extract message after code
      v_error_message := TRIM(SUBSTRING(v_error_message FROM 'MENTEE_PROFILE_NOT_FOUND:[ ]*(.+)'));
      IF v_error_message = '' THEN
        v_error_message := SQLERRM;
      END IF;
    ELSIF v_error_message LIKE '%SERVICE_NOT_FOUND%' THEN
      v_error_code := 'SERVICE_NOT_FOUND';
      v_error_message := TRIM(SUBSTRING(v_error_message FROM 'SERVICE_NOT_FOUND:[ ]*(.+)'));
      IF v_error_message = '' THEN
        v_error_message := SQLERRM;
      END IF;
    ELSIF v_error_message LIKE '%NO_AVAILABILITY%' THEN
      v_error_code := 'NO_AVAILABILITY';
      v_error_message := TRIM(SUBSTRING(v_error_message FROM 'NO_AVAILABILITY:[ ]*(.+)'));
      IF v_error_message = '' THEN
        v_error_message := SQLERRM;
      END IF;
    ELSIF v_error_message LIKE '%SLOT_UNAVAILABLE%' THEN
      v_error_code := 'SLOT_UNAVAILABLE';
      v_error_message := TRIM(SUBSTRING(v_error_message FROM 'SLOT_UNAVAILABLE:[ ]*(.+)'));
      IF v_error_message = '' THEN
        v_error_message := SQLERRM;
      END IF;
    ELSIF v_error_message LIKE '%INVALID_TIMESTAMP%' THEN
      v_error_code := 'INVALID_TIMESTAMP';
      v_error_message := TRIM(SUBSTRING(v_error_message FROM 'INVALID_TIMESTAMP:[ ]*(.+)'));
      IF v_error_message = '' THEN
        v_error_message := SQLERRM;
      END IF;
    ELSE
      -- Default to internal error
      v_error_code := 'INTERNAL_ERROR';
      v_error_message := SQLERRM;
    END IF;
    
    RETURN jsonb_build_array(
      jsonb_build_object(
        'status', 'error',
        'error_code', v_error_code,
        'error_message', v_error_message
      )
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.instant_book_atomic(uuid, uuid, uuid, date, text, text, text, uuid, jsonb) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.instant_book_atomic IS 
  'Atomically books a session by checking idempotency, locking availability, validating slots, creating session, and updating availability. Returns session_id on success or error details on failure.';
