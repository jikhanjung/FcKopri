# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

LeagueHub는 축구/풋살 리그를 위한 완전한 리그 관리 시스템입니다. 다중 리그 관리, 사용자 인증, 실시간 기능과 예측 시스템을 포함한 종합적인 축구 리그 관리 솔루션을 제공합니다.

**기술 스택:**
- Next.js 14 (App Router 사용)
- TypeScript (완전한 타입 안정성)
- Tailwind CSS (유틸리티 기반 스타일링)
- Supabase (PostgreSQL + Realtime + Auth)
- Heroicons (일관된 아이콘 시스템)
- date-fns (날짜 처리)

**핵심 기능:**
- **사용자 인증 시스템** (이메일/비밀번호 + OAuth 소셜 로그인)
- **역할 기반 권한 관리** (SuperAdmin, CompetitionAdmin, User)
- **사용자 프로필 관리** (닉네임, 아바타, 부서 정보)
- **다중 대회 관리 시스템** (대회별 독립 운영)
- **리그 참여 신청 시스템** (사용자 신청 → 관리자 승인)
- **자동 리그 선택 페이지** (소속 리그 없는 사용자 자동 리다이렉트)
- 팀 및 선수 관리 (부서별 분류)
- 경기 일정 및 결과 관리
- 실시간 경기 진행 (골/어시스트 입력)
- 순위표 자동 계산 (팀 순위 & 개인 순위)
- 플레이오프 토너먼트 시스템
- 경기 결과 예측 시스템
- 우승팀 맞히기 기능
- MVP/베스트6 투표 시스템 (포지션별)
- 실시간 알림 시스템
- 데이터 내보내기 (JSON/CSV/Excel)
- 다크모드 지원
- 완전 반응형 디자인
- 전역 검색 기능
- 캘린더 뷰
- 경기/팀 사진 업로드 시스템
- Man of the Match 선정 시스템
- 경기별 다중 영상 시스템 (하이라이트, 골 장면, 전체 경기, 인터뷰, 분석 등)
- 댓글 시스템 (경기/사진/팀별, 답글, 좋아요/싫어요)
- 팀 네비게이션 및 경기 목록 (팀별 전적 통계)
- 자책골 시스템 (상대팀 득점 처리, 개인 통계 제외)
- 전반/후반 관리 시스템 (경기 진행 시 전후반 선택)
- 자동 시간 설정 (경기 진행 중 현재 분+1)
- 경기 이벤트 표시 개선 (골만 표시, 어시스트 통합)
- 이벤트 아이콘 시스템 (축구공⚽, 골대🥅)
- 무소속 팀 시스템 (선수 데이터 보존, 숨겨진 팀 관리)
- 종합 경기 편집 시스템 (날짜/시간, 팀, 점수, 상태)

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 린팅 실행
npm run lint

# 타입 체킹
npm run type-check

# 버전 업데이트 (version.json과 package.json 동기화)
npm run version:update
```

## 로컬 개발 환경 설정

### Supabase 로컬 개발 설정

이 프로젝트는 Supabase 로컬 개발 환경을 지원합니다.

#### 1. Supabase CLI 설치 및 설정

```bash
# Supabase CLI는 프로젝트에 devDependency로 설치되어 있음
npm install

# Supabase 로컬 서비스 시작
npx supabase start

# Supabase 상태 확인
npx supabase status

# Supabase 서비스 중지
npx supabase stop
```

#### 2. 환경 변수 설정

프로젝트는 두 가지 환경 변수 파일을 지원합니다:

- **`.env.local`**: Supabase Cloud 연결 (프로덕션 데이터)
- **`.env.development.local`**: 로컬 Supabase 연결 (개발용)

**로컬 개발 시** (`.env.development.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

#### 3. 환경 전환

Next.js는 다음 우선순위로 환경 변수를 로드합니다:

1. `.env.development.local` (개발 시 최우선)
2. `.env.local` (Supabase Cloud)
3. `.env.development`
4. `.env`

**환경 전환 방법:**
```bash
# 로컬 Supabase 사용
mv .env.development.local.backup .env.development.local

# Supabase Cloud 사용
mv .env.development.local .env.development.local.backup
```

#### 4. 로컬 Supabase 접속 정보

- **Database**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **API URL**: `http://127.0.0.1:54321`
- **Studio**: `http://127.0.0.1:54323`
- **Inbucket (Email)**: `http://127.0.0.1:54324`

### 데이터베이스 스키마 관리

#### 스키마 마이그레이션

```bash
# 데이터베이스 리셋 (마이그레이션 적용)
npx supabase db reset

# 스키마 변경사항 적용
npx supabase db push

# 클라우드에서 스키마 가져오기
npx supabase db dump -f supabase/schema.sql
```

현재 마이그레이션 파일:
- `supabase/migrations/20250701_cloud_schema.sql`: Supabase Cloud에서 덤프한 완전한 스키마

### 데이터 백업 및 복원

#### 백업 스크립트

```bash
# 데이터 백업 (현재 환경에 따라 로컬/클라우드 선택)
node backup-data.js

# 데이터 복원
node restore-data.js
```

**환경별 백업/복원:**
- `.env.development.local`이 **있으면** → 로컬 Supabase 사용
- `.env.development.local`이 **없으면** → Supabase Cloud 사용

#### 백업 파일 구조

```
backups/backup-YYYYMMDD-HHMMSS/
├── complete-backup.json     # 전체 데이터
├── schema.sql              # 데이터베이스 스키마
├── backup-summary.json     # 백업 요약
├── competitions.json       # 개별 테이블 데이터
├── teams.json
├── players.json
└── ...
```

### Docker 배포 (참고)

Docker를 사용한 배포 시 환경 변수 설정:

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
```

```bash
# 런타임 환경 변수 주입 (권장)
docker run -e NEXT_PUBLIC_SUPABASE_URL=xxx \
           -e NEXT_PUBLIC_SUPABASE_ANON_KEY=yyy \
           -e SUPABASE_SERVICE_ROLE_KEY=zzz \
           myapp

# 또는 env 파일 사용
docker run --env-file .env.production myapp
```

## 버전 관리

프로젝트는 두 개의 버전 파일을 사용합니다:
- **`version.json`**: 릴리즈 정보와 설명을 포함한 메인 버전 파일
- **`package.json`**: NPM 패키지 버전 (빌드 시 표시되는 버전)

### 버전 업데이트 방법:
```bash
# 자동 버전 업데이트 (권장)
npm run version:update

# 대화형 메뉴에서 선택:
# 1) major (2.0.0) - 주요 변경사항
# 2) minor (1.2.0) - 새로운 기능 추가  
# 3) patch (1.1.3) - 버그 수정
# 4) custom - 직접 버전 입력
```

이 명령어는 자동으로:
1. `version.json` 업데이트 (버전, 날짜, 설명)
2. `package.json` 버전 동기화
3. Git 태깅 가이드 제공

## 프로젝트 구조

```
FcKopri/
├── app/                     # Next.js 14 App Router
│   ├── admin/              # 관리자 페이지 (역할 기반 접근 제어)
│   │   ├── page.tsx        # 관리자 대시보드
│   │   ├── competition/    # 개별 대회 설정 관리
│   │   ├── competitions/   # 대회 목록 관리
│   │   ├── users/          # 사용자 및 권한 관리 (SuperAdmin만)
│   │   └── export/         # 데이터 내보내기
│   ├── auth/               # 인증 관련 페이지
│   │   ├── login/          # 로그인 페이지 (이메일/OAuth)
│   │   ├── callback/       # OAuth 콜백 처리
│   │   └── error/          # 인증 오류 처리
│   ├── api/                # API 엔드포인트 (IP 가져오기)
│   ├── awards/             # MVP/베스트6 투표 및 시상식
│   ├── calendar/           # 캘린더 뷰
│   ├── champion/           # 우승팀 맞히기
│   ├── matches/            # 경기 관리 및 상세
│   ├── playoffs/           # 플레이오프 토너먼트
│   ├── predictions/        # 경기 예측
│   ├── players/            # 선수 개인 프로필
│   ├── profile/            # 사용자 프로필 관리
│   ├── standings/          # 순위표
│   │   ├── page.tsx        # 팀 순위표
│   │   └── players/        # 개인 순위표
│   ├── stats/              # 통계 (메뉴에서 숨김)
│   ├── teams/              # 팀 관리
│   ├── globals.css         # 전역 스타일
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 홈페이지
├── components/             # 재사용 가능한 React 컴포넌트
│   ├── AdminRoute.tsx      # 역할 기반 라우트 보호 컴포넌트
│   ├── EmailLogin.tsx      # 이메일/비밀번호 로그인 컴포넌트
│   ├── SocialLogin.tsx     # OAuth 소셜 로그인 컴포넌트
│   ├── ChampionVoting.tsx  # 우승팀 투표 컴포넌트
│   ├── ChampionWidget.tsx  # 홈페이지 우승 후보 위젯
│   ├── ClientLayout.tsx    # 클라이언트 레이아웃 래퍼
│   ├── CommentSection.tsx  # 댓글 시스템 컴포넌트
│   ├── GlobalSearch.tsx    # 전역 검색 기능
│   ├── LivePredictionFeed.tsx # 실시간 예측 피드
│   ├── ManOfTheMatchSelector.tsx # MOTM 선정 컴포넌트
│   ├── MatchLive.tsx       # 실시간 경기 진행 관리
│   ├── MatchEvents.tsx     # 경기 이벤트 타임라인 컴포넌트
│   ├── MatchPhotos.tsx     # 경기 사진 업로드 컴포넌트
│   ├── MatchPrediction.tsx # 경기 예측 컴포넌트
│   ├── MatchScoreEvents.tsx # 스코어 카드 내 축약 이벤트
│   ├── Navigation.tsx      # 메인 네비게이션
│   ├── NotificationBell.tsx # 알림 벨
│   ├── TeamPhotos.tsx      # 팀 사진 업로드 컴포넌트
│   ├── ThemeToggle.tsx     # 다크모드 토글
│   ├── YouTubeManager.tsx  # 유튜브 영상 관리 컴포넌트
│   └── ...
├── contexts/               # React Context API
│   ├── AuthContext.tsx     # 사용자 인증 및 역할 관리 상태
│   ├── NotificationContext.tsx # 실시간 알림
│   └── ThemeContext.tsx    # 다크모드 테마
├── lib/                    # 유틸리티 함수
│   ├── export-utils.ts     # 데이터 내보내기 (JSON/CSV/Excel)
│   ├── playoff-utils.ts    # 플레이오프 로직
│   ├── unassigned-team-utils.ts # 무소속 팀 관리 유틸리티
│   └── supabase.ts         # Supabase 클라이언트 설정
├── types/                  # TypeScript 타입 정의
│   └── index.ts            # 전체 타입 정의
├── sql/                    # 데이터베이스 스키마 파일
│   ├── 16_user_profiles_table.sql     # 사용자 프로필 테이블
│   └── archive/            # 레거시 SQL 파일들
├── supabase/               # Supabase 설정 및 마이그레이션
│   ├── migrations/         # 데이터베이스 마이그레이션
│   │   ├── 20250702_user_profiles.sql    # 사용자 프로필 시스템
│   │   └── 20250703_user_roles_system.sql # 역할 기반 권한 시스템
│   └── config.toml         # Supabase 로컬 설정
├── README.md               # 프로젝트 문서
├── FEATURES.md             # 기능 명세서
└── CLAUDE.md               # Claude Code 가이드 (이 파일)
```

## 데이터베이스 스키마 (Supabase)

### 핵심 테이블
- `competitions` - 대회 정보 (KOPRI CUP, half_duration_minutes 포함)
- `teams` - 팀 정보 (이름, 부서, is_hidden으로 숨김 기능)
- `players` - 선수 정보 (이름, 소속팀, 무소속 팀 포함)
- `matches` - 리그 경기 (일정, 결과, 상태, MOTM)
- `playoff_matches` - 플레이오프 경기

### 실시간 기능 테이블
- `match_events` - 경기 이벤트 (골, 어시스트, 시간, 전반/후반, 자책골 정보)
- `match_predictions` - 경기 예측 (사용자별 스코어 예측)
- `champion_votes` - 우승팀 투표 (팀별 투표 및 확신도)

### 투표 및 평가 시스템 테이블
- `mvp_votes` - MVP 투표 데이터 (IP 기반 중복 방지)
- `best6_votes` - 베스트6 투표 데이터 (포지션별, IP 기반)
- `comments` - 댓글 시스템 (경기/사진/팀별, 중첩 답글)
- `comment_reactions` - 댓글 좋아요/싫어요

### 사용자 및 인증 테이블
- `auth.users` - Supabase Auth 사용자 테이블 (이메일, OAuth 정보)
- `user_profiles` - 사용자 프로필 (닉네임, 아바타, 부서, 자기소개)
- `user_roles` - 사용자 역할 관리 (SuperAdmin, CompetitionAdmin, User)

### 미디어 및 추가 기능 테이블
- `match_photos` - 경기 사진 (업로드, 캡션, 타입)
- `team_photos` - 팀 사진 (로고, 단체사진, 훈련사진, 일반사진)
- `match_videos` - 경기별 다중 영상 (하이라이트, 골 장면, 전체 경기, 인터뷰, 분석, 기타)

### Row Level Security (RLS) 및 권한 관리
- **인증 시스템**: Supabase Auth (이메일/비밀번호 + OAuth)
- **권한 체계**: 역할 기반 접근 제어 (RBAC)
- **읽기 권한**: 인증된 사용자 및 익명 사용자 (공개 데이터)
- **쓰기 권한**: 역할별 세분화된 권한 제어
- **관리자 권한**: SuperAdmin (모든 권한), CompetitionAdmin (대회 관리 권한)

## 아키텍처 패턴

### 상태 관리
- React Context API 사용
- `AuthContext`: 사용자 인증 및 역할 관리 (Supabase Auth 통합)
- `ThemeContext`: 다크모드 테마 상태
- `NotificationContext`: 실시간 알림 관리

### 인증 및 권한 시스템
- **Supabase Auth**: 이메일/비밀번호 + OAuth 소셜 로그인
- **지원 OAuth 제공자**: Google, Kakao, Naver
- **역할 기반 권한**: SuperAdmin, CompetitionAdmin, User
- **세션 관리**: JWT 토큰 기반 자동 갱신
- **보안**: Row Level Security (RLS) 정책 적용

### 실시간 기능
- Supabase Realtime 구독 사용
- 경기 이벤트 실시간 업데이트
- 예측/투표 실시간 반영
- 순위표 자동 갱신

### 컴포넌트 구조
- 재사용 가능한 컴포넌트 설계
- Props 인터페이스 명확히 정의
- 조건부 렌더링으로 성능 최적화
- 적절한 로딩 상태 구현

### 권한 관리
- `AdminRoute` 컴포넌트로 관리자 페이지 보호
- 역할별 조건부 UI 렌더링 (SuperAdmin/CompetitionAdmin/User)
- Supabase RLS로 데이터 접근 제어
- `useAuth` 훅으로 현재 사용자 권한 확인
- 세분화된 권한 체크 (`isSuperAdmin`, `isRoleAdmin`, `canCreateCompetitions` 등)

## 환경 변수

### 필수 환경 변수

**Supabase 기본 설정:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**OAuth 소셜 로그인 설정 (선택사항):**
```env
# Google OAuth (Supabase 대시보드에서 설정)
# Kakao OAuth (Supabase 대시보드에서 설정)  
# Naver OAuth (Supabase 대시보드에서 설정)
```

### OAuth 설정 가이드

1. **Supabase 대시보드** → Authentication → Providers에서 설정
2. **Google**: Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
3. **Kakao**: Kakao Developers에서 앱 생성 후 REST API 키 사용
4. **Naver**: Naver Developers에서 애플리케이션 등록 후 클라이언트 ID 사용

**Redirect URLs 설정:**
- Development: `http://localhost:3000/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

## 스타일링 가이드

### Tailwind CSS 사용
- 유틸리티 클래스 우선 사용
- 다크모드: `dark:` 접두사 활용
- 반응형: `sm:`, `md:`, `lg:`, `xl:` 브레이크포인트
- 컬러 시스템: `kopri-blue`, `kopri-lightblue` 커스텀 컬러

### 컴포넌트 스타일링
```tsx
// 기본 카드 스타일
className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"

// 버튼 스타일
className="bg-kopri-blue hover:bg-kopri-blue/80 text-white px-4 py-2 rounded-lg"

// 반응형 그리드
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

## 실시간 기능 구현

### Supabase Realtime 구독
```typescript
useEffect(() => {
  const channel = supabase
    .channel('channel_name')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name'
    }, (payload) => {
      // 실시간 업데이트 처리
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### 메모리 누수 방지
- 컴포넌트 언마운트 시 구독 해제 필수
- `useEffect` cleanup 함수 활용
- 조건부 구독으로 불필요한 연결 방지

## 개발 참고사항

### Next.js 14 App Router
- `app/` 디렉토리 구조 사용
- Server/Client Component 구분
- `'use client'` 지시어 필요한 곳에만 사용
- 메타데이터 API 활용

### TypeScript 사용
- 모든 컴포넌트 Props 인터페이스 정의
- 데이터베이스 응답 타입 명시
- `any` 타입 사용 최소화
- 타입 가드 함수 활용

### 성능 최적화
- React.memo로 불필요한 리렌더링 방지
- useMemo, useCallback 훅 활용
- 조건부 렌더링으로 DOM 최적화
- 이미지 최적화 (Next.js Image 컴포넌트)

### 에러 처리
- try-catch 블록으로 비동기 작업 보호
- 사용자 친화적 에러 메시지
- 로딩 상태 및 에러 상태 UI 제공
- Supabase 에러 응답 적절히 처리

### 접근성 (a11y)
- 시맨틱 HTML 요소 사용
- ARIA 레이블 적절히 활용
- 키보드 네비게이션 지원
- 충분한 컬러 대비 유지

### 모바일 최적화
- 터치 친화적 UI 요소
- 햄버거 메뉴로 모바일 네비게이션
- 적절한 터치 타겟 크기
- 스와이프 제스처 고려

## 특별 구현 사항

### 애니메이션 제거
- Framer Motion 라이브러리 제거됨
- 모든 애니메이션 효과 제거
- CSS transition만 사용

### 용어 통일
- "예측" → "경기 결과 맞히기"
- "우승팀 투표" → "우승팀 맞히기"
- "예측하기" → "참여하기"
- "포인트" → "공격포인트"
- 사용자 친화적 용어 사용

### 네비게이션 구조
- "투표" 드롭다운으로 통합 (기존 "예측" 메뉴에서 변경)
- 투표 서브메뉴: "경기 결과 맞히기", "우승팀 맞히기", "MVP 투표", "베스트6 투표"
- "순위" 드롭다운: "팀 순위", "개인 순위", "시상식"
- "통계" 메뉴 숨김 처리
- 모바일 반응형 햄버거 메뉴
- 관리자 전용 메뉴: 대회 설정, 데이터 내보내기

### 데이터 내보내기
- JSON, CSV, Excel 형식 지원
- UTF-8 BOM으로 한글 깨짐 방지
- 관리자 전용 기능

### 사진 업로드 시스템
- Supabase Storage 연동
- 경기별 사진 업로드 (캡션, 타입 분류)
- 팀별 사진 업로드 (로고, 단체사진, 훈련사진, 일반사진)
- Next.js Image 컴포넌트 최적화

### Man of the Match 시스템
- 경기별 최우수 선수 선정
- 관리자 전용 선정/변경/제거 기능
- 개인 순위에 MOTM 횟수 표시
- 모달 인터페이스로 선수 선택

### 개인 순위 시스템
- 득점/어시스트 기반 공격포인트 계산
- **자책골 제외 처리** (개인 통계에서 자책골은 득점으로 계산하지 않음)
- 득점순 기본 정렬
- MOTM 횟수 추가 표시
- 경기당 평균 포인트 계산

### MVP/베스트6 투표 시스템 (풋살 대회 특화)
- MVP 투표: IP 기반 중복 방지, 팬 투표로 최우수선수 선정
- 베스트6 투표: 포지션별 선정 (공격수 1명, 미드필더 2명, 수비수 2명, 골키퍼 1명)
- 실시간 투표 결과 집계 및 표시
- 시상식 페이지에서 결과 확인

### 댓글 시스템
- 경기별/사진별/팀별 댓글 작성
- 중첩 답글 지원 (최대 2단계)
- 좋아요/싫어요 기능
- IP 기반 작성자 식별 및 관리자 댓글 관리

### 유튜브 영상 연동
- 경기별 하이라이트 영상 링크 추가
- 유튜브 URL 자동 검증 및 썸네일 생성
- 임베드 영상 플레이어 제공
- 관리자 영상 관리 기능

### 자책골 시스템 구현
- **팀 득점 처리**: 자책골 시 상대팀 득점으로 기록
- **선수 선택 로직**: 자책골 체크 시 상대팀 선수 목록 표시
- **개인 통계 제외**: 자책골은 개인 득점 기록에서 제외
- **이벤트 표시**: 골대 아이콘(🥅)과 "(OG)" 라벨로 구분

### 전반/후반 관리 시스템
- **경기 진행 상태**: 전반/후반 선택 토글 버튼
- **시간 관리**: 전반(0분~), 후반(half_duration분~)으로 자동 계산
- **대회별 설정**: competitions 테이블의 half_duration_minutes 필드 활용
- **이벤트 기록**: match_events 테이블에 half 컬럼 추가

### 자동 시간 설정 기능
- **실시간 진행 중**: 경기 진행 중 이벤트 시간을 현재 분+1로 자동 설정
- **수동 조정 가능**: 관리자가 이벤트 시간 직접 수정 가능
- **타이머 연동**: 실시간 타이머와 연동하여 정확한 시간 계산

### 무소속 팀 시스템
- 선수 데이터 보존 중심 설계
- 팀 삭제 시 선수들 무소속 팀으로 자동 이동
- 팀에서 선수 제외 시 무소속 팀으로 이동 (삭제 대신)
- 숨겨진 특수 팀으로 일반 사용자에게 보이지 않음
- 자동 생성 및 관리 유틸리티 함수

### 종합 경기 편집 시스템
- 경기 날짜 및 시간 수정
- 홈팀/원정팀 변경 (드롭다운 선택)
- 경기 점수 및 상태 수정
- 실시간 팀 데이터 업데이트
- 종합적인 경기 정보 관리

### 사용자 인증 및 권한 시스템
- **다중 인증 방식**: 이메일/비밀번호 + OAuth (Google, Kakao, Naver)
- **역할 기반 접근 제어**: SuperAdmin, CompetitionAdmin, User
- **사용자 프로필 관리**: 닉네임, 아바타, 부서, 자기소개 편집
- **세션 관리**: JWT 토큰 기반 자동 갱신
- **권한별 UI**: 역할에 따른 조건부 렌더링

### 다중 대회 관리 시스템
- **대회 목록 페이지** (`/admin/competitions`): 모든 대회 조회 및 관리
- **개별 대회 설정** (`/admin/competition`): 특정 대회 상세 관리
- **대회별 독립 운영**: 각 대회마다 독립적인 설정 및 권한
- **권한 기반 접근**: SuperAdmin/CompetitionAdmin만 대회 생성/수정 가능
- **자동 리다이렉트**: 대회가 없을 시 목록 페이지로 이동

### 관리자 대시보드
- **역할별 대시보드** (`/admin`): 권한에 따른 사용 가능 기능 표시
- **사용자 관리** (`/admin/users`): SuperAdmin 전용 역할 할당 기능
- **권한 정보 표시**: 현재 사용자의 권한 레벨 안내
- **기능별 접근 제어**: 권한 없는 기능에 대한 명확한 안내

## 배포 가이드

### Vercel 배포 (권장)
1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포 활성화

### 데이터베이스 설정

#### 방법 1: 완전한 백업에서 복원 (권장)
```bash
# 1. 기존 프로젝트에서 백업 생성
node backup-data.js

# 2. 새 Supabase 프로젝트에서 스키마 복원
# SQL Editor에서 백업된 schema.sql 실행

# 3. 데이터 복원 (필요시)
node restore-data.js
```

#### 방법 2: 수동 설정
1. Supabase 프로젝트 생성
2. `sql/` 디렉토리의 파일들을 순서대로 실행:
   - `00_initial_schema.sql` (기본 테이블)
   - `01_match_events_table.sql` ~ `12_match_videos_table.sql` (확장 테이블)
   - `13_add_is_hidden_to_teams.sql` (팀 숨김 기능)
   - `create_unassigned_team.sql` (무소속 팀 생성)
   - `20_storage_setup.sql` (Storage 설정)
   - `30_security_policies.sql` (보안 정책)
3. Storage 버킷 자동 생성됨:
   - `match-photos` (경기 사진)
   - `team-photos` (팀 사진)

## 프로젝트 상태

**✅ 완전 완성된 프로덕션 준비 상태**

모든 핵심 기능이 구현되어 있으며, 실제 풋살 리그 운영에 바로 사용할 수 있는 수준입니다.

### 완성도
- 전체 기능: 100% 완성
- 모바일 최적화: 100% 완성  
- 실시간 기능: 100% 완성
- 관리자 기능: 100% 완성
- 사용자 기능: 100% 완성
- 데이터 관리: 100% 완성
- UI/UX: 100% 완성

### 주요 완성 기능
- ✅ 팀/선수 관리 시스템
- ✅ 경기 일정 및 결과 관리
- ✅ 실시간 경기 진행 (골/어시스트)
- ✅ 자동 순위표 계산 (팀 순위 & 개인 순위)
- ✅ 플레이오프 토너먼트
- ✅ 경기 결과 맞히기 시스템
- ✅ 우승팀 맞히기 기능
- ✅ MVP/베스트6 투표 시스템 (풋살 대회 특화)
- ✅ 실시간 알림 시스템
- ✅ 데이터 내보내기 (JSON/CSV/Excel)
- ✅ 다크모드 지원
- ✅ 완전 반응형 디자인
- ✅ 관리자 인증 시스템
- ✅ 전역 검색 기능
- ✅ 캘린더 뷰
- ✅ 통계 및 차트
- ✅ 경기 사진 업로드 시스템
- ✅ 팀 사진 업로드 시스템 (로고, 단체사진, 훈련사진, 일반사진)
- ✅ Man of the Match 선정 시스템
- ✅ 개인 순위 시스템 (공격포인트, MOTM 횟수)
- ✅ 실시간 예측 피드
- ✅ 경기별 다중 영상 시스템 (하이라이트, 골 장면, 전체 경기, 인터뷰, 분석)
- ✅ 댓글 시스템 (경기/사진/팀별, 답글, 좋아요/싫어요)
- ✅ 선수 개인 프로필 페이지 (상세 통계, 경기별 기록, 전사이트 연결점)
- ✅ 경기 이벤트 표시 시스템 (스코어 카드 내 축약 + 상세 타임라인, 선수명 클릭)
- ✅ Supabase Storage 이미지 최적화
- ✅ 완전한 백업/복원 시스템 (스키마 + 데이터 + 보안정책)
- ✅ 팀 네비게이션 시스템 (팀 순위표에서 팀명 클릭으로 상세 페이지 이동)
- ✅ 팀별 경기 목록 및 전적 통계 (팀 상세 페이지에서 모든 경기 결과 표시)

## 백업 및 마이그레이션

### 완전한 백업 시스템
- **스키마 백업**: `sql/` 디렉토리의 모든 파일을 통합하여 완전한 스키마 생성
- **데이터 백업**: 모든 테이블의 데이터를 JSON 형태로 백업
- **보안 정책 포함**: RLS, Storage 정책까지 완전히 백업
- **검증된 백업**: 실제 존재하는 테이블만 백업

### 백업 명령어
```bash
# 완전한 백업 (스키마 + 데이터)
node backup-data.js

# 데이터 복원
node restore-data.js
```

### SQL 스키마 관리
- `sql/` 디렉토리에 모든 스키마 파일을 번호순으로 정리
- 의존성 순서에 따른 안전한 실행 보장
- 개별 실행 또는 통합 백업 모두 지원

제 1회 KOPRI CUP 성공적인 개최를 위한 모든 준비가 완료되었습니다.