# FcKopri Database Migration System Guide

FcKopri 프로젝트의 데이터베이스 마이그레이션 시스템 구축 및 사용 가이드입니다.

## 📊 시스템 개요

Django/Rails와 같은 체계적인 마이그레이션 시스템을 Next.js + Supabase 환경에 구축했습니다.

### 🎯 주요 목표
- **다중 DB 환경 관리**: 프로덕션/테스트/개발 DB 각각 안전하게 관리
- **스키마 동기화**: 환경 간 스키마 일관성 보장
- **변경 이력 추적**: 모든 스키마 변경사항 체계적 추적
- **안전한 업데이트**: 롤백 가능한 마이그레이션 시스템

## 📁 디렉토리 구조

```
sql/
├── complete_schema_v1.1.3.sql    # 🎯 완전한 DB 스키마 (v1.1.3)
├── migrations/                   # 🔄 새로운 마이그레이션들 (v1.1.4+)
├── setup/                       # ⚙️ 일회성 설정 파일들
│   ├── 00_migration_tracker.sql  # 마이그레이션 추적 테이블
│   ├── 20_storage_setup.sql      # Supabase Storage 설정
│   └── 30_security_policies.sql  # 보안 정책
├── seeds/                       # 🌱 샘플/테스트 데이터
│   └── 99_sample_data.sql
├── archive/                     # 📦 이전 버전 아카이브
│   └── migrations_v1.1.3/       # v1.1.3까지의 개별 마이그레이션들
└── README.md                    # 상세 사용법
```

## 🚀 새로운 환경 설정

### 신규 데이터베이스 구축 (권장 방법)

#### 1. 완전한 스키마 적용
```sql
-- Supabase SQL Editor에서 실행
-- 파일: sql/complete_schema_v1.1.3.sql

-- 이 파일 하나로 모든 테이블과 기능이 생성됩니다:
-- ✅ 15개 핵심 테이블
-- ✅ 모든 인덱스
-- ✅ 기본 데이터 (대회, 무소속 팀)
-- ✅ 테이블 코멘트
```

#### 2. 필수 설정 적용
```bash
# 순서대로 Supabase SQL Editor에서 실행
1. sql/setup/00_migration_tracker.sql  # 마이그레이션 추적 시스템
2. sql/setup/20_storage_setup.sql      # Storage 버킷 설정
3. sql/setup/30_security_policies.sql  # 보안 정책
```

#### 3. 샘플 데이터 (선택사항)
```sql
-- 개발/테스트 환경에서만 실행
sql/seeds/99_sample_data.sql
```

## 🔄 마이그레이션 시스템 (v1.1.4+)

### NPM 명령어

```bash
# 마이그레이션 상태 확인
npm run migrate:status

# 대기 중인 마이그레이션 실행
npm run migrate:run

# 새 마이그레이션 생성
npm run migrate:create "add_notification_system"
```

### 새 기능 추가 워크플로우

#### 1. 마이그레이션 생성
```bash
npm run migrate:create "add_user_preferences"
# → sql/migrations/01_add_user_preferences.sql 생성
```

#### 2. SQL 작성
```sql
-- sql/migrations/01_add_user_preferences.sql
-- add_user_preferences
-- Migration: 01_add_user_preferences.sql
-- Created: 2025-07-01T12:00:00.000Z
-- Base Schema: v1.1.3

-- Add user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_ip VARCHAR(45) NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'ko',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_ip)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_ip ON user_preferences(user_ip);

-- Add comment
COMMENT ON TABLE user_preferences IS '사용자 개인 설정 테이블 (IP 기반)';
```

#### 3. 로컬에서 테스트
```bash
npm run migrate:run
npm run migrate:status  # 확인
```

#### 4. 테스트 DB에 적용
```bash
# 테스트 환경 변수 설정 후
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-test-key \
npm run migrate:run
```

#### 5. 프로덕션 배포
```bash
# 프로덕션 환경에서 실행
npm run migrate:run
```

## 🎯 환경별 사용 가이드

### 프로덕션 환경

```bash
# 기존 환경 - 마이그레이션으로 업데이트
npm run migrate:status    # 현재 상태 확인
npm run migrate:run       # 대기 중인 마이그레이션 실행

# 새 환경 - 완전한 스키마로 구축
# → Supabase에서 complete_schema_v1.1.3.sql 실행
```

### 테스트 환경 (별도 Supabase 프로젝트)

```bash
# 1. 새 Supabase 프로젝트 생성
# 2. 완전한 스키마 적용
#    → complete_schema_v1.1.3.sql을 SQL Editor에서 실행
# 3. 설정 파일들 실행 (setup/ 폴더)
# 4. 마이그레이션 시스템 초기화
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-test-key \
npm run migrate:status
```

### 로컬 개발 환경

```bash
# Supabase CLI 사용 시
supabase start                    # 로컬 DB 시작
npm run migrate:run               # 마이그레이션 적용
npm run migrate:status            # 상태 확인
```

## 📊 마이그레이션 추적 시스템

### schema_migrations 테이블

모든 마이그레이션은 `schema_migrations` 테이블에 자동 기록됩니다:

```sql
-- 테이블 구조
CREATE TABLE schema_migrations (
  version VARCHAR(255) PRIMARY KEY,    -- 마이그레이션 버전 (01, 02, ...)
  description TEXT,                    -- 마이그레이션 설명
  applied_at TIMESTAMP DEFAULT NOW(),  -- 적용 시각
  checksum TEXT                        -- 파일 무결성 검증용
);
```

### 상태 확인 쿼리

```sql
-- 적용된 마이그레이션 목록
SELECT version, description, applied_at 
FROM schema_migrations 
ORDER BY applied_at DESC;

-- 현재 스키마 버전
SELECT MAX(version) as current_version 
FROM schema_migrations;

-- 마이그레이션 통계
SELECT 
  COUNT(*) as total_migrations,
  MAX(applied_at) as last_migration_date
FROM schema_migrations;
```

## 📋 현재 스키마 포함 기능 (v1.1.3)

### 🏗️ 핵심 시스템
- **competitions** - 대회 정보 (전반 시간 설정 포함)
- **teams** - 팀 정보 (숨김 기능, 무소속 팀)
- **players** - 선수 정보
- **matches** - 경기 정보 (MOTM, 유튜브 링크)

### ⚽ 실시간 경기 관리
- **match_events** - 골/어시스트 (전반/후반, 자책골 지원)
- **playoff_matches** - 플레이오프 토너먼트

### 🗳️ 투표 및 예측 시스템
- **match_predictions** - 경기 예측 (IP 기반)
- **champion_votes** - 우승팀 투표
- **mvp_votes** - MVP 투표 (IP 기반 중복 방지)
- **best6_votes** - 베스트6 투표 (포지션별)

### 📸 미디어 시스템
- **match_photos** - 경기 사진
- **team_photos** - 팀 사진 (로고, 단체사진, 훈련사진, 일반사진)
- **match_videos** - 경기별 다중 영상

### 💬 소셜 기능
- **comments** - 댓글 시스템 (경기/사진/팀별, 중첩 답글)
- **comment_reactions** - 댓글 좋아요/싫어요

### 🔧 시스템
- **schema_migrations** - 마이그레이션 추적

## ⚠️ 중요 사항 및 주의점

### 새 환경 구축 시
✅ **권장**: `complete_schema_v1.1.3.sql` 사용  
❌ **비권장**: 개별 마이그레이션 파일들 실행 (archive 폴더에 보관됨)

### 기존 환경 업데이트 시
✅ **권장**: `npm run migrate:run` 사용  
❌ **비권장**: 수동 스키마 수정

### 파일 수정 정책
- **complete_schema_v1.1.3.sql**: 수정 금지 (완성된 스키마)
- **migrations/*.sql**: 적용 전까지 수정 가능 (적용 후 체크섬 경고)
- **setup/*.sql**: 환경별로 수정 가능

### 백업 정책
- **프로덕션 마이그레이션 전**: 반드시 전체 백업
- **테스트 먼저**: 항상 테스트 환경에서 검증 후 프로덕션 적용
- **롤백 계획**: 문제 발생 시 복구 계획 수립

## 🔧 트러블슈팅

### 마이그레이션 실패 시
```bash
# 1. 상태 확인
npm run migrate:status

# 2. 로그 확인
# 콘솔 출력에서 에러 메시지 확인

# 3. 수동 수정 후 재시도
# 문제된 SQL 수정 후
npm run migrate:run
```

### 체크섬 경고 시
```bash
# 경고 메시지 예시:
# ⚠️ Warning: 01_add_feature has been modified since it was applied

# 이미 적용된 마이그레이션을 수정한 경우 발생
# 새로운 마이그레이션 파일을 생성하여 변경사항 적용 권장
```

### 환경 간 불일치 시
```bash
# 각 환경의 마이그레이션 상태 확인
npm run migrate:status

# 누락된 마이그레이션 적용
npm run migrate:run
```

## 🏷️ 버전 정보

- **현재 완성 버전**: v1.1.3 (complete_schema)
- **다음 마이그레이션**: v1.1.4+ (migrations/ 폴더)
- **마이그레이션 시스템 구축일**: 2025-07-01
- **지원 환경**: PostgreSQL (Supabase)

## 🎉 시스템 장점

### 개발팀 관점
- **안전한 스키마 변경**: 실수 위험 최소화
- **환경 일관성**: 개발/테스트/프로덕션 동일 스키마
- **변경 이력**: 언제 누가 무엇을 바꿨는지 완전 추적

### 운영팀 관점  
- **빠른 환경 구축**: 새 DB 환경 5분 내 구축
- **안전한 업데이트**: 단계별 검증된 배포
- **롤백 지원**: 문제 시 이전 상태로 복구

### 테스트 관점
- **격리된 테스트**: 독립적인 테스트 DB 환경
- **데이터 무결성**: 스키마 일관성 보장
- **자동화 지원**: CI/CD 파이프라인 통합 가능

---

**이제 Django/Rails 수준의 안전하고 체계적인 데이터베이스 관리가 가능합니다!**