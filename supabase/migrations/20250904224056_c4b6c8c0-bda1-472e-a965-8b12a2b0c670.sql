-- Update handle_new_user function to handle existing profiles gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with ON CONFLICT DO NOTHING to prevent duplicates
  INSERT INTO public.profiles (user_id, first_name, last_name, user_type)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'mentee')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    user_type = EXCLUDED.user_type,
    updated_at = now();
  
  -- Create mentor profile if user_type is mentor (only if doesn't exist)
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'mentee') = 'mentor' THEN
    INSERT INTO public.mentor_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Create mentee profile if user_type is mentee (only if doesn't exist)
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'mentee') = 'mentee' THEN
    INSERT INTO public.mentee_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;