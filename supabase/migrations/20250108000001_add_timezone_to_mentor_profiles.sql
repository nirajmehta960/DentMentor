-- Add timezone column to mentor_profiles table
-- This allows mentors to set their local timezone for availability display

ALTER TABLE public.mentor_profiles
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT NULL;

-- Update existing records to use browser timezone detection default
-- Or set to UTC if not set (can be updated in profile settings later)
UPDATE public.mentor_profiles
SET timezone = 'UTC'
WHERE timezone IS NULL;

-- Add comment
COMMENT ON COLUMN public.mentor_profiles.timezone IS 
  'IANA timezone string (e.g., "America/New_York", "Europe/London") for displaying dates and times in mentor dashboard. Defaults to UTC.';
