-- Create RPC functions for event participant management
CREATE OR REPLACE FUNCTION public.increment_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = current_participants + 1 
  WHERE id = event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = GREATEST(0, current_participants - 1) 
  WHERE id = event_id;
END;
$$;