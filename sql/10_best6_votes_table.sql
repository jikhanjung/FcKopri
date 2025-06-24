-- Best6 votes table modifications for existing table
-- Note: This table already exists from 07_mvp_votes_table.sql with different column names
-- This file adds missing competition_id column and creates proper indexes

-- Add competition_id column to existing best6_votes table
-- (Table structure: id, voter_ip, voted_player_id, position_type, position_slot, created_at)
ALTER TABLE best6_votes 
ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE;

-- Update existing data with default competition_id if any exists
UPDATE best6_votes 
SET competition_id = (SELECT id FROM competitions LIMIT 1)
WHERE competition_id IS NULL;

-- Create indexes for better performance (using actual column names)
CREATE INDEX IF NOT EXISTS idx_best6_votes_competition_id ON best6_votes(competition_id);
CREATE INDEX IF NOT EXISTS idx_best6_votes_voted_player_id ON best6_votes(voted_player_id);
CREATE INDEX IF NOT EXISTS idx_best6_votes_position_type ON best6_votes(position_type);

-- Comment on table
COMMENT ON TABLE best6_votes IS 'Stores votes for Best 6 players by position - 1 forward, 2 midfielders, 2 defenders, 1 goalkeeper';