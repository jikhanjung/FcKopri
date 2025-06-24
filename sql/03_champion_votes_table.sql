-- Create champion_votes table for championship voting
CREATE TABLE IF NOT EXISTS champion_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT,
  voted_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  confidence_level INTEGER NOT NULL CHECK (confidence_level BETWEEN 1 AND 5),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_email) -- 한 명당 하나의 투표만 허용
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_champion_votes_team_id ON champion_votes(voted_team_id);
CREATE INDEX IF NOT EXISTS idx_champion_votes_user_email ON champion_votes(user_email);
CREATE INDEX IF NOT EXISTS idx_champion_votes_created_at ON champion_votes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE champion_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view champion votes" ON champion_votes;
DROP POLICY IF EXISTS "Anyone can insert champion votes" ON champion_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON champion_votes;
DROP POLICY IF EXISTS "Admins can delete votes" ON champion_votes;

-- Create policies for champion_votes
CREATE POLICY "Anyone can view champion votes" ON champion_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert champion votes" ON champion_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own votes" ON champion_votes FOR UPDATE USING (true);
CREATE POLICY "Admins can delete votes" ON champion_votes FOR DELETE USING (true);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_champion_votes_updated_at ON champion_votes;
CREATE TRIGGER update_champion_votes_updated_at
    BEFORE UPDATE ON champion_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();