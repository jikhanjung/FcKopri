-- 보안 정책 복원 가이드
-- 사진 업로드가 정상 작동한 후 보안을 다시 강화하는 SQL

-- ============================================
-- 1단계: 현재 관리자 정보 확인
-- ============================================
-- 먼저 현재 로그인된 사용자 정보를 확인하세요
SELECT 
  auth.jwt() ->> 'email' as current_user_email,
  auth.jwt() ->> 'role' as current_role,
  auth.role() as auth_role;

-- 위 쿼리 결과에서 실제 관리자 이메일을 확인하고
-- 아래 정책에서 'admin@kopri.re.kr'을 실제 이메일로 바꿔주세요

-- ============================================
-- 2단계: match_photos 테이블 RLS 다시 활성화
-- ============================================

-- RLS 다시 활성화
ALTER TABLE match_photos ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (혹시 남아있을 수 있음)
DROP POLICY IF EXISTS "Allow all operations on match-photos bucket" ON storage.objects;

-- ============================================
-- 3단계: match_photos 테이블 정책 생성
-- ============================================

-- 모든 사용자 읽기 허용
CREATE POLICY "Enable read access for all users" ON match_photos
FOR SELECT USING (true);

-- 관리자만 삽입 허용 (실제 관리자 이메일로 수정하세요)
CREATE POLICY "Enable insert for admin only" ON match_photos
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' = 'admin@kopri.re.kr'  -- 실제 이메일로 변경
);

-- 관리자만 업데이트 허용
CREATE POLICY "Enable update for admin only" ON match_photos
FOR UPDATE USING (
  auth.jwt() ->> 'email' = 'admin@kopri.re.kr'  -- 실제 이메일로 변경
) WITH CHECK (
  auth.jwt() ->> 'email' = 'admin@kopri.re.kr'  -- 실제 이메일로 변경
);

-- 관리자만 삭제 허용
CREATE POLICY "Enable delete for admin only" ON match_photos
FOR DELETE USING (
  auth.jwt() ->> 'email' = 'admin@kopri.re.kr'  -- 실제 이메일로 변경
);

-- ============================================
-- 4단계: Storage 보안 정책 생성
-- ============================================

-- 모든 사용자 읽기 허용
CREATE POLICY "Enable read access for all users on match-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'match-photos');

-- 관리자만 업로드 허용 (실제 관리자 이메일로 수정하세요)
CREATE POLICY "Enable insert for admin only on match-photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'match-photos' 
  AND auth.jwt() ->> 'email' = 'admin@kopri.re.kr'  -- 실제 이메일로 변경
);

-- 관리자만 삭제 허용
CREATE POLICY "Enable delete for admin only on match-photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'match-photos' 
  AND auth.jwt() ->> 'email' = 'admin@kopri.re.kr'  -- 실제 이메일로 변경
);

-- ============================================
-- 5단계: 정책 확인
-- ============================================

-- match_photos 테이블 정책 확인
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'match_photos'
ORDER BY policyname;

-- Storage 정책 확인
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%match-photos%'
ORDER BY policyname;

-- ============================================
-- 대안: 단계적 적용 (권장)
-- ============================================

-- 만약 위 정책이 작동하지 않으면, 먼저 인증된 사용자 모두 허용 후
-- 점진적으로 관리자 이메일 기반으로 변경하세요:

/*
-- 임시 정책 (테스트용)
CREATE POLICY "Enable insert for authenticated users" ON match_photos
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users on storage" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'match-photos' 
  AND auth.role() = 'authenticated'
);
*/