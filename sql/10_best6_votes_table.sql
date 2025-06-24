-- Best6 votes table for position-based voting
-- This table stores votes for Best 6 players by position in the tournament

CREATE TABLE IF NOT EXISTS best6_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    position VARCHAR(50) NOT NULL, -- 'forward', 'midfielder', 'defender', 'goalkeeper'
    user_ip VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(competition_id, position, user_ip)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_best6_votes_competition_id ON best6_votes(competition_id);
CREATE INDEX IF NOT EXISTS idx_best6_votes_player_id ON best6_votes(player_id);
CREATE INDEX IF NOT EXISTS idx_best6_votes_position ON best6_votes(position);

-- Comment on table
COMMENT ON TABLE best6_votes IS 'Stores votes for Best 6 players by position - 1 forward, 2 midfielders, 2 defenders, 1 goalkeeper';