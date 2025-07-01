-- FcKopri Complete Database Schema v1.1.3
-- 제 1회 KOPRI CUP 완전한 축구 리그 관리 시스템
-- 생성일: 2025-07-01
-- 
-- 이 파일은 v1.1.3까지의 모든 기능을 포함한 완전한 스키마입니다.
-- 새로운 환경에서 전체 데이터베이스를 구축할 때 사용하세요.

-- ============================================================================
-- 1. 기본 테이블 생성 (competitions, teams, players, matches)
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  half_duration_minutes INTEGER DEFAULT 25 -- 전반 시간 (분)
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  competition_id UUID REFERENCES competitions(id),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_hidden BOOLEAN DEFAULT FALSE -- 팀 숨김 기능 (무소속 팀용)
);

CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  team_id UUID REFERENCES teams(id),
  position VARCHAR(100),
  department VARCHAR(255),
  jersey_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  match_date TIMESTAMP WITH TIME ZONE,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  man_of_the_match_id UUID REFERENCES players(id), -- Man of the Match
  youtube_url TEXT, -- 유튜브 URL
  youtube_title TEXT, -- 유튜브 제목
  youtube_thumbnail_url TEXT, -- 유튜브 썸네일 URL
  youtube_duration TEXT -- 유튜브 영상 길이
);

-- ============================================================================
-- 2. 경기 이벤트 시스템 (실시간 골/어시스트, 전반/후반 관리)
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  type TEXT NOT NULL,
  player_id UUID NOT NULL,
  assist_player_id UUID NULL,
  team_id UUID NOT NULL,
  minute INTEGER NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  half CHARACTER VARYING(10) NULL DEFAULT 'first'::character varying,
  CONSTRAINT match_events_pkey PRIMARY KEY (id),
  CONSTRAINT match_events_match_id_fkey FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,
  CONSTRAINT match_events_assist_player_id_fkey FOREIGN KEY (assist_player_id) REFERENCES players (id) ON DELETE SET NULL,
  CONSTRAINT match_events_player_id_fkey FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
  CONSTRAINT match_events_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
  CONSTRAINT match_events_minute_check CHECK ((minute >= 0)),
  CONSTRAINT match_events_type_check CHECK (
    (
      type = ANY (
        ARRAY[
          'goal'::text,
          'assist'::text,
          'substitution'::text,
          'card'::text
        ]
      )
    )
  )
);

-- ============================================================================
-- 3. 예측 및 투표 시스템
-- ============================================================================

-- 경기 예측 테이블
CREATE TABLE IF NOT EXISTS match_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, user_ip)
);

-- 우승팀 투표 테이블
CREATE TABLE IF NOT EXISTS champion_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,
  confidence_level INTEGER DEFAULT 5, -- 1-10 확신도
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_ip)
);

-- MVP 투표 테이블 (IP 기반 중복 방지)
CREATE TABLE IF NOT EXISTS mvp_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_ip)
);

-- 베스트6 투표 테이블 (포지션별)
CREATE TABLE IF NOT EXISTS best6_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_ip VARCHAR(45) NOT NULL,
  goalkeeper_id UUID REFERENCES players(id),
  defender1_id UUID REFERENCES players(id),
  defender2_id UUID REFERENCES players(id),
  midfielder1_id UUID REFERENCES players(id),
  midfielder2_id UUID REFERENCES players(id),
  forward_id UUID REFERENCES players(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_ip)
);

-- ============================================================================
-- 4. 플레이오프 시스템
-- ============================================================================

CREATE TABLE IF NOT EXISTS playoff_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_name VARCHAR(100) NOT NULL, -- '4강', '결승' 등
  match_order INTEGER NOT NULL, -- 같은 라운드 내 경기 순서
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES teams(id),
  match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. 미디어 시스템 (사진, 영상)
-- ============================================================================

-- 경기 사진 테이블
CREATE TABLE IF NOT EXISTS match_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  photo_type VARCHAR(50) DEFAULT 'general', -- 'goal', 'celebration', 'team', 'general'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 팀 사진 테이블
CREATE TABLE IF NOT EXISTS team_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  photo_type VARCHAR(50) DEFAULT 'general', -- 'logo', 'group', 'training', 'general'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 경기 영상 테이블 (다중 영상 지원)
CREATE TABLE IF NOT EXISTS match_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  video_type VARCHAR(50) NOT NULL, -- 'highlight', 'goal', 'full', 'interview', 'analysis', 'other'
  youtube_url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. 댓글 및 소셜 시스템
-- ============================================================================

-- 댓글 테이블 (경기/사진/팀별, 중첩 답글 지원)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_ip VARCHAR(45) NOT NULL,
  author_name VARCHAR(100),
  comment_type VARCHAR(50) NOT NULL, -- 'match', 'photo', 'team'
  reference_id UUID NOT NULL, -- match_id, photo_id, team_id
  parent_id UUID REFERENCES comments(id), -- 답글의 경우 부모 댓글 ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 반응 테이블 (좋아요/싫어요)
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,
  reaction_type VARCHAR(10) NOT NULL, -- 'like', 'dislike'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_ip)
);

-- ============================================================================
-- 7. 인덱스 생성 (성능 최적화)
-- ============================================================================

-- 플레이어 팀별 인덱스
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

-- 경기 날짜 인덱스
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- 경기 이벤트 인덱스
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_match_events_team_id ON match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(type);
CREATE INDEX IF NOT EXISTS idx_match_events_minute ON match_events(minute);
CREATE INDEX IF NOT EXISTS idx_match_events_half ON match_events(half);

-- 예측 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_match_predictions_match_id ON match_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_champion_votes_team_id ON champion_votes(team_id);

-- 미디어 인덱스
CREATE INDEX IF NOT EXISTS idx_match_photos_match_id ON match_photos(match_id);
CREATE INDEX IF NOT EXISTS idx_team_photos_team_id ON team_photos(team_id);
CREATE INDEX IF NOT EXISTS idx_match_videos_match_id ON match_videos(match_id);

-- 댓글 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_reference ON comments(comment_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);

-- 팀 숨김 기능 인덱스
CREATE INDEX IF NOT EXISTS idx_teams_is_hidden ON teams(is_hidden);

-- ============================================================================
-- 8. 기본 데이터 삽입
-- ============================================================================

-- 기본 대회 생성
INSERT INTO competitions (name, description, year, start_date, end_date, half_duration_minutes)
VALUES ('제 1회 KOPRI CUP', '극지연구소 풋살 대회', 2025, '2025-01-01', '2025-12-31', 25)
ON CONFLICT DO NOTHING;

-- 무소속 팀 생성 (선수 데이터 보존용)
INSERT INTO teams (name, department, is_hidden)
VALUES ('무소속', '시스템', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. 테이블 코멘트 (문서화)
-- ============================================================================

COMMENT ON TABLE competitions IS '대회 정보 테이블';
COMMENT ON TABLE teams IS '팀 정보 테이블 (is_hidden으로 숨김 처리 가능)';
COMMENT ON TABLE players IS '선수 정보 테이블';
COMMENT ON TABLE matches IS '경기 정보 테이블 (Man of the Match, 유튜브 링크 포함)';
COMMENT ON TABLE match_events IS '경기 이벤트 테이블 (골/어시스트, 전반/후반, 자책골)';
COMMENT ON TABLE match_predictions IS '경기 예측 테이블 (IP 기반)';
COMMENT ON TABLE champion_votes IS '우승팀 투표 테이블 (IP 기반)';
COMMENT ON TABLE mvp_votes IS 'MVP 투표 테이블 (IP 기반)';
COMMENT ON TABLE best6_votes IS '베스트6 투표 테이블 (포지션별, IP 기반)';
COMMENT ON TABLE playoff_matches IS '플레이오프 경기 테이블';
COMMENT ON TABLE match_photos IS '경기 사진 테이블';
COMMENT ON TABLE team_photos IS '팀 사진 테이블 (로고, 단체사진, 훈련사진, 일반사진)';
COMMENT ON TABLE match_videos IS '경기 영상 테이블 (다중 영상 지원)';
COMMENT ON TABLE comments IS '댓글 테이블 (경기/사진/팀별, 중첩 답글)';
COMMENT ON TABLE comment_reactions IS '댓글 반응 테이블 (좋아요/싫어요)';

-- ============================================================================
-- 완료 메시지
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'FcKopri Database Schema v1.1.3 설치 완료!';
    RAISE NOTICE '- 총 %개 테이블 생성됨', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'competitions', 'teams', 'players', 'matches', 'match_events',
            'match_predictions', 'champion_votes', 'mvp_votes', 'best6_votes',
            'playoff_matches', 'match_photos', 'team_photos', 'match_videos',
            'comments', 'comment_reactions'
        )
    );
    RAISE NOTICE '- Storage 설정과 보안 정책을 별도로 적용하세요.';
    RAISE NOTICE '- 다음 단계: setup/ 폴더의 파일들을 실행하세요.';
END $$;