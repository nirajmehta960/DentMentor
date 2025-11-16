-- Migration: Remove overly restrictive CHECK constraint or add missing values
-- Description: The 'booking_events_event_type_check' constraint is preventing Stripe event types like 'payment_intent.succeeded' from being inserted.
-- We should remove this constraint as Stripe has many event types and we shouldn't restrict them at the DB level for this audit table.

ALTER TABLE public.booking_events DROP CONSTRAINT IF EXISTS booking_events_event_type_check;
