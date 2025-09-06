-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  user_type TEXT DEFAULT 'mentor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor profiles table for detailed mentor information
CREATE TABLE public.mentor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Step 1: Professional Profile
  profile_photo_url TEXT,
  professional_headline TEXT,
  professional_bio TEXT,
  country_of_origin TEXT,
  years_of_experience INTEGER,
  linkedin_url TEXT,
  
  -- Step 2: Education Background
  bachelors_university TEXT,
  bachelors_graduation_year INTEGER,
  us_dental_school TEXT,
  us_dental_school_graduation_year INTEGER,
  current_status TEXT CHECK (current_status IN ('Current Student', 'Graduate')),
  
  -- Step 3: Specialties & Languages
  specialties TEXT[], -- Array of specialties
  languages TEXT[], -- Array of languages
  hourly_rate DECIMAL(10,2),
  availability_preference TEXT,
  
  -- Step 4: Services Offered (stored as JSON)
  services JSONB DEFAULT '[]'::jsonb,
  
  -- Step 5: Verification (optional)
  degree_certificate_url TEXT,
  admission_letter_url TEXT,
  student_id_url TEXT,
  verification_status TEXT DEFAULT 'pending',
  
  -- Onboarding tracking
  onboarding_step INTEGER DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('mentor-photos', 'mentor-photos', true),
  ('mentor-documents', 'mentor-documents', false);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for mentor_profiles table
CREATE POLICY "Users can view their own mentor profile" 
ON public.mentor_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mentor profile" 
ON public.mentor_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor profile" 
ON public.mentor_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Storage policies for mentor photos (public)
CREATE POLICY "Mentor photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mentor-photos');

CREATE POLICY "Users can upload their own mentor photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'mentor-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own mentor photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'mentor-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own mentor photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'mentor-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for mentor documents (private)
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mentor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'mentor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'mentor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'mentor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, user_type)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'mentor')
  );
  
  -- Create mentor profile if user_type is mentor
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'mentor') = 'mentor' THEN
    INSERT INTO public.mentor_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();