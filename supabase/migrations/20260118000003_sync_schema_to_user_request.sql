-- Migration: Sync Schema to User Request
-- Description: Synchronizes the database schema with the user's provided schema definition.
--              Specifically targets notifications, booking_events, and missing tables.

-- 1. Notifications Table
-- Drop existing if compatible to ensure clean slate for the new structure
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type = ANY (ARRAY['mentor'::text, 'mentee'::text])),
  notification_type text NOT NULL CHECK (notification_type = ANY (ARRAY['booking_confirmation'::text, 'booking_reminder'::text, 'booking_cancellation'::text, 'payment_received'::text, 'session_reminder'::text, 'feedback_request'::text])),
  channel text NOT NULL CHECK (channel = ANY (ARRAY['email'::text, 'push'::text, 'sms'::text, 'in_app'::text])),
  subject text,
  title text NOT NULL,
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'failed'::text, 'bounced'::text])),
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- 2. Booking Events Table
DROP TABLE IF EXISTS public.booking_events CASCADE;

CREATE TABLE public.booking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['booking_created'::text, 'notification_sent'::text, 'earnings_created'::text, 'webhook_triggered'::text, 'activity_logged'::text, 'calendar_invite_sent'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'retrying'::text])),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  scheduled_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT booking_events_pkey PRIMARY KEY (id),
  CONSTRAINT booking_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

-- 3. Activity Log (Missing)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  user_type text CHECK (user_type = ANY (ARRAY['mentor'::text, 'mentee'::text])),
  CONSTRAINT activity_log_pkey PRIMARY KEY (id)
);

-- 4. Webhook Events (Missing)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid,
  webhook_url text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'failed'::text])),
  response_status integer,
  response_body text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  next_retry_at timestamp with time zone,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT webhook_events_pkey PRIMARY KEY (id),
  CONSTRAINT webhook_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

-- 5. Other Potential Missing Tables
-- Reschedule Requests
CREATE TABLE IF NOT EXISTS public.reschedule_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  requested_by text NOT NULL CHECK (requested_by = ANY (ARRAY['mentor'::text, 'mentee'::text])),
  original_date timestamp with time zone NOT NULL,
  new_requested_date timestamp with time zone NOT NULL,
  reason text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text])),
  response_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reschedule_requests_pkey PRIMARY KEY (id),
  CONSTRAINT reschedule_requests_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

-- Session Cancellations
CREATE TABLE IF NOT EXISTS public.session_cancellations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  cancelled_by text NOT NULL CHECK (cancelled_by = ANY (ARRAY['mentor'::text, 'mentee'::text, 'system'::text])),
  cancellation_reason text NOT NULL,
  cancelled_at timestamp with time zone NOT NULL DEFAULT now(),
  refund_amount numeric DEFAULT 0,
  refund_status text DEFAULT 'pending'::text CHECK (refund_status = ANY (ARRAY['pending'::text, 'processed'::text, 'declined'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT session_cancellations_pkey PRIMARY KEY (id),
  CONSTRAINT session_cancellations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);

-- Session Notes
CREATE TABLE IF NOT EXISTS public.session_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  notes text NOT NULL,
  note_type text DEFAULT 'session_summary'::text CHECK (note_type = ANY (ARRAY['pre_session'::text, 'session_summary'::text, 'follow_up'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT session_notes_pkey PRIMARY KEY (id),
  CONSTRAINT session_notes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT session_notes_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id)
);

-- Session Requests
CREATE TABLE IF NOT EXISTS public.session_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  requested_date timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  session_type text NOT NULL DEFAULT 'one_on_one'::text,
  message text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text])),
  mentor_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT session_requests_pkey PRIMARY KEY (id),
  CONSTRAINT session_requests_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id),
  CONSTRAINT session_requests_mentee_id_fkey FOREIGN KEY (mentee_id) REFERENCES public.mentee_profiles(id)
);

-- Session Feedback
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  would_recommend boolean DEFAULT true,
  mentor_response text,
  mentor_responded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT session_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT session_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT session_feedback_mentee_id_fkey FOREIGN KEY (mentee_id) REFERENCES public.mentee_profiles(id)
);

-- Payouts
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  amount numeric NOT NULL,
  payout_method text NOT NULL DEFAULT 'bank_transfer'::text,
  payout_details jsonb,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payouts_pkey PRIMARY KEY (id),
  CONSTRAINT payouts_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id)
);
