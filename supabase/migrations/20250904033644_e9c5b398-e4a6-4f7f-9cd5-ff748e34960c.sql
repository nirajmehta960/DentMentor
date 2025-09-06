-- Enhance profiles table with additional columns (safe to run multiple times)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Add missing columns to mentor_profiles table (safe to run multiple times)
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;

-- Create mentor_services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mentor_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  service_description TEXT,
  price INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  service_type TEXT DEFAULT 'single', -- 'single' or 'package'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on mentor_services
ALTER TABLE public.mentor_services ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies for mentor_services
DROP POLICY IF EXISTS "Mentors can manage their own services" ON public.mentor_services;
DROP POLICY IF EXISTS "Everyone can view active services" ON public.mentor_services;

CREATE POLICY "Mentors can manage their own services" 
ON public.mentor_services 
FOR ALL 
USING (
  mentor_id IN (
    SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view active services" 
ON public.mentor_services 
FOR SELECT 
USING (is_active = true);

-- Enhanced policies for mentor_profiles - drop and recreate
DROP POLICY IF EXISTS "Users can view their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Users can update their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Users can create their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Everyone can view active verified mentors" ON public.mentor_profiles;

CREATE POLICY "Users can view their own mentor profile" 
ON public.mentor_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active verified mentors" 
ON public.mentor_profiles 
FOR SELECT 
USING (is_active = true AND is_verified = true);

CREATE POLICY "Users can create their own mentor profile" 
ON public.mentor_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor profile" 
ON public.mentor_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create/update trigger for mentor_services timestamp updates
DROP TRIGGER IF EXISTS update_mentor_services_updated_at ON public.mentor_services;
CREATE TRIGGER update_mentor_services_updated_at
BEFORE UPDATE ON public.mentor_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to create appropriate profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, user_type)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'student')
  );
  
  -- Create mentor profile if user_type is mentor
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'student') = 'mentor' THEN
    INSERT INTO public.mentor_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  -- Create mentee profile if user_type is student
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'student') = 'student' THEN
    INSERT INTO public.mentee_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create/update trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();