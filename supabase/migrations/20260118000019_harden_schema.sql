-- Migration: Harden Schema (Types & Constraints)
-- Description: Fixes array types, adds double-booking constraints, and ensures data integrity.

-- 1. Fix Array Column Definitions
-- Change languages_spoken to explicit text[] if it exists
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mentor_profiles' 
        AND column_name = 'languages_spoken'
    ) THEN
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN languages_spoken TYPE text[] USING languages_spoken::text[];
        
        -- Set default if missing
        ALTER TABLE public.mentor_profiles 
        ALTER COLUMN languages_spoken SET DEFAULT '{}'::text[];
    END IF;
END $$;

-- 2. Double-Booking Safety Net
-- Create a partial unique index to prevent multiple active reservations for the same slot.
-- Covered statuses: held, pending_payment, confirmed, paid.
-- Ignored statuses: cancelled, expired.
CREATE UNIQUE INDEX IF NOT EXISTS booking_reservations_active_slot_idx
ON public.booking_reservations (mentor_availability_id, slot_start_time)
WHERE status IN ('held', 'pending_payment', 'confirmed', 'paid');

-- 3. Webhook Idempotency Support (Redundant check if file 18 applied, but safe)
-- Ensure booking_events has stripe_event_id unique index
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_events'
    ) THEN
        -- Add column if missing (unlikely if created correctly)
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'booking_events' 
            AND column_name = 'stripe_event_id'
        ) THEN
            ALTER TABLE public.booking_events ADD COLUMN stripe_event_id text;
        END IF;

        -- Add unique index
        CREATE UNIQUE INDEX IF NOT EXISTS booking_events_stripe_id_uq 
        ON public.booking_events (stripe_event_id);
    END IF;
END $$;

-- 4. Notifications Type Safety
-- Ensure notifications.type is constrained.
-- If it's a text column (legacy), add a check constraint. 
-- If it's an enum (new migration), it's already safe.
DO $$ 
BEGIN
    -- Check if column is text
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'type' 
        AND data_type = 'text'
    ) THEN
        -- Add constraint if not exists
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conname = 'notifications_type_check'
        ) THEN
            ALTER TABLE public.notifications 
            ADD CONSTRAINT notifications_type_check 
            CHECK (type IN ('session_booked', 'payment_received', 'feedback_received', 'system'));
        END IF;
    END IF;
END $$;
