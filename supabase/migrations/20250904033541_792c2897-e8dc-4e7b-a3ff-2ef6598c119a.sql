-- Enhance profiles table with additional columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Add missing columns to mentor_profiles table
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;

-- Rename columns in mentor_profiles only if they exist with different names
DO $$ 
BEGIN
  -- Check and rename bachelors_university to bachelor_university
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'bachelors_university') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'bachelor_university') THEN
      ALTER TABLE public.mentor_profiles RENAME COLUMN bachelors_university TO bachelor_university;
    END IF;
  END IF;
  
  -- Check and rename bachelors_graduation_year to bachelor_graduation_year
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'bachelors_graduation_year') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'bachelor_graduation_year') THEN
      ALTER TABLE public.mentor_profiles RENAME COLUMN bachelors_graduation_year TO bachelor_graduation_year;
    END IF;
  END IF;
  
  -- Check and rename us_dental_school to dental_school
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'us_dental_school') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'dental_school') THEN
      ALTER TABLE public.mentor_profiles RENAME COLUMN us_dental_school TO dental_school;
    END IF;
  END IF;
  
  -- Check and rename us_dental_school_graduation_year to dental_school_graduation_year
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'us_dental_school_graduation_year') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'dental_school_graduation_year') THEN
      ALTER TABLE public.mentor_profiles RENAME COLUMN us_dental_school_graduation_year TO dental_school_graduation_year;
    END IF;
  END IF;
  
  -- Check and rename years_of_experience to years_experience
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'years_of_experience') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'years_experience') THEN
      ALTER TABLE public.mentor_profiles RENAME COLUMN years_of_experience TO years_experience;
    END IF;
  END IF;
  
  -- Check and rename specialties to specializations
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'specialties') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'specializations') THEN
      ALTER TABLE public.mentor_profiles RENAME COLUMN specialties TO specializations;
    END IF;
  END IF;
  
  -- Check and rename languages to languages_spoken
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'languages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentor_profiles' AND column_name = 'languages_spoken') THEN
      ALTER TABLE public.mentor_profiles RENAME COLUMN languages TO languages_spoken;
    END IF;
  END IF;
END $$;

-- Rename languages column in mentee_profiles if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentee_profiles' AND column_name = 'languages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentee_profiles' AND column_name = 'languages_spoken') THEN
      ALTER TABLE public.mentee_profiles RENAME COLUMN languages TO languages_spoken;
    END IF;
  END IF;
END $$;

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

-- Drop existing policies for mentor_services and recreate them
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

-- Enhanced policies for mentor_profiles
DROP POLICY IF EXISTS "Everyone can view active verified mentors" ON public.mentor_profiles;

CREATE POLICY "Everyone can view active verified mentors" 
ON public.mentor_profiles 
FOR SELECT 
USING (is_active = true AND is_verified = true);

-- Create or replace trigger for mentor_services timestamp updates
DROP TRIGGER IF EXISTS update_mentor_services_updated_at ON public.mentor_services;
CREATE TRIGGER update_mentor_services_updated_at
BEFORE UPDATE ON public.mentor_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user function to create appropriate profiles based on user type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
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