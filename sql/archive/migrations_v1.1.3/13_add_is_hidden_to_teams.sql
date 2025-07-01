-- teams 테이블에 is_hidden 컬럼 추가
-- 무소속 팀 등 특수 팀을 일반 팀 목록에서 숨기기 위한 컬럼

ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_teams_is_hidden ON teams(is_hidden);

-- 기존 무소속 팀이 있다면 숨김 처리
UPDATE teams SET is_hidden = true WHERE name = '무소속';