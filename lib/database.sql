-- KOPRI CUP 축구 리그 관리 시스템 데이터베이스 스키마

-- 1. competitions 테이블 (대회 정보)
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. teams 테이블 (팀 정보)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. players 테이블 (선수 정보)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(50),
  jersey_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- 4. matches 테이블 (경기 정보)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  match_date TIMESTAMP WITH TIME ZONE,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_teams_competition ON teams(competition_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_matches_competition ON matches(competition_id);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_date ON matches(match_date);

-- RLS (Row Level Security) 활성화
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Enable read access for all users" ON competitions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON players FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON matches FOR SELECT USING (true);

-- 관리자 권한 정책 (나중에 인증 시스템 추가 시 수정)
CREATE POLICY "Enable all access for authenticated users" ON competitions FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON teams FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON players FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON matches FOR ALL USING (true);

-- 초기 데이터 삽입 (제 1회 KOPRI CUP)
INSERT INTO competitions (name, description, start_date, end_date) 
VALUES (
  '제 1회 KOPRI CUP',
  '한국극지연구소 첫 번째 축구 대회',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
);