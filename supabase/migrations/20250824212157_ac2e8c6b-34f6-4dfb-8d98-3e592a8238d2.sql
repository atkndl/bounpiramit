-- Add privacy settings and avatar to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_visibility boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS name_display_style text DEFAULT 'full' CHECK (name_display_style IN ('full', 'abbreviated'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_visibility ON public.profiles(email_visibility);
CREATE INDEX IF NOT EXISTS idx_profiles_name_display_style ON public.profiles(name_display_style);