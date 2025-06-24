# FcKopri Database Backup & Restore Guide

## 개요
이 가이드는 FcKopri 프로젝트의 Supabase 데이터베이스를 완전히 백업하고 복원하는 방법을 설명합니다.

## 백업 파일 구성

### 1. `sql/` 디렉토리
- 모든 SQL 스키마 파일을 체계적으로 정리
- 번호순 명명으로 실행 순서 보장
- 테이블, 인덱스, 트리거, Storage 정책, 보안 정책 포함

### 2. `backup-data.js`
- **완전한 스키마 생성**: `sql/` 디렉토리의 모든 파일을 결합하여 완전한 스키마 생성
- **모든 데이터 백업**: 존재하는 모든 테이블의 데이터를 JSON 형식으로 백업
- **백업 검증**: 실제 존재하는 테이블만 백업 대상으로 확인
- 각 테이블별 개별 파일과 전체 백업 파일 생성
- 백업 요약 정보 포함

### 3. `restore-data.js`
- JSON 백업 파일에서 데이터 복원
- 기존 데이터 삭제 후 새 데이터 입력
- 의존성 순서에 따라 안전하게 복원

## 사용 방법

### 완전한 백업 (스키마 + 데이터)

#### 백업 실행
```bash
# 의존성 설치 (최초 1회)
npm install @supabase/supabase-js dotenv

# 완전한 백업 실행 (스키마 + 데이터)
node backup-data.js
```

백업 결과:
- `backups/backup-YYYY-MM-DD/` 디렉토리에 저장
- `schema.sql`: **완전한 스키마** (테이블, 인덱스, 트리거, Storage 정책, 보안 정책 포함)
- 각 테이블별 JSON 파일
- `complete-backup.json`: 전체 백업
- `backup-summary.json`: 백업 요약

#### 스키마 복원 (새 Supabase 프로젝트)
1. 새 Supabase 프로젝트 생성
2. SQL Editor에서 백업된 `schema.sql` 내용 실행
3. Storage 버킷이 자동 생성됨:
   - `match-photos`
   - `team-photos`
4. 보안 정책도 자동 적용됨

### 수동 스키마 설정 (sql 디렉토리 사용)

개별 SQL 파일들을 직접 실행하려면:
```bash
# sql 디렉토리의 파일들을 순서대로 실행
# 00_initial_schema.sql → 01_match_events_table.sql → ... → 30_security_policies.sql
```

자세한 실행 순서는 `sql/README.md` 참조

### 데이터 복원

```bash
# 복원 실행
node restore-data.js
```

복원 과정:
1. 사용 가능한 백업 목록 표시
2. 백업 선택 (기본: 최신 백업)
3. 백업 정보 확인
4. 기존 데이터 삭제 확인
5. 데이터 복원 진행

## 환경 변수 설정

`.env` 파일에 다음 변수 필수:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 주의사항

1. **데이터 복원 시 기존 데이터가 모두 삭제됩니다**
2. Service Role Key는 보안에 주의하여 관리
3. 백업 파일은 git에 커밋하지 않도록 `.gitignore`에 추가
4. 프로덕션 환경에서는 정기적인 백업 권장

## 백업 주기 권장사항

- **일일 백업**: 경기 시즌 중
- **주간 백업**: 비시즌
- **즉시 백업**: 중요한 데이터 변경 전후

## 문제 해결

### 백업 실패 시
- Supabase 연결 확인
- 환경 변수 확인
- Service Role Key 권한 확인

### 복원 실패 시
- 테이블 의존성 순서 확인
- 외래 키 제약 조건 확인
- 백업 파일 무결성 확인

## 새로운 백업 시스템의 장점

1. **완전한 스냅샷**: 스키마와 데이터가 하나의 백업에 포함
2. **보안 정책 포함**: RLS, Storage 정책까지 완전히 백업
3. **검증된 백업**: 실제 존재하는 테이블만 백업
4. **쉬운 복원**: 새 프로젝트에서 한 번에 완전한 환경 재현
5. **체계적 관리**: `sql/` 디렉토리로 모든 스키마 파일 통합 관리

## 백업 파일 구조

```
# 프로젝트 구조
sql/                            # 모든 SQL 스키마 파일 (번호순 정리)
├── 00_initial_schema.sql       # 기본 테이블
├── 01_match_events_table.sql   # 경기 이벤트
├── ...
├── 20_storage_setup.sql        # Storage 정책
├── 30_security_policies.sql    # 보안 정책
└── README.md                   # SQL 실행 가이드

# 백업 결과물
backups/
└── backup-2025-06-24T10-30-00-000Z/
    ├── schema.sql              # 완전한 스키마 (sql/ 디렉토리 전체 결합)
    ├── complete-backup.json     # 전체 백업 데이터
    ├── backup-summary.json      # 백업 요약 정보
    ├── competitions.json        # 대회 데이터
    ├── teams.json              # 팀 데이터
    ├── players.json            # 선수 데이터
    ├── matches.json            # 경기 데이터
    └── ...                     # 기타 테이블
```