-- 간단한 암호 기반 인증을 위한 RLS 정책
-- 현재 시스템은 Supabase Auth를 사용하지 않으므로 다른 방식으로 보안 적용

-- ============================================
-- 방법 1: RLS 비활성화 (현재 상황에 적합)
-- ============================================
-- 현재 시스템에서는 클라이언트 측에서 관리자 체크를 하고 있으므로
-- RLS를 비활성화하고 애플리케이션 레벨에서 보안 관리

-- match_photos 테이블 RLS 비활성화
ALTER TABLE match_photos DISABLE ROW LEVEL SECURITY;

-- 기존 모든 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON match_photos;
DROP POLICY IF EXISTS "Enable insert for admin only" ON match_photos;
DROP POLICY IF EXISTS "Enable update for admin only" ON match_photos;
DROP POLICY IF EXISTS "Enable delete for admin only" ON match_photos;

-- Storage 정책도 간단하게 설정
DROP POLICY IF EXISTS "Enable read access for all users on match-photos" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for admin only on match-photos" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for admin only on match-photos" ON storage.objects;

-- Storage는 모든 작업 허용 (애플리케이션에서 제어)
CREATE POLICY "Allow all operations on match-photos" ON storage.objects
FOR ALL USING (bucket_id = 'match-photos')
WITH CHECK (bucket_id = 'match-photos');

-- ============================================
-- 방법 2: Service Role Key 사용 (대안)
-- ============================================
-- 만약 더 강한 보안이 필요하다면, 
-- 클라이언트에서 Service Role Key를 사용하는 방법도 있습니다.
-- 하지만 현재 구조에서는 방법 1이 더 적합합니다.

-- ============================================
-- 확인
-- ============================================
-- 정책 상태 확인
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'match_photos';

-- Storage 정책 확인
SELECT 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%match-photos%';

-- ============================================
-- 추천 사항
-- ============================================
-- 현재 시스템에서는 다음과 같은 보안 구조를 사용:
-- 1. 클라이언트: 관리자 체크 (AuthContext의 isAdmin)
-- 2. 데이터베이스: RLS 비활성화, 간단한 Storage 정책
-- 3. 애플리케이션: 관리자만 업로드/삭제 버튼 표시

-- 이 방식은 내부 대회용으로는 충분한 보안 수준입니다.