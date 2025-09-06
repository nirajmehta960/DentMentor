-- Create mentee_profiles table for mentee onboarding
CREATE TABLE public.mentee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Step 1: Personal Information
  profile_photo_url TEXT,
  citizenship_country TEXT,
  current_location TEXT,
  highest_degree TEXT,
  university_name TEXT,
  graduation_year INTEGER,
  languages TEXT[],
  -- Step 2: Exams & Timeline
  inbde_status TEXT,
  english_exam TEXT,
  english_score INTEGER,
  target_programs TEXT[],
  -- Step 3: Goals & Preferences
  help_needed TEXT[],
  target_schools TEXT[],
  preferred_session_times TEXT[],
  referral_source TEXT,
  -- Onboarding tracking
  onboarding_step INTEGER DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mentee_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own mentee profile" 
ON public.mentee_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mentee profile" 
ON public.mentee_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentee profile" 
ON public.mentee_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mentee_profiles_updated_at
BEFORE UPDATE ON public.mentee_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();