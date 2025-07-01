# SuperAdmin 설정 가이드

## 1. 사용자 등록

먼저 일반 사용자로 회원가입을 완료하세요:

1. 애플리케이션에 접속하여 로그인 페이지로 이동
2. 이메일/비밀번호 또는 소셜 로그인으로 회원가입
3. 가입 완료 후 로그아웃

## 2. SuperAdmin 권한 부여

### 방법 1: Supabase Studio에서 직접 설정 (권장)

1. Supabase Studio에 로그인
2. SQL Editor로 이동
3. 다음 SQL을 실행하여 SuperAdmin 권한 부여:

```sql
-- 먼저 사용자 정보 확인
SELECT id, email, display_name FROM user_profiles WHERE email = 'your-email@example.com';

-- 해당 사용자에게 SuperAdmin 권한 부여
INSERT INTO user_roles (user_id, role, granted_by, reason)
SELECT 
  id, 
  'super_admin'::user_role_type,
  id,  -- 자기 자신이 부여한 것으로 기록
  'Initial super administrator setup'
FROM user_profiles 
WHERE email = 'your-email@example.com';
```

### 방법 2: 초기 설정 함수 사용 (첫 번째 SuperAdmin만)

```sql
-- 이메일로 첫 번째 SuperAdmin 설정
SELECT initialize_super_admin('your-email@example.com');
```

**주의**: `initialize_super_admin` 함수는 SuperAdmin이 존재하지 않을 때만 사용 가능합니다.

## 3. 권한 확인

권한이 제대로 부여되었는지 확인:

```sql
-- 사용자의 현재 권한 확인
SELECT 
  up.email,
  up.display_name,
  ur.role,
  ur.granted_at,
  ur.is_active
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id
WHERE up.email = 'your-email@example.com'
AND ur.is_active = true;
```

## 4. 로그인 및 권한 테스트

1. 애플리케이션에 다시 로그인
2. 관리자 메뉴(`/admin`)에 접근 가능한지 확인
3. 사용자 관리 페이지(`/admin/users`)에 접근 가능한지 확인

## 권한 레벨

- **super_admin**: 모든 관리 기능 접근 가능
- **admin**: 대회 관리 및 일반 관리 기능 접근 가능
- **moderator**: 제한된 관리 기능 접근 가능
- **user**: 일반 사용자 (기본값)

## 추가 SuperAdmin 생성

첫 번째 SuperAdmin이 설정된 후에는 다음과 같이 추가 SuperAdmin을 생성할 수 있습니다:

1. SuperAdmin으로 로그인
2. `/admin/users` 페이지에서 사용자 목록 확인
3. 해당 사용자의 "관리자" 버튼 클릭하여 admin 권한 부여
4. 필요시 SQL로 직접 super_admin 권한 부여:

```sql
INSERT INTO user_roles (user_id, role, granted_by, reason)
VALUES (
  'target-user-uuid',
  'super_admin'::user_role_type,
  'granter-user-uuid',
  'Additional super administrator'
);
```

## 문제 해결

### 권한이 적용되지 않는 경우

1. 브라우저 캐시 삭제 후 재로그인
2. user_roles 테이블에서 is_active가 true인지 확인
3. expires_at이 NULL이거나 미래 시간인지 확인

### 함수 실행 오류

- "Super administrator already exists" 오류: 이미 SuperAdmin이 존재하므로 방법 1 사용
- "User not found" 오류: 이메일 주소가 정확한지 확인, user_profiles 테이블에 존재하는지 확인

## 보안 주의사항

- SuperAdmin 권한은 신중하게 부여하세요
- 불필요한 SuperAdmin 계정은 권한을 해제하세요
- 정기적으로 권한 현황을 점검하세요