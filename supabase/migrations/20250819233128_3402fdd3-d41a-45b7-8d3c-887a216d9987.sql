-- Create a hook for lost items data
-- Update lost_items table to match the interface and add needed columns

-- First let's add any missing columns and update the structure
ALTER TABLE lost_items 
ADD COLUMN IF NOT EXISTS item_type text DEFAULT 'lost' CHECK (item_type IN ('lost', 'found'));

-- Update existing data to use new column
UPDATE lost_items SET item_type = 
  CASE 
    WHEN is_found THEN 'found'
    ELSE 'lost'
  END;

-- Add image_urls array column to support multiple images
ALTER TABLE lost_items 
ADD COLUMN IF NOT EXISTS image_urls text[];

-- Update single image_url to array format
UPDATE lost_items 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_urls IS NULL;