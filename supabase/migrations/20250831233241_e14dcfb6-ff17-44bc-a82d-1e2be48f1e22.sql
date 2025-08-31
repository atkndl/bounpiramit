-- Create messages table for DM system
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they sent or received" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent or received" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can delete messages they sent" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create event_participants table for tracking who joined events
CREATE TABLE public.event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for event participants
CREATE POLICY "Anyone can view event participants" 
ON public.event_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join events" 
ON public.event_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events they joined" 
ON public.event_participants 
FOR DELETE 
USING (auth.uid() = user_id);