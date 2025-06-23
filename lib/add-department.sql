-- players 테이블에 department 컬럼 추가
ALTER TABLE players ADD COLUMN department VARCHAR(50);

-- 기존 선수들의 부서 정보 업데이트

-- 블리자드 팀
UPDATE players SET department = '인사실' WHERE name = '권영훈';
UPDATE players SET department = '빙하지권' WHERE name = '김경환';
UPDATE players SET department = '빙하지권' WHERE name = '김진석';
UPDATE players SET department = '생명과학' WHERE name = '김한우';
UPDATE players SET department = '빙하지권' WHERE name = '문장일';
UPDATE players SET department = '생명과학' WHERE name = '소요한';
UPDATE players SET department = '빙하지권' WHERE name = '정현재';

-- B키세요 팀
UPDATE players SET department = '생명과학' WHERE name = '도학원';
UPDATE players SET department = '기지운영실' WHERE name = '김선휘';
UPDATE players SET department = '원격탐사' WHERE name = '변진영';
UPDATE players SET department = '빙하지권' WHERE name = '원종필';
UPDATE players SET department = '생명과학' WHERE name = '전제현';
UPDATE players SET department = '생명과학' WHERE name = '채현식';
UPDATE players SET department = '정보전산실' WHERE name = '최성철';
UPDATE players SET department = '원격탐사' WHERE name = 'Supratim';

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

-- 확인 쿼리
SELECT 
  t.name as team_name,
  p.name as player_name,
  p.department,
  p.position,
  p.jersey_number
FROM teams t
JOIN players p ON t.id = p.team_id
ORDER BY t.name, p.name;