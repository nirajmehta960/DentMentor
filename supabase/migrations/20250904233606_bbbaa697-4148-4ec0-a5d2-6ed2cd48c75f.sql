-- Create sessions table for tracking all mentoring sessions
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  session_date timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  session_type text NOT NULL DEFAULT 'one_on_one',
  price_paid numeric(10,2),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes text,
  meeting_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (mentee_id) REFERENCES mentee_profiles(id) ON DELETE CASCADE
);

-- Create session requests table for pending session bookings
CREATE TABLE public.session_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  requested_date timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  session_type text NOT NULL DEFAULT 'one_on_one',
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  mentor_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (mentee_id) REFERENCES mentee_profiles(id) ON DELETE CASCADE
);

-- Create mentor availability table
CREATE TABLE public.mentor_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL,
  date date NOT NULL,
  time_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_recurring boolean DEFAULT false,
  recurring_pattern text,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  UNIQUE(mentor_id, date)
);

-- Create session notes table
CREATE TABLE public.session_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  notes text NOT NULL,
  note_type text DEFAULT 'session_summary' CHECK (note_type IN ('pre_session', 'session_summary', 'follow_up')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id) ON DELETE CASCADE
);

-- Create messages table for mentor-mentee communication
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  session_id uuid,
  message_text text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'session_reminder')),
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create earnings table
CREATE TABLE public.earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL,
  session_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) DEFAULT 0,
  net_amount numeric(10,2) NOT NULL,
  earning_date timestamp with time zone NOT NULL DEFAULT now(),
  payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create payouts table
CREATE TABLE public.payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  payout_method text NOT NULL DEFAULT 'bank_transfer',
  payout_details jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL,
  session_id uuid,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earning', 'payout', 'refund', 'adjustment')),
  amount numeric(10,2) NOT NULL,
  description text,
  reference_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create session feedback table
CREATE TABLE public.session_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  would_recommend boolean DEFAULT true,
  mentor_response text,
  mentor_responded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (mentee_id) REFERENCES mentee_profiles(id) ON DELETE CASCADE
);

-- Create session cancellations table
CREATE TABLE public.session_cancellations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  cancelled_by text NOT NULL CHECK (cancelled_by IN ('mentor', 'mentee', 'system')),
  cancellation_reason text NOT NULL,
  cancelled_at timestamp with time zone NOT NULL DEFAULT now(),
  refund_amount numeric(10,2) DEFAULT 0,
  refund_status text DEFAULT 'pending' CHECK (refund_status IN ('pending', 'processed', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create reschedule requests table
CREATE TABLE public.reschedule_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  requested_by text NOT NULL CHECK (requested_by IN ('mentor', 'mentee')),
  original_date timestamp with time zone NOT NULL,
  new_requested_date timestamp with time zone NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  response_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Mentors can view their sessions" ON public.sessions FOR SELECT USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentees can view their sessions" ON public.sessions FOR SELECT USING (mentee_id IN (SELECT id FROM mentee_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentors can update their sessions" ON public.sessions FOR UPDATE USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- RLS Policies for session_requests
CREATE POLICY "Mentors can view their session requests" ON public.session_requests FOR SELECT USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentees can view their session requests" ON public.session_requests FOR SELECT USING (mentee_id IN (SELECT id FROM mentee_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentors can update session requests" ON public.session_requests FOR UPDATE USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentees can create session requests" ON public.session_requests FOR INSERT WITH CHECK (mentee_id IN (SELECT id FROM mentee_profiles WHERE user_id = auth.uid()));

-- RLS Policies for mentor_availability
CREATE POLICY "Mentors can manage their availability" ON public.mentor_availability FOR ALL USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Everyone can view mentor availability" ON public.mentor_availability FOR SELECT USING (is_available = true);

-- RLS Policies for session_notes
CREATE POLICY "Mentors can manage session notes" ON public.session_notes FOR ALL USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for earnings
CREATE POLICY "Mentors can view their earnings" ON public.earnings FOR SELECT USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- RLS Policies for payouts
CREATE POLICY "Mentors can manage their payouts" ON public.payouts FOR ALL USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- RLS Policies for transactions
CREATE POLICY "Mentors can view their transactions" ON public.transactions FOR SELECT USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- RLS Policies for session_feedback
CREATE POLICY "Mentors can view feedback for their sessions" ON public.session_feedback FOR SELECT USING (
  session_id IN (SELECT id FROM sessions WHERE mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Mentors can respond to feedback" ON public.session_feedback FOR UPDATE USING (
  session_id IN (SELECT id FROM sessions WHERE mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Mentees can create feedback" ON public.session_feedback FOR INSERT WITH CHECK (mentee_id IN (SELECT id FROM mentee_profiles WHERE user_id = auth.uid()));

-- RLS Policies for session_cancellations
CREATE POLICY "Users can view session cancellations" ON public.session_cancellations FOR SELECT USING (
  session_id IN (
    SELECT id FROM sessions WHERE 
    mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()) OR
    mentee_id IN (SELECT id FROM mentee_profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for reschedule_requests
CREATE POLICY "Users can view reschedule requests" ON public.reschedule_requests FOR SELECT USING (
  session_id IN (
    SELECT id FROM sessions WHERE 
    mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()) OR
    mentee_id IN (SELECT id FROM mentee_profiles WHERE user_id = auth.uid())
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_session_requests_updated_at BEFORE UPDATE ON public.session_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentor_availability_updated_at BEFORE UPDATE ON public.mentor_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_session_notes_updated_at BEFORE UPDATE ON public.session_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_session_feedback_updated_at BEFORE UPDATE ON public.session_feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reschedule_requests_updated_at BEFORE UPDATE ON public.reschedule_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_sessions_mentor_id ON public.sessions(mentor_id);
CREATE INDEX idx_sessions_mentee_id ON public.sessions(mentee_id);
CREATE INDEX idx_sessions_date ON public.sessions(session_date);
CREATE INDEX idx_session_requests_mentor_id ON public.session_requests(mentor_id);
CREATE INDEX idx_session_requests_status ON public.session_requests(status);
CREATE INDEX idx_mentor_availability_mentor_date ON public.mentor_availability(mentor_id, date);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_earnings_mentor_id ON public.earnings(mentor_id);
CREATE INDEX idx_transactions_mentor_id ON public.transactions(mentor_id);