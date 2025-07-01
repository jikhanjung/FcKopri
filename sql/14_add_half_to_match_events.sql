-- Add half column to match_events table
-- This allows tracking whether events occurred in first or second half

ALTER TABLE match_events 
ADD COLUMN IF NOT EXISTS half VARCHAR(10) DEFAULT 'first';

-- Add comment for documentation
COMMENT ON COLUMN match_events.half IS 'Match half: first or second';

-- Create index for better performance when filtering by half
CREATE INDEX IF NOT EXISTS idx_match_events_half ON match_events(half);