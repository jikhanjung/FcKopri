-- Supabase Storage 설정 - 팀 사진용
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. team-photos 버킷 생성 (Supabase Dashboard에서 수행)
-- ============================================
-- Supabase Dashboard → Storage → Create bucket
-- - Name: team-photos
-- - Public bucket: ✅ 체크
-- - File size limit: 10 MB (선택사항)
-- - Allowed MIME types: image/* (선택사항)

-- ============================================
-- 2. Storage 정책 설정
-- ============================================

-- 기존 정책 삭제 (혹시 있을 수 있음)
DROP POLICY IF EXISTS "Enable read access for all users on team-photos" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for admin only on team-photos" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for admin only on team-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on team-photos" ON storage.objects;

-- 모든 작업 허용 정책 (현재 인증 시스템에 맞춤)
CREATE POLICY "Allow all operations on team-photos bucket" ON storage.objects
FOR ALL USING (bucket_id = 'team-photos')
WITH CHECK (bucket_id = 'team-photos');

-- ============================================
-- 3. 확인
-- ============================================

-- Storage 정책 확인
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%team-photos%'
ORDER BY policyname;

-- ============================================
-- 4. 테스트 방법
-- ============================================
-- 1. 위 SQL 실행
-- 2. 팀 상세 페이지로 이동
-- 3. 관리자로 로그인
-- 4. "사진 추가" 버튼으로 업로드 테스트
-- 5. 사진이 정상적으로 표시되는지 확인

-- ============================================
-- 팀 사진 폴더 구조
-- ============================================
-- team-photos/
-- ├── team_[팀ID]/
-- │   ├── logo_timestamp_random.jpg     (팀 로고)
-- │   ├── team_timestamp_random.jpg     (단체사진)
-- │   ├── training_timestamp_random.jpg (훈련사진)
-- │   └── general_timestamp_random.jpg  (일반사진)
-- └── team_[다른팀ID]/
--     └── ...

-- ============================================
-- 사진 유형별 설명
-- ============================================
-- logo: 팀 로고 (🏆)
-- team: 팀 단체사진 (👥)  
-- training: 훈련사진 (⚽)
-- general: 일반사진 (📷)