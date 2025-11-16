-- Add email tracking columns to booking_reservations
ALTER TABLE public.booking_reservations
ADD COLUMN IF NOT EXISTS mentee_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS mentor_email_sent_at timestamptz;
