-- Update competition description and end_date
-- Description: 한국극지연구소 풋살 대회
-- End date: 7월 10일 (2024년으로 가정)

UPDATE competitions
SET 
    description = '한국극지연구소 풋살 대회',
    end_date = '2024-07-10'
WHERE name = 'KOPRI CUP';

-- 대회가 여러 개일 경우를 대비한 더 안전한 쿼리
-- 가장 최근에 생성된 KOPRI CUP 대회만 업데이트
UPDATE competitions
SET 
    description = '한국극지연구소 풋살 대회',
    end_date = '2024-07-10',
    updated_at = TIMEZONE('utc'::text, NOW())
WHERE id = (
    SELECT id 
    FROM competitions 
    WHERE name = 'KOPRI CUP' 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- 업데이트 결과 확인
SELECT 
    id,
    name,
    description,
    year,
    start_date,
    end_date,
    created_at,
    updated_at
FROM competitions
WHERE name = 'KOPRI CUP'
ORDER BY created_at DESC;