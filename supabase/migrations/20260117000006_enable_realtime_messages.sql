-- Enable replication for messages table to support Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Ignore if already exists
  END;
END $$;
