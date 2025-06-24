# FcKopri Database SQL Scripts

이 디렉토리는 FcKopri 프로젝트의 모든 데이터베이스 스키마와 설정 파일을 포함합니다.

## 실행 순서

다음 순서대로 SQL 파일을 실행하여 데이터베이스를 설정하세요:

### 1. 초기 스키마 (00-19)
- `00_initial_schema.sql` - 기본 테이블 (competitions, teams, players, matches)
- `01_match_events_table.sql` - 경기 이벤트 테이블 (골, 어시스트)
- `02_match_predictions_table.sql` - 경기 예측 테이블
- `03_champion_votes_table.sql` - 우승팀 투표 테이블
- `04_add_man_of_the_match.sql` - Man of the Match 컬럼 추가
- `05_match_photos_table.sql` - 경기 사진 테이블
- `06_team_photos_table.sql` - 팀 사진 테이블
- `07_mvp_votes_table.sql` - MVP 투표 테이블
- `08_comments_table.sql` - 댓글 시스템 테이블
- `09_add_youtube_links.sql` - 유튜브 링크 컬럼 추가
- `10_best6_votes_table.sql` - 베스트6 투표 테이블 (포지션별)
- `11_playoff_matches_table.sql` - 플레이오프 경기 테이블

### 2. Storage 설정 (20-29)
- `20_storage_setup.sql` - Supabase Storage 버킷 및 정책 설정

### 3. 보안 설정 (30-39)
- `30_security_policies.sql` - RLS 정책 및 권한 설정

### 4. 데이터 수정/마이그레이션 (90-98)
- `90_fix_missing_departments.sql` - 부서 정보 수정

### 5. 샘플 데이터 (99)
- `99_sample_data.sql` - 개발/테스트용 샘플 데이터

## 주요 테이블 설명

### 핵심 테이블
- **competitions** - 대회 정보
- **teams** - 팀 정보 (부서별 분류)
- **players** - 선수 정보
- **matches** - 리그 경기
- **playoff_matches** - 플레이오프 경기

### 실시간 기능
- **match_events** - 경기 이벤트 (골, 어시스트, 실시간)
- **match_predictions** - 경기 예측
- **champion_votes** - 우승팀 투표

### 투표 시스템
- **mvp_votes** - MVP 투표 (IP 기반 중복 방지)
- **best6_votes** - 베스트6 투표 (포지션별)

### 미디어 & 소셜
- **match_photos** - 경기 사진
- **team_photos** - 팀 사진 (로고, 단체사진, 훈련사진, 일반사진)
- **comments** - 댓글 시스템 (경기/사진/팀별, 중첩 답글)
- **comment_reactions** - 댓글 좋아요/싫어요

## 실행 방법

### Supabase Dashboard에서
1. SQL Editor 열기
2. 파일 순서대로 복사-붙여넣기 후 실행

### CLI로 (psql 사용시)
```bash
# 순서대로 실행
psql -h your-host -U your-user -d your-db -f sql/00_initial_schema.sql
psql -h your-host -U your-user -d your-db -f sql/01_match_events_table.sql
# ... 계속
```

## 주의사항

1. **실행 순서 중요** - 테이블 간 의존성 때문에 순서대로 실행해야 함
2. **Storage 설정** - Supabase Storage 버킷 생성 필요:
   - `match-photos`
   - `team-photos`
3. **RLS 설정** - 현재는 비활성화 상태 (클라이언트 사이드 인증 사용)
4. **샘플 데이터** - 프로덕션에서는 실행하지 말 것

## 백업 및 복원

- 스키마 백업: `backup-schema.sql` 참조
- 데이터 백업: `backup-data.js` 스크립트 사용
- 데이터 복원: `restore-data.js` 스크립트 사용

## 기존 파일 매핑

이전에 흩어져 있던 SQL 파일들이 다음과 같이 정리되었습니다:

- `lib/database.sql` → `00_initial_schema.sql`
- `supabase/migrations/20250623103855_add_match_events_table.sql` → `01_match_events_table.sql`
- `match_predictions_table.sql` → `02_match_predictions_table.sql`
- `champion_votes_table.sql` → `03_champion_votes_table.sql`
- `add_man_of_the_match.sql` → `04_add_man_of_the_match.sql`
- `match_photos_table.sql` → `05_match_photos_table.sql`
- `team_photos_table.sql` → `06_team_photos_table.sql`
- `mvp_votes_table.sql` → `07_mvp_votes_table.sql`
- `comments_table.sql` → `08_comments_table.sql`
- `add_youtube_links.sql` → `09_add_youtube_links.sql`
- `TEAM_STORAGE_SETUP.sql` → `20_storage_setup.sql`
- `fix-missing-departments.sql` → `90_fix_missing_departments.sql`
- `lib/sample-data.sql` → `99_sample_data.sql`

## 새로 생성된 파일

- `10_best6_votes_table.sql` - 베스트6 투표 테이블 (누락되었던 테이블)
- `11_playoff_matches_table.sql` - 플레이오프 경기 테이블 (누락되었던 테이블)
- `30_security_policies.sql` - 보안 정책 통합 파일