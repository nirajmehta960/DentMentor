-- Migration: Add Webhook Idempotency (booking_events)
-- Description: Creates booking_events table to track Stripe webhooks and prevent duplicate processing.

-- 1. Create booking_events table if it doesn't exist
-- 1. Create booking_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.booking_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    reservation_id uuid,
    session_id text,
    event_type text NOT NULL,
    stripe_event_id text,
    status text NOT NULL DEFAULT 'processing',
    payload jsonb,
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT booking_events_pkey PRIMARY KEY (id)
);

-- 1b. Ensure columns exist (Safeguard for existing table with wrong schema)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_events' AND column_name = 'stripe_event_id') THEN
        ALTER TABLE public.booking_events ADD COLUMN stripe_event_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_events' AND column_name = 'reservation_id') THEN
        ALTER TABLE public.booking_events ADD COLUMN reservation_id uuid;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_events' AND column_name = 'session_id') THEN
        ALTER TABLE public.booking_events ADD COLUMN session_id text;
    END IF;

     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_events' AND column_name = 'event_type') THEN
        ALTER TABLE public.booking_events ADD COLUMN event_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_events' AND column_name = 'status') THEN
        ALTER TABLE public.booking_events ADD COLUMN status text DEFAULT 'processing';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_events' AND column_name = 'payload') THEN
        ALTER TABLE public.booking_events ADD COLUMN payload jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_events' AND column_name = 'error_message') THEN
        ALTER TABLE public.booking_events ADD COLUMN error_message text;
    END IF;
END $$;

-- 2. Add unique index on stripe_event_id
-- We use a unique index to enforce idempotency at the DB level.
-- If an insert attempts to reuse the same stripe_event_id, it will fail.
CREATE UNIQUE INDEX IF NOT EXISTS booking_events_stripe_event_id_key 
ON public.booking_events (stripe_event_id);

-- 3. Add index on reservation_id for lookups
CREATE INDEX IF NOT EXISTS booking_events_reservation_id_idx 
ON public.booking_events (reservation_id);

-- 4. Enable RLS (Security Best Practice)
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Only service role should access this usually, but good to have)
-- Allow service role full access
CREATE POLICY "Service role full access on booking_events"
ON public.booking_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
