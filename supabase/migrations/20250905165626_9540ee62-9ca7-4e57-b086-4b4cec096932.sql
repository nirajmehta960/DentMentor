-- Add duration field to mentor_availability table
ALTER TABLE public.mentor_availability 
ADD COLUMN duration_minutes integer DEFAULT 60;

-- Add is_read field for activity tracking
-- First create an activity_log table since it doesn't exist yet
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_log
CREATE POLICY "Mentors can view their own activity" 
ON public.activity_log 
FOR SELECT 
USING (mentor_id IN (
  SELECT mentor_profiles.id 
  FROM mentor_profiles 
  WHERE mentor_profiles.user_id = auth.uid()
));

CREATE POLICY "Mentors can update their own activity" 
ON public.activity_log 
FOR UPDATE 
USING (mentor_id IN (
  SELECT mentor_profiles.id 
  FROM mentor_profiles 
  WHERE mentor_profiles.user_id = auth.uid()
));

-- Create mentor_services table for service pricing
CREATE TABLE public.mentor_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID,
  service_type TEXT NOT NULL DEFAULT 'single',
  service_title TEXT NOT NULL,
  service_description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price INTEGER NOT NULL, -- price in cents
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentor_services
ALTER TABLE public.mentor_services ENABLE ROW LEVEL SECURITY;

-- Create policies for mentor_services
CREATE POLICY "Everyone can view active services" 
ON public.mentor_services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Mentors can manage their own services" 
ON public.mentor_services 
FOR ALL 
USING (mentor_id IN (
  SELECT mentor_profiles.id 
  FROM mentor_profiles 
  WHERE mentor_profiles.user_id = auth.uid()
));

-- Add trigger for updated_at on activity_log
CREATE TRIGGER update_activity_log_updated_at
  BEFORE UPDATE ON public.activity_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on mentor_services  
CREATE TRIGGER update_mentor_services_updated_at
  BEFORE UPDATE ON public.mentor_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();