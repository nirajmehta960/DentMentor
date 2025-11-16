-- Migration: Add Transaction & Earning Records on Confirmation
-- Description: Updates confirm_booking_payment to record earnings and transactions (triggering notifications).

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
  v_mentee_name text;
  v_amount_dollars numeric;
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

  -- Get Mentee Profile ID & Name
  SELECT mp.id, (p.first_name || ' ' || p.last_name) 
  INTO v_mentee_profile_id, v_mentee_name
  FROM public.mentee_profiles mp
  JOIN public.profiles p ON p.user_id = mp.user_id
  WHERE mp.user_id = v_reservation.mentee_user_id;

  v_amount_dollars := v_reservation.price_cents / 100.0;

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
    v_amount_dollars,
    p_stripe_payment_intent_id,
    'one_on_one',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_session_id;

  -- Create Earning Record
  -- Assuming 20% platform fee for now, or 0. Simple net calculation.
  INSERT INTO public.earnings (
    mentor_id,
    session_id,
    amount,
    platform_fee,
    net_amount,
    payout_status,
    earning_date
  ) VALUES (
    v_reservation.mentor_id,
    v_session_id,
    v_amount_dollars,
    0, -- Calculate fee if needed
    v_amount_dollars, -- Net
    'pending',
    NOW()
  );

  -- Create Transaction Record (Triggers Notification)
  INSERT INTO public.transactions (
    mentor_id,
    session_id,
    transaction_type,
    amount,
    description,
    reference_id,
    created_at
  ) VALUES (
    v_reservation.mentor_id,
    v_session_id,
    'earning',
    v_amount_dollars,
    'Session payment from ' || COALESCE(v_mentee_name, 'Mentee'),
    p_stripe_payment_intent_id,
    NOW()
  );

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
