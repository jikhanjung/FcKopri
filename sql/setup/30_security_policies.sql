-- Security policies and Row Level Security (RLS) setup
-- Currently RLS is disabled for FcKopri as it uses client-side admin authentication

-- Disable RLS for all tables (current setup)
ALTER TABLE competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE playoff_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE champion_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE best6_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions DISABLE ROW LEVEL SECURITY;

-- Grant access to anonymous users (current setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Grant access to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Note: If you want to enable RLS in the future, you would:
-- 1. Enable RLS on tables: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- 2. Create policies for read/write access
-- 3. Update the authentication system to use Supabase Auth instead of client-side auth