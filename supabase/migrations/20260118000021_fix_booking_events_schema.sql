-- Migration: Fix Booking Events Schema
-- Description: Ensures reservation_id column exists and reloads schema cache.

DO $$
BEGIN
    -- 1. Ensure reservation_id column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'booking_events'
        AND column_name = 'reservation_id'
    ) THEN
        ALTER TABLE public.booking_events
        ADD COLUMN reservation_id uuid;
    END IF;

    -- 2. Ensure index exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'booking_events'
        AND indexname = 'booking_events_reservation_id_idx'
    ) THEN
        CREATE INDEX booking_events_reservation_id_idx
        ON public.booking_events (reservation_id);
    END IF;
END $$;

-- 3. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload';
