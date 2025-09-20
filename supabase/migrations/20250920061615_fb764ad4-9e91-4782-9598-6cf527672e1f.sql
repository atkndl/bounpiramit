-- Add directory_visibility column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN directory_visibility BOOLEAN DEFAULT true;

-- Update the column to have a proper comment
COMMENT ON COLUMN public.profiles.directory_visibility IS 'Controls whether user appears in the member directory';