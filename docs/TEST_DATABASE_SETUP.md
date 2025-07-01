# 테스트 데이터베이스 설정 가이드

## 1. 새로운 Supabase 프로젝트 생성

### 1.1 Supabase 대시보드에서
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트명: `fckopri-test` 
4. 비밀번호 설정
5. Region: 기존과 동일 (ap-northeast-1)

### 1.2 프로젝트 정보 저장
```bash
# 새 프로젝트에서 Settings > API > Project URL, anon key 복사
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your-test-anon-key
```

## 2. 테스트 DB 스키마 복사

### 2.1 기존 프로젝트에서 스키마 백업
```bash
# 전체 스키마 백업 (기존 스크립트 활용)
node backup-data.js --schema-only
```

### 2.2 테스트 프로젝트에 스키마 적용
```sql
-- SQL Editor에서 순서대로 실행:
-- 1. sql/00_initial_schema.sql
-- 2. sql/01_match_events_table.sql ~ sql/15_*.sql
-- 3. sql/20_storage_setup.sql
-- 4. sql/30_security_policies.sql
```

## 3. 환경변수 설정

### 3.1 .env.test 업데이트
```env
# 테스트 환경 변수
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key

# 관리자 인증
ADMIN_PASSWORD=kopri2025

# 테스트 설정
CI=false
NODE_ENV=test
```

### 3.2 GitHub Secrets (CI용)
```bash
# Repository Settings > Secrets에 추가
TEST_SUPABASE_URL
TEST_SUPABASE_ANON_KEY
TEST_SUPABASE_SERVICE_ROLE_KEY
TEST_ADMIN_PASSWORD
```

## 4. 테스트 데이터 시드

### 4.1 기본 테스트 데이터
```sql
-- 테스트용 팀 생성
INSERT INTO teams (id, name, department) VALUES
('team-1', '테스트팀A', '연구부'),
('team-2', '테스트팀B', '관리부'),
('team-3', '테스트팀C', '기술부'),
('team-4', '테스트팀D', '운영부');

-- 테스트용 선수 생성
INSERT INTO players (name, team_id) VALUES
('선수1', 'team-1'), ('선수2', 'team-1'),
('선수3', 'team-2'), ('선수4', 'team-2'),
('선수5', 'team-3'), ('선수6', 'team-3'),
('선수7', 'team-4'), ('선수8', 'team-4');

-- 테스트용 경기 생성
INSERT INTO matches (home_team_id, away_team_id, match_date, status, home_score, away_score) VALUES
('team-1', 'team-2', '2025-06-20 14:00:00', 'completed', 2, 1),
('team-3', 'team-4', '2025-06-21 15:00:00', 'completed', 1, 0),
('team-1', 'team-3', '2025-06-22 16:00:00', 'scheduled', null, null),
('team-2', 'team-4', '2025-06-23 17:00:00', 'in_progress', 1, 1);
```

## 5. 테스트 실행 설정

### 5.1 Playwright 설정 업데이트
```typescript
// playwright.config.ts
use: {
  baseURL: process.env.NODE_ENV === 'test' 
    ? 'http://localhost:3000' 
    : 'http://localhost:3000',
},

// 테스트 환경변수 로드
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY,
  }
}
```

### 5.2 테스트 실행 스크립트
```bash
# package.json
"scripts": {
  "test:e2e": "NODE_ENV=test playwright test",
  "test:e2e:ui": "NODE_ENV=test playwright test --ui",
  "test:seed": "node scripts/seed-test-data.js"
}
```

## 6. 데이터 정리 전략

### 6.1 각 테스트 후 정리
```typescript
// 테스트 후 데이터 정리
test.afterEach(async ({ page }) => {
  // 테스트 중 생성된 데이터 정리
  await supabase.from('match_events').delete().neq('id', '');
  await supabase.from('comments').delete().neq('id', '');
});
```

### 6.2 전체 DB 리셋
```bash
# 필요시 전체 테스트 DB 리셋
npm run test:reset-db
```

## 7. CI/CD 환경 설정

### 7.1 GitHub Actions
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## 8. 비용 최적화

### 8.1 무료 플랜 활용
- Supabase 무료 플랜: 500MB DB, 1GB Storage
- 테스트용으로 충분한 용량

### 8.2 리소스 관리
- 필요 시에만 테스트 실행
- 정기적인 테스트 데이터 정리
- 불필요한 Storage 파일 삭제

## 9. 보안 고려사항

### 9.1 테스트 데이터
- 개인정보 없는 더미 데이터만 사용
- 실제 이메일, 전화번호 사용 금지

### 9.2 접근 권한
- 테스트 DB는 팀 멤버만 접근
- RLS 정책도 테스트 환경에 적용