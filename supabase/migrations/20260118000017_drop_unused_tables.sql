-- Drop unused tables
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.session_cancellations CASCADE;
DROP TABLE IF EXISTS public.reschedule_requests CASCADE;
DROP TABLE IF EXISTS public.session_notes CASCADE;

-- Also drop any triggers that might have been attached to these tables
-- (CASCADE usually handles this, but good to be explicit/safe)
