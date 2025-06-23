-- 제 1회 KOPRI CUP 경기 일정 데이터

-- 리그전 (1-6경기)
INSERT INTO matches (competition_id, home_team_id, away_team_id, match_date, status) 
VALUES 
  -- 1경기: 2025-06-24 블리자드 vs B키세요
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    (SELECT id FROM teams WHERE name = '블리자드'),
    (SELECT id FROM teams WHERE name = 'B키세요'),
    '2025-06-24 12:00:00+09:00',
    'scheduled'
  ),
  -- 2경기: 2025-06-25 자타공인 vs 포세이돈
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    (SELECT id FROM teams WHERE name = '자타공인'),
    (SELECT id FROM teams WHERE name = '포세이돈'),
    '2025-06-25 12:00:00+09:00',
    'scheduled'
  ),
  -- 3경기: 2025-06-26 블리자드 vs 자타공인
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    (SELECT id FROM teams WHERE name = '블리자드'),
    (SELECT id FROM teams WHERE name = '자타공인'),
    '2025-06-26 12:00:00+09:00',
    'scheduled'
  ),
  -- 4경기: 2025-07-01 B키세요 vs 포세이돈
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    (SELECT id FROM teams WHERE name = 'B키세요'),
    (SELECT id FROM teams WHERE name = '포세이돈'),
    '2025-07-01 12:00:00+09:00',
    'scheduled'
  ),
  -- 5경기: 2025-07-02 블리자드 vs 포세이돈
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    (SELECT id FROM teams WHERE name = '블리자드'),
    (SELECT id FROM teams WHERE name = '포세이돈'),
    '2025-07-02 12:00:00+09:00',
    'scheduled'
  ),
  -- 6경기: 2025-07-03 B키세요 vs 자타공인
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    (SELECT id FROM teams WHERE name = 'B키세요'),
    (SELECT id FROM teams WHERE name = '자타공인'),
    '2025-07-03 12:00:00+09:00',
    'scheduled'
  );

-- 플레이오프 경기 (팀은 미정으로 설정)
INSERT INTO matches (competition_id, home_team_id, away_team_id, match_date, status) 
VALUES 
  -- 7경기: 2025-07-08 3위 vs 4위
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    NULL, -- 3위팀 (미정)
    NULL, -- 4위팀 (미정)
    '2025-07-08 12:00:00+09:00',
    'scheduled'
  ),
  -- 8경기: 2025-07-09 2위 vs 7경기 승팀
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    NULL, -- 2위팀 (미정)
    NULL, -- 7경기 승팀 (미정)
    '2025-07-09 12:00:00+09:00',
    'scheduled'
  ),
  -- 9경기: 2025-07-10 1위 vs 8경기 승팀 (결승)
  (
    (SELECT id FROM competitions WHERE name = '제 1회 KOPRI CUP'),
    NULL, -- 1위팀 (미정)
    NULL, -- 8경기 승팀 (미정)
    '2025-07-10 12:00:00+09:00',
    'scheduled'
  );

-- 경기 일정 확인
SELECT 
  m.id,
  m.match_date,
  ht.name as home_team,
  at.name as away_team,
  m.status,
  CASE 
    WHEN ht.name IS NULL AND at.name IS NULL THEN '플레이오프 (팀 미정)'
    ELSE '리그전'
  END as match_type
FROM matches m
LEFT JOIN teams ht ON m.home_team_id = ht.id
LEFT JOIN teams at ON m.away_team_id = at.id
ORDER BY m.match_date;