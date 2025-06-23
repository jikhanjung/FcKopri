-- 빠른 RLS 문제 해결 (개발 단계용)
-- Supabase SQL Editor에서 순서대로 실행하세요

-- 1. 현재 정책들 모두 삭제
DROP POLICY IF EXISTS "Allow read access for all users" ON match_photos;
DROP POLICY IF EXISTS "Allow admin insert access" ON match_photos;
DROP POLICY IF EXISTS "Allow admin update access" ON match_photos;
DROP POLICY IF EXISTS "Allow admin delete access" ON match_photos;
DROP POLICY IF EXISTS "Enable read access for all users" ON match_photos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON match_photos;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON match_photos;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON match_photos;

-- 2. RLS 임시 비활성화 (개발 중에만 사용)
ALTER TABLE match_photos DISABLE ROW LEVEL SECURITY;

-- 3. Storage 정책도 삭제
DROP POLICY IF EXISTS "Give users access to view images" ON storage.objects;
DROP POLICY IF EXISTS "Give admin users access to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Give admin users access to delete images" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;

-- 4. Storage에 간단한 정책 생성
CREATE POLICY "Allow all operations on match-photos bucket" ON storage.objects
FOR ALL USING (bucket_id = 'match-photos')
WITH CHECK (bucket_id = 'match-photos');

-- 5. 확인용 쿼리
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename = 'match_photos' OR tablename = 'objects';

-- 업로드 테스트 후 성공하면 나중에 다시 보안 정책을 적용할 수 있습니다.