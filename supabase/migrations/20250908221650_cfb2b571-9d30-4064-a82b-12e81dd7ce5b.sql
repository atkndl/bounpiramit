-- Add updated_at trigger for messages table
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages to realtime publication if not already added
INSERT INTO supabase_realtime.subscription (subscription_id, entity, filters, claims, created_at)
SELECT 
    gen_random_uuid(),
    'public.messages',
    '[]'::jsonb,
    '{"role": "authenticated"}'::jsonb,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM supabase_realtime.subscription 
    WHERE entity = 'public.messages'
);