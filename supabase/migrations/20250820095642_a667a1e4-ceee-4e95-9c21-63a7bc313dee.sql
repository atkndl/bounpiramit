-- Create sports_activities table
CREATE TABLE public.sports_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  category text NOT NULL DEFAULT 'other',
  activity_type text NOT NULL DEFAULT 'event',
  organizer text,
  activity_date timestamp with time zone,
  activity_time text,
  max_participants integer,
  current_participants integer NOT NULL DEFAULT 0,
  contact_info text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sports_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active sports activities" 
ON public.sports_activities 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create sports activities" 
ON public.sports_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sports activities" 
ON public.sports_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sports activities" 
ON public.sports_activities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_sports_activities_updated_at
BEFORE UPDATE ON public.sports_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();