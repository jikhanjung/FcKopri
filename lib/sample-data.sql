-- 제 1회 KOPRI CUP 팀 및 선수 데이터

-- 먼저 competition_id 가져오기 (참조용)
-- SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP';

-- 팀 데이터 삽입
INSERT INTO teams (name, competition_id) 
VALUES 
  ('블리자드', (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP')),
  ('B키세요', (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP')),
  ('자타공인', (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP')),
  ('포세이돈', (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'));

-- 선수 데이터 삽입

-- 블리자드 팀 선수
INSERT INTO players (name, team_id, position) 
VALUES 
  ('권영훈', (SELECT id FROM teams WHERE name = '블리자드'), NULL),
  ('김경환', (SELECT id FROM teams WHERE name = '블리자드'), NULL),
  ('김진석', (SELECT id FROM teams WHERE name = '블리자드'), NULL),
  ('김한우', (SELECT id FROM teams WHERE name = '블리자드'), NULL),
  ('문장일', (SELECT id FROM teams WHERE name = '블리자드'), NULL),
  ('소요한', (SELECT id FROM teams WHERE name = '블리자드'), NULL),
  ('정현재', (SELECT id FROM teams WHERE name = '블리자드'), NULL);

-- B키세요 팀 선수
INSERT INTO players (name, team_id, position) 
VALUES 
  ('도학원', (SELECT id FROM teams WHERE name = 'B키세요'), NULL),
  ('김선휘', (SELECT id FROM teams WHERE name = 'B키세요'), NULL),
  ('변진영', (SELECT id FROM teams WHERE name = 'B키세요'), NULL),
  ('원종필', (SELECT id FROM teams WHERE name = 'B키세요'), NULL),
  ('전제현', (SELECT id FROM teams WHERE name = 'B키세요'), NULL),
  ('채현식', (SELECT id FROM teams WHERE name = 'B키세요'), NULL),
  ('최성철', (SELECT id FROM teams WHERE name = 'B키세요'), NULL),
  ('Supratim', (SELECT id FROM teams WHERE name = 'B키세요'), NULL);

-- 자타공인 팀 선수
INSERT INTO players (name, team_id, position) 
VALUES 
  ('김관수', (SELECT id FROM teams WHERE name = '자타공인'), NULL),
  ('김일찬', (SELECT id FROM teams WHERE name = '자타공인'), NULL),
  ('김진현', (SELECT id FROM teams WHERE name = '자타공인'), NULL),
  ('김진형', (SELECT id FROM teams WHERE name = '자타공인'), NULL),
  ('이규환', (SELECT id FROM teams WHERE name = '자타공인'), NULL),
  ('정세진', (SELECT id FROM teams WHERE name = '자타공인'), NULL),
  ('정직한', (SELECT id FROM teams WHERE name = '자타공인'), NULL);

-- 포세이돈 팀 선수
INSERT INTO players (name, team_id, position) 
VALUES 
  ('김재원', (SELECT id FROM teams WHERE name = '포세이돈'), NULL),
  ('문종국', (SELECT id FROM teams WHERE name = '포세이돈'), NULL),
  ('손우주', (SELECT id FROM teams WHERE name = '포세이돈'), NULL),
  ('이한별', (SELECT id FROM teams WHERE name = '포세이돈'), NULL),
  ('정진영', (SELECT id FROM teams WHERE name = '포세이돈'), NULL),
  ('조경호', (SELECT id FROM teams WHERE name = '포세이돈'), NULL),
  ('하선용', (SELECT id FROM teams WHERE name = '포세이돈'), NULL);

-- 데이터 확인 쿼리
SELECT 
  t.name as team_name,
  COUNT(p.id) as player_count
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
GROUP BY t.id, t.name
ORDER BY t.name;