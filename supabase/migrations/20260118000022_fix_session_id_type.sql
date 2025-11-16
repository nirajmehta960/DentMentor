-- Migration: Fix session_id column type in booking_events
-- Description: Changes session_id from UUID to TEXT and removes NOT NULL constraint to allow Stripe Session IDs and missing values.

-- 0. Drop any foreign key constraints on session_id if they exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.key_column_usage
        WHERE table_name = 'booking_events' AND column_name = 'session_id'
    ) LOOP
        EXECUTE 'ALTER TABLE public.booking_events DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 1. Change session_id to TEXT
ALTER TABLE public.booking_events ALTER COLUMN session_id TYPE text;

-- 2. Drop NOT NULL constraint
ALTER TABLE public.booking_events ALTER COLUMN session_id DROP NOT NULL;

-- 3. Reload schema cache
NOTIFY pgrst, 'reload';
