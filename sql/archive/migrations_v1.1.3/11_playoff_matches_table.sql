-- Playoff matches table for tournament knockout stage
-- This table stores playoff/tournament matches separate from regular season matches

CREATE TABLE IF NOT EXISTS playoff_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    round VARCHAR(50) NOT NULL, -- 'quarter-final', 'semi-final', 'final', etc.
    match_number INTEGER NOT NULL, -- Position within the round
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    match_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed'
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    next_match_id UUID REFERENCES playoff_matches(id) ON DELETE SET NULL, -- For tournament bracket progression
    is_home_team BOOLEAN, -- Whether the winner advances as home team in next match
    man_of_the_match_id UUID REFERENCES players(id) ON DELETE SET NULL,
    youtube_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playoff_matches_competition_id ON playoff_matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_playoff_matches_home_team_id ON playoff_matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_playoff_matches_away_team_id ON playoff_matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_playoff_matches_round ON playoff_matches(round);
CREATE INDEX IF NOT EXISTS idx_playoff_matches_winner ON playoff_matches(winner_team_id);

-- Create updated_at trigger
CREATE TRIGGER update_playoff_matches_updated_at BEFORE UPDATE ON playoff_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE playoff_matches IS 'Stores playoff/tournament matches for knockout stage games';