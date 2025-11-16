-- Migration: Safeguard schema for payment flow
-- Description: Idempotently adds ALL potential missing columns used in key payment functions.
-- This is a "catch-all" to prevent further "column does not exist" errors.

do $$
begin

  -- 1. Table: sessions
  -- Used in confirm_booking_payment: payment_status, stripe_payment_intent_id, price_paid
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'sessions' and column_name = 'payment_status') then
    alter table public.sessions add column payment_status text default 'unpaid';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'sessions' and column_name = 'stripe_payment_intent_id') then
    alter table public.sessions add column stripe_payment_intent_id text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'sessions' and column_name = 'price_paid') then
    alter table public.sessions add column price_paid numeric;
  end if;


  -- 2. Table: transactions
  -- Used in confirm_booking_payment: reference_id
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'transactions' and column_name = 'reference_id') then
    alter table public.transactions add column reference_id text;
  end if;

   -- Double check transaction_type again, though likely fixed
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'transactions' and column_name = 'transaction_type') then
    alter table public.transactions add column transaction_type text;
  end if;


  -- 3. Table: booking_reservations
  -- Used in confirm_booking_payment: stripe_checkout_session_id, stripe_payment_intent_id
  -- (These were likely added in 20260117000000_payment_schema_updates.sql, but verifying)
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'booking_reservations' and column_name = 'stripe_checkout_session_id') then
    alter table public.booking_reservations add column stripe_checkout_session_id text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'booking_reservations' and column_name = 'stripe_payment_intent_id') then
    alter table public.booking_reservations add column stripe_payment_intent_id text;
  end if;
  
   if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'booking_reservations' and column_name = 'session_id') then
    alter table public.booking_reservations add column session_id uuid references public.sessions(id);
  end if;

end;
$$;
