-- Migration: Separate Internal Session ID and Stripe Session ID
-- Description: Clarifies the schema by separating the generic (Stripe) text session ID from the internal UUID reference to the sessions table.

-- 1. Rename the existing generic text column to `stripe_session_id`
-- This column currently holds 'cs_test_...' or 'N/A' or 'unknown_session'.
ALTER TABLE public.booking_events 
RENAME COLUMN session_id TO stripe_session_id;

-- 2. Add a new `session_id` column specifically for the internal UUID reference
-- It allows NULLs because not all events are linked to a session yet.
ALTER TABLE public.booking_events 
ADD COLUMN session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL;

-- 3. Reload schema cache
NOTIFY pgrst, 'reload';
