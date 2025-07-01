-- Man of the Match 기능 추가
-- matches 테이블에 man_of_the_match_id 컬럼 추가

-- 1. matches 테이블에 컬럼 추가
ALTER TABLE matches 
ADD COLUMN man_of_the_match_id UUID REFERENCES players(id) ON DELETE SET NULL;

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_matches_man_of_the_match_id ON matches(man_of_the_match_id);

-- 3. 컬럼 설명 추가
COMMENT ON COLUMN matches.man_of_the_match_id IS 'Man of the Match로 선정된 선수 ID (관리자가 선정)';

-- 4. 확인 쿼리
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'matches' AND column_name = 'man_of_the_match_id';

-- 5. 테스트용 쿼리 (실행하지 마세요, 참고용)
/*
-- Man of the Match가 선정된 경기 조회
SELECT 
  m.id,
  ht.name as home_team,
  at.name as away_team,
  p.name as man_of_the_match,
  m.match_date
FROM matches m
LEFT JOIN teams ht ON m.home_team_id = ht.id
LEFT JOIN teams at ON m.away_team_id = at.id
LEFT JOIN players p ON m.man_of_the_match_id = p.id
WHERE m.man_of_the_match_id IS NOT NULL;
*/