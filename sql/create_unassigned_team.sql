-- 무소속 팀 생성
-- 이 팀은 소속 팀이 없는 선수들을 관리하기 위한 특수 팀입니다.

DO $$
DECLARE
    competition_uuid UUID;
    unassigned_team_uuid UUID := gen_random_uuid();
BEGIN
    -- 현재 대회 ID 가져오기
    SELECT id INTO competition_uuid 
    FROM competitions 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- 무소속 팀이 이미 존재하는지 확인
    IF NOT EXISTS (SELECT 1 FROM teams WHERE name = '무소속') THEN
        -- 무소속 팀 생성
        INSERT INTO teams (id, name, competition_id, department, is_hidden, created_at, updated_at)
        VALUES (
            unassigned_team_uuid,
            '무소속',
            competition_uuid,
            '무소속',
            true,  -- 팀 목록에서 숨김
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '무소속 팀이 생성되었습니다. ID: %', unassigned_team_uuid;
    ELSE
        RAISE NOTICE '무소속 팀이 이미 존재합니다.';
    END IF;
    
    -- 현재 team_id가 NULL인 선수들을 무소속 팀으로 이동
    UPDATE players 
    SET team_id = unassigned_team_uuid,
        updated_at = NOW()
    WHERE team_id IS NULL;
    
    RAISE NOTICE '무소속 선수들이 무소속 팀으로 이동되었습니다.';
END $$;