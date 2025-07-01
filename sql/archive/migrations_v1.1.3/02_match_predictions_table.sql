-- Create match_predictions table for user predictions/voting
CREATE TABLE IF NOT EXISTS match_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0),
  confidence_level INTEGER NOT NULL CHECK (confidence_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(match_id, user_email) -- 한 경기당 한 명당 하나의 예측만 허용
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_match_predictions_match_id ON match_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_predictions_user_email ON match_predictions(user_email);
CREATE INDEX IF NOT EXISTS idx_match_predictions_created_at ON match_predictions(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view predictions" ON match_predictions;
DROP POLICY IF EXISTS "Anyone can insert predictions" ON match_predictions;
DROP POLICY IF EXISTS "Users can update their own predictions" ON match_predictions;
DROP POLICY IF EXISTS "Admins can delete predictions" ON match_predictions;

-- Create policies for match_predictions
CREATE POLICY "Anyone can view predictions" ON match_predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert predictions" ON match_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own predictions" ON match_predictions FOR UPDATE USING (true);
CREATE POLICY "Admins can delete predictions" ON match_predictions FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_match_predictions_updated_at ON match_predictions;
CREATE TRIGGER update_match_predictions_updated_at
    BEFORE UPDATE ON match_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();