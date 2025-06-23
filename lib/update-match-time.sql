-- 모든 경기 시간을 한국 시간 12:00으로 수정

UPDATE matches 
SET match_date = CASE 
  WHEN match_date::date = '2025-06-24' THEN '2025-06-24 12:00:00+09:00'
  WHEN match_date::date = '2025-06-25' THEN '2025-06-25 12:00:00+09:00'
  WHEN match_date::date = '2025-06-26' THEN '2025-06-26 12:00:00+09:00'
  WHEN match_date::date = '2025-07-01' THEN '2025-07-01 12:00:00+09:00'
  WHEN match_date::date = '2025-07-02' THEN '2025-07-02 12:00:00+09:00'
  WHEN match_date::date = '2025-07-03' THEN '2025-07-03 12:00:00+09:00'
  WHEN match_date::date = '2025-07-08' THEN '2025-07-08 12:00:00+09:00'
  WHEN match_date::date = '2025-07-09' THEN '2025-07-09 12:00:00+09:00'
  WHEN match_date::date = '2025-07-10' THEN '2025-07-10 12:00:00+09:00'
  ELSE match_date
END
WHERE match_date IS NOT NULL;

-- 수정된 경기 일정 확인
SELECT 
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