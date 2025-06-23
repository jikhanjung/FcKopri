# Supabase Storage 설정 가이드

경기 사진 업로드 기능을 위한 Supabase Storage 설정 방법입니다.

## 1. Storage 버킷 생성

1. **Supabase Dashboard**에 로그인합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 **Storage**를 클릭합니다.
4. **Create a new bucket** 버튼을 클릭합니다.
5. 다음과 같이 설정합니다:
   - **Name**: `match-photos`
   - **Public bucket**: ✅ 체크 (공개 읽기 허용)
   - **File size limit**: `10 MB` (선택사항)
   - **Allowed MIME types**: `image/*` (선택사항)

## 2. Storage 정책 설정

### 2.1 읽기 정책 (모든 사용자)
```sql
CREATE POLICY "Give users access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'match-photos');
```

### 2.2 업로드 정책 (관리자만)
```sql
CREATE POLICY "Give admin users access to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'match-photos' 
  AND auth.jwt() ->> 'email' = 'admin@kopri.re.kr'
);
```

### 2.3 삭제 정책 (관리자만)
```sql
CREATE POLICY "Give admin users access to delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'match-photos' 
  AND auth.jwt() ->> 'email' = 'admin@kopri.re.kr'
);
```

## 3. 폴더 구조

버킷 내 파일은 다음과 같은 구조로 저장됩니다:

```
match-photos/
├── match_[경기ID]/
│   ├── photo1_timestamp.jpg
│   ├── photo2_timestamp.jpg
│   └── photo3_timestamp.png
└── match_[다른경기ID]/
    ├── photo1_timestamp.jpg
    └── photo2_timestamp.jpg
```

## 4. 환경 변수 확인

`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 5. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 파일을 실행하세요:

```sql
-- match_photos_table.sql 파일 내용 실행
```

## 6. 지원 파일 형식

- **이미지 형식**: JPEG, PNG, WebP, GIF
- **최대 파일 크기**: 10MB
- **동시 업로드**: 최대 5개 파일

## 7. 설정 확인

1. Storage 대시보드에서 `match-photos` 버킷이 생성되었는지 확인
2. 정책(Policies) 탭에서 위의 3개 정책이 활성화되었는지 확인
3. 테스트 업로드를 통해 정상 작동하는지 확인

## 8. 트러블슈팅

### 업로드 실패 시
- 관리자로 로그인되어 있는지 확인
- 파일 크기가 10MB 이하인지 확인
- 이미지 파일 형식인지 확인

### 이미지 표시 안 됨
- 버킷이 public으로 설정되어 있는지 확인
- 읽기 정책이 올바르게 설정되어 있는지 확인
- 파일 경로가 정확한지 확인

## 9. 보안 고려사항

- 업로드는 관리자만 가능하도록 제한
- 파일 크기 및 형식 제한으로 남용 방지
- 정기적인 Storage 사용량 모니터링 권장