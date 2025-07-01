# FcKopri Database Management

이 디렉토리는 FcKopri 프로젝트의 데이터베이스 관리 시스템입니다.

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
└── README.md                    # 이 파일
```

## 🚀 새로운 환경 설정 (권장)

### 1. 완전한 스키마 적용
```bash
# Supabase SQL Editor에서 실행
sql/complete_schema_v1.1.3.sql
```

### 2. 필수 설정 적용
```bash
# 순서대로 실행
sql/setup/00_migration_tracker.sql
sql/setup/20_storage_setup.sql  
sql/setup/30_security_policies.sql
```

### 3. 샘플 데이터 (선택사항)
```bash
sql/seeds/99_sample_data.sql
```

## 🔄 마이그레이션 시스템 (v1.1.4+)

### 새 기능 추가 시
```bash
# 1. 새 마이그레이션 생성
npm run migrate:create "add_notification_system"
# → sql/migrations/01_add_notification_system.sql 생성

# 2. SQL 작성
# ... 마이그레이션 파일에서 SQL 작성

# 3. 마이그레이션 실행
npm run migrate:run

# 4. 상태 확인
npm run migrate:status
```

## 📋 현재 스키마 (v1.1.3) 포함 기능

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

## 🎯 환경별 사용법

### 프로덕션 환경
```bash
# 기존 환경이면 마이그레이션만 실행
npm run migrate:run

# 새 환경이면 완전한 스키마 적용
# → complete_schema_v1.1.3.sql 실행
```

### 테스트 환경 (별도 Supabase 프로젝트)
```bash
# 1. 완전한 스키마 적용
# → complete_schema_v1.1.3.sql을 테스트 DB에 실행

# 2. 마이그레이션 시스템 설정
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-test-key \
npm run migrate:run
```

### 로컬 개발 환경
```bash
# Supabase 로컬 개발 서버 사용시
supabase start  # 로컬 DB 시작
npm run migrate:run  # 마이그레이션 적용
```

## 📊 마이그레이션 추적

모든 마이그레이션은 `schema_migrations` 테이블에 기록:

```sql
-- 적용된 마이그레이션 확인
SELECT version, description, applied_at 
FROM schema_migrations 
ORDER BY applied_at DESC;

-- 현재 스키마 버전 확인
SELECT MAX(version) as current_version 
FROM schema_migrations;
```

## ⚠️ 중요 사항

### 새 환경 구축 시
✅ **권장**: `complete_schema_v1.1.3.sql` 사용  
❌ **비권장**: 개별 마이그레이션 파일들 (archive 폴더에 보관)

### 기존 환경 업데이트 시
✅ **권장**: `npm run migrate:run` 사용  
❌ **비권장**: 수동 스키마 수정

### 파일 수정 시
- `complete_schema_v1.1.3.sql`: 수정 금지 (완성된 스키마)
- `migrations/` 새 파일들: 필요시 수정 가능 (체크섬 경고 표시)

## 🏷️ 버전 정보

- **현재 완성 버전**: v1.1.3 (complete_schema)
- **다음 마이그레이션**: v1.1.4+ (migrations/ 폴더)
- **마지막 업데이트**: 2025-07-01

---

**이제 Django/Rails처럼 깔끔한 마이그레이션 시스템으로 안전하게 DB를 관리할 수 있습니다!**

- 새 환경: 통합 스키마로 빠른 구축
- 기존 환경: 마이그레이션으로 안전한 업데이트
- 다중 환경: 각각 독립적으로 추적 관리