-- Create campus density tracking table
CREATE TABLE public.campus_density (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('very_crowded', 'normal', 'available', 'closed')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campus_density ENABLE ROW LEVEL SECURITY;

-- Anyone can view density status
CREATE POLICY "Anyone can view campus density" 
ON public.campus_density 
FOR SELECT 
USING (true);

-- Only admins can update density status
CREATE POLICY "Admins can update campus density" 
ON public.campus_density 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert new areas
CREATE POLICY "Admins can insert campus density" 
ON public.campus_density 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_campus_density_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_campus_density_updated_at
BEFORE UPDATE ON public.campus_density
FOR EACH ROW
EXECUTE FUNCTION public.update_campus_density_updated_at();

-- Insert initial campus areas
INSERT INTO public.campus_density (area_name, status) VALUES
  ('Kuzey Yemekhane', 'available'),
  ('Kuzey Paket Yemek', 'normal'),
  ('Ruby', 'available'),
  ('Kütüphane', 'normal'),
  ('Güney Yemekhane', 'available'),
  ('Güney Paket Yemek', 'closed');