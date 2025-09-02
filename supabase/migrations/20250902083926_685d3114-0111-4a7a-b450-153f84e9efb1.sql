-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'message', 'comment')),
  content TEXT NOT NULL,
  item_id UUID,
  from_user_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_content TEXT,
  p_item_id UUID DEFAULT NULL,
  p_from_user_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Don't create notification if user is notifying themselves
  IF p_user_id = p_from_user_id THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (user_id, type, content, item_id, from_user_id)
  VALUES (p_user_id, p_type, p_content, p_item_id, p_from_user_id);
END;
$$;

-- Trigger for like notifications
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id UUID;
  liker_name TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Get liker name
  SELECT COALESCE(full_name, 'Bir kullanıcı') INTO liker_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Create notification
  PERFORM create_notification(
    post_owner_id,
    'like',
    liker_name || ' gönderinizi beğendi',
    NEW.post_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$;

-- Trigger for message notifications
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get sender name
  SELECT COALESCE(full_name, 'Bir kullanıcı') INTO sender_name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  -- Create notification
  PERFORM create_notification(
    NEW.recipient_id,
    'message',
    sender_name || ' size mesaj gönderdi',
    NEW.id,
    NEW.sender_id
  );

  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_like_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_like();

CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;