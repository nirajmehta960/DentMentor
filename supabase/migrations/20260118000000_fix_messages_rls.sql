-- Enable users to mark their received messages as read
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can update their received messages'
  ) THEN
    CREATE POLICY "Users can update their received messages" ON public.messages
      FOR UPDATE
      USING (recipient_id = auth.uid())
      WITH CHECK (recipient_id = auth.uid());
  END IF;
END $$;
