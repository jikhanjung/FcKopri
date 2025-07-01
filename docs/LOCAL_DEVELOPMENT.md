# FcKopri 로컬 개발 환경 설정 가이드

이 문서는 FcKopri 프로젝트의 로컬 개발 환경 설정 방법을 설명합니다.

## 목차

1. [개요](#개요)
2. [Supabase 로컬 개발 설정](#supabase-로컬-개발-설정)
3. [환경 변수 관리](#환경-변수-관리)
4. [데이터베이스 스키마 관리](#데이터베이스-스키마-관리)
5. [백업 및 복원](#백업-및-복원)
6. [문제 해결](#문제-해결)

## 개요

FcKopri는 Supabase를 사용하는 풀스택 축구 리그 관리 시스템입니다. 로컬 개발 환경에서는 Docker를 통해 완전한 Supabase 스택을 실행할 수 있습니다.

### 지원하는 개발 환경
- **로컬 Supabase**: Docker를 통한 완전한 로컬 개발 환경
- **Supabase Cloud**: 클라우드 기반 프로덕션 환경

## Supabase 로컬 개발 설정

### 사전 요구사항

1. **Docker Desktop 설치** (필수)
   - [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop/)
   - Docker가 실행 중인지 확인

2. **Node.js 18+ 설치**
   - 프로젝트 devDependency로 Supabase CLI가 포함되어 있음

### 설치 및 실행

```bash
# 1. 프로젝트 의존성 설치
npm install

# 2. Supabase 로컬 서비스 시작
npx supabase start

# 3. 상태 확인
npx supabase status
```

### 로컬 서비스 접속 정보

성공적으로 시작되면 다음 서비스들이 실행됩니다:

```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
```

### 서비스 관리

```bash
# 서비스 중지
npx supabase stop

# 서비스 재시작
npx supabase restart

# 로그 확인
npx supabase logs
```

## 환경 변수 관리

### 환경 변수 파일 구조

프로젝트는 Next.js의 환경 변수 우선순위를 활용합니다:

1. **`.env.development.local`** - 로컬 Supabase (개발 시 최우선)
2. **`.env.local`** - Supabase Cloud (프로덕션)
3. **`.env.development`** - 개발 기본값
4. **`.env`** - 전역 기본값

### 로컬 개발용 환경 변수

**`.env.development.local`** 파일 생성:

```env
# Local Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### 환경 전환 방법

```bash
# 로컬 Supabase로 전환
mv .env.development.local.backup .env.development.local
npm run dev

# Supabase Cloud로 전환  
mv .env.development.local .env.development.local.backup
npm run dev
```

### 환경 확인

개발 서버 시작 시 사용 중인 환경 변수 파일이 표시됩니다:

```bash
npm run dev
# Environments: .env.development.local, .env.local  → 로컬 Supabase
# Environments: .env.local                          → Supabase Cloud
```

## 데이터베이스 스키마 관리

### 마이그레이션 시스템

현재 마이그레이션 파일:
- `supabase/migrations/20250701_cloud_schema.sql` - Supabase Cloud에서 덤프한 완전한 스키마

### 스키마 관리 명령어

```bash
# 데이터베이스 리셋 (마이그레이션 적용)
npx supabase db reset

# 클라우드에서 최신 스키마 가져오기
npx supabase db dump -f supabase/schema.sql

# 스키마 차이점 확인
npx supabase db diff
```

### 스키마 동기화 과정

1. **클라우드에서 스키마 덤프**:
   ```bash
   # Supabase Cloud에 연결 (env 파일 확인)
   mv .env.development.local .env.development.local.backup
   npx supabase db dump -f supabase/schema.sql
   ```

2. **로컬에 적용**:
   ```bash
   # 로컬 환경으로 전환
   mv .env.development.local.backup .env.development.local
   cp supabase/schema.sql supabase/migrations/$(date +%Y%m%d)_updated_schema.sql
   npx supabase db reset
   ```

## 백업 및 복원

### 백업 스크립트

프로젝트에는 자동화된 백업/복원 스크립트가 포함되어 있습니다.

#### 데이터 백업

```bash
# 현재 환경의 데이터 백업
node backup-data.js
```

**환경 자동 감지**:
- `.env.development.local`이 **있으면** → 로컬 Supabase 백업
- `.env.development.local`이 **없으면** → Supabase Cloud 백업

#### 데이터 복원

```bash
# 대화형 복원 (백업 선택 가능)
node restore-data.js
```

### 백업 파일 구조

```
backups/backup-YYYYMMDD-HHMMSS/
├── complete-backup.json         # 전체 데이터 통합 파일
├── schema.sql                   # 데이터베이스 스키마
├── backup-summary.json          # 백업 요약 정보
├── competitions.json            # 대회 데이터
├── teams.json                   # 팀 데이터
├── players.json                 # 선수 데이터
├── matches.json                 # 경기 데이터
├── match_events.json            # 경기 이벤트
├── match_predictions.json       # 경기 예측
├── champion_votes.json          # 우승팀 투표
├── playoff_matches.json         # 플레이오프 경기
├── match_photos.json            # 경기 사진
├── team_photos.json             # 팀 사진
├── match_videos.json            # 경기 영상
├── mvp_votes.json               # MVP 투표
├── best6_votes.json             # 베스트6 투표
├── comments.json                # 댓글
└── comment_reactions.json       # 댓글 반응
```

### 일반적인 백업/복원 워크플로우

1. **프로덕션 데이터를 로컬로 복원**:
   ```bash
   # Supabase Cloud에서 백업
   mv .env.development.local .env.development.local.backup
   node backup-data.js
   
   # 로컬 환경으로 전환 후 복원
   mv .env.development.local.backup .env.development.local
   node restore-data.js
   ```

2. **로컬 테스트 데이터 백업**:
   ```bash
   # 로컬 환경에서 백업 (개발 중 스냅샷)
   node backup-data.js
   ```

## 문제 해결

### Docker 관련 문제

1. **"Docker not found" 에러**:
   ```bash
   # Docker Desktop이 실행 중인지 확인
   docker --version
   
   # Docker 서비스 재시작
   # macOS: Docker Desktop 앱 재시작
   # Windows: Docker Desktop 재시작
   ```

2. **포트 충돌**:
   ```bash
   # 기존 Supabase 서비스 중지
   npx supabase stop
   
   # 포트 사용 중인 프로세스 확인
   lsof -i :54321
   lsof -i :54322
   lsof -i :54323
   ```

### 환경 변수 문제

1. **"Missing Supabase environment variables" 에러**:
   ```bash
   # 현재 환경 변수 확인
   echo $NEXT_PUBLIC_SUPABASE_URL
   
   # 개발 서버 재시작
   npm run dev
   ```

2. **잘못된 환경에 연결**:
   ```bash
   # 환경 변수 파일 확인
   ls -la .env*
   
   # 개발 서버 로그에서 환경 변수 파일 확인
   npm run dev
   ```

### 데이터베이스 문제

1. **스키마 불일치**:
   ```bash
   # 최신 클라우드 스키마로 리셋
   npx supabase db dump -f supabase/schema.sql
   cp supabase/schema.sql supabase/migrations/latest_schema.sql
   npx supabase db reset
   ```

2. **마이그레이션 실패**:
   ```bash
   # 컨테이너 완전 리셋
   npx supabase stop
   docker system prune -f
   npx supabase start
   ```

### 백업/복원 문제

1. **"Could not find column" 에러**:
   - 로컬과 클라우드 스키마가 불일치할 때 발생
   - 최신 클라우드 스키마로 로컬 DB 업데이트 필요

2. **UUID vs Integer ID 충돌**:
   - 현재는 UUID로 통일됨
   - 구버전 백업 사용 시 스키마 업데이트 필요

## 추가 리소스

- [Supabase 로컬 개발 가이드](https://supabase.com/docs/guides/local-development)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [Docker 설치 가이드](https://docs.docker.com/get-docker/)

---

**업데이트**: 2025-07-01  
**작성자**: Claude Code Assistant  
**버전**: v1.1.3