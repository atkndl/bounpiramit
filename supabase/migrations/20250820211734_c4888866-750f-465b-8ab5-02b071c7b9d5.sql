-- Add image_urls column to events table
ALTER TABLE public.events ADD COLUMN image_urls text[] DEFAULT NULL;