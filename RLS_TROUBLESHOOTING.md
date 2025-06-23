# RLS (Row Level Security) 문제 해결 가이드

## 문제 상황
```
509433003_10236902621854869_6119033182081054119_n.jpg 업로드 실패: new row violates row-level security policy
```

이 오류는 `match_photos` 테이블의 RLS 정책이 관리자 인증을 올바르게 인식하지 못해서 발생합니다.

## 해결 방법

### 1단계: 현재 RLS 정책 확인
Supabase SQL Editor에서 다음 명령어를 실행하여 현재 정책을 확인하세요:

```sql
-- 현재 match_photos 테이블의 정책 확인
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'match_photos';
```

### 2단계: 기존 정책 삭제
```sql
-- 기존 정책들 삭제
DROP POLICY IF EXISTS "Allow admin insert access" ON match_photos;
DROP POLICY IF EXISTS "Allow admin update access" ON match_photos;
DROP POLICY IF EXISTS "Allow admin delete access" ON match_photos;
DROP POLICY IF EXISTS "Allow read access for all users" ON match_photos;
```

### 3단계: 새로운 정책 생성
```sql
-- 모든 사용자 읽기 허용
CREATE POLICY "Enable read access for all users" ON match_photos
FOR SELECT USING (true);

-- 인증된 사용자의 삽입 허용 (임시 해결책)
CREATE POLICY "Enable insert for authenticated users only" ON match_photos
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자의 업데이트 허용 (임시 해결책)
CREATE POLICY "Enable update for authenticated users only" ON match_photos
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자의 삭제 허용 (임시 해결책)
CREATE POLICY "Enable delete for authenticated users only" ON match_photos
FOR DELETE USING (auth.role() = 'authenticated');
```

### 4단계: Storage 정책도 확인
Storage 정책도 다시 설정해주세요:

```sql
-- Storage 기존 정책 삭제
DROP POLICY IF EXISTS "Give users access to view images" ON storage.objects;
DROP POLICY IF EXISTS "Give admin users access to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Give admin users access to delete images" ON storage.objects;

-- Storage 새 정책 생성
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'match-photos');

CREATE POLICY "Enable insert for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'match-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Enable delete for authenticated users" ON storage.objects
FOR DELETE USING (
  bucket_id = 'match-photos' 
  AND auth.role() = 'authenticated'
);
```

## 대안 해결책

### 옵션 1: RLS 임시 비활성화 (개발 중에만)
```sql
-- RLS 비활성화 (주의: 보안 위험)
ALTER TABLE match_photos DISABLE ROW LEVEL SECURITY;
```

### 옵션 2: 관리자 이메일 확인
현재 로그인된 사용자 정보를 확인해보세요:

1. Supabase Dashboard → Authentication → Users
2. 관리자 계정의 이메일이 정확히 `admin@kopri.re.kr`인지 확인
3. 만약 다르다면, 정책을 실제 이메일로 수정:

```sql
-- 실제 관리자 이메일로 정책 수정
CREATE POLICY "Enable insert for admin only" ON match_photos
FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = '실제관리자이메일@domain.com');
```

## 추천 해결 순서

1. **3단계의 새로운 정책 생성** 먼저 시도 (인증된 사용자 허용)
2. 업로드 테스트
3. 성공하면 나중에 이메일 기반 정책으로 변경
4. 실패하면 **옵션 1**로 임시 해결 후 나중에 재설정

## 확인 방법
정책 적용 후 다음을 확인하세요:

1. 관리자로 로그인했는지 확인
2. 브라우저 새로고침
3. 사진 업로드 재시도
4. 개발자 도구에서 네트워크 탭으로 에러 메시지 확인

이 가이드대로 진행하시면 사진 업로드가 정상적으로 작동할 것입니다.