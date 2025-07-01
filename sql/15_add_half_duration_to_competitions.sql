-- Add half duration setting to competitions table
-- This allows setting custom half duration for each competition (both halves have same duration)

ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS half_duration_minutes INTEGER DEFAULT 45;

-- Add comment for documentation
COMMENT ON COLUMN competitions.half_duration_minutes IS 'Duration of each half in minutes (both halves have same duration)';

-- Update existing competition with default 45 minutes per half if exists
UPDATE competitions 
SET half_duration_minutes = 45 
WHERE half_duration_minutes IS NULL;