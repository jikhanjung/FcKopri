-- 자타공인과 포세이돈 팀 선수들의 누락된 부서 정보 복구

-- 자타공인 팀
UPDATE players SET department = '미래기술' WHERE name = '김관수';
UPDATE players SET department = '생명과학' WHERE name = '김일찬';
UPDATE players SET department = '생명과학' WHERE name = '김진현';
UPDATE players SET department = '생명과학' WHERE name = '김진형';
UPDATE players SET department = '재무실' WHERE name = '이규환';
UPDATE players SET department = '시설보안' WHERE name = '정세진';
UPDATE players SET department = '빙하지권' WHERE name = '정직한';

-- 포세이돈 팀
UPDATE players SET department = '생명과학' WHERE name = '김재원';
UPDATE players SET department = '해양대기' WHERE name = '문종국';
UPDATE players SET department = '해양대기' WHERE name = '손우주';
UPDATE players SET department = '생명과학' WHERE name = '이한별';
UPDATE players SET department = '해양대기' WHERE name = '정진영';
UPDATE players SET department = '해양대기' WHERE name = '조경호';
UPDATE players SET department = '해양대기' WHERE name = '하선용';

-- 복구 결과 확인
SELECT 
  t.name as team_name,
  p.name as player_name,
  p.department,
  CASE 
    WHEN p.department IS NULL THEN '❌ 누락'
    ELSE '✅ 정상'
  END as status
FROM teams t
JOIN players p ON t.id = p.team_id
WHERE t.name IN ('자타공인', '포세이돈')
ORDER BY t.name, p.name;