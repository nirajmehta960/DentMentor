-- Migration: Schedule Hold Cleanup Job
-- Description: Enables pg_cron and schedules the release_expired_holds function to run every 5 minutes.

-- 1. Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 2. Schedule the job
-- We wrap in a DO block to ensure idempotency (avoid duplicate schedules if run multiple times)
DO $$
BEGIN
  -- Check if specific schedule exists, if so, unschedule it to ensure we update it
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'release-expired-holds') THEN
     PERFORM cron.unschedule('release-expired-holds');
  END IF;

  -- Schedule the job to run every 5 minutes
  PERFORM cron.schedule(
    'release-expired-holds', -- job name
    '*/5 * * * *',           -- schedule (every 5 mins)
    'SELECT public.release_expired_holds()' -- command
  );
END;
$$;
