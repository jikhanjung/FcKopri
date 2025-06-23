-- Create match_events table for real-time match tracking
CREATE TABLE match_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('goal', 'assist', 'substitution', 'card')),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  assist_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  minute INTEGER NOT NULL CHECK (minute >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_match_events_player_id ON match_events(player_id);
CREATE INDEX idx_match_events_team_id ON match_events(team_id);
CREATE INDEX idx_match_events_type ON match_events(type);
CREATE INDEX idx_match_events_minute ON match_events(minute);

-- Enable RLS (Row Level Security)
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Create policies for match_events
CREATE POLICY "Anyone can view match events" ON match_events FOR SELECT USING (true);
CREATE POLICY "Admins can insert match events" ON match_events FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update match events" ON match_events FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete match events" ON match_events FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');