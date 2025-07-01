# FcKopri - KOPRI CUP 풋살 리그 관리 시스템

제 1회 KOPRI CUP을 위한 완전한 풋살 리그 관리 웹 애플리케이션입니다.

## 🚀 주요 기능

### 🔐 사용자 인증 및 권한 관리
- **다중 인증**: 이메일/비밀번호 + OAuth 소셜 로그인 (Google, Kakao, Naver)
- **역할 기반 권한**: SuperAdmin (최고 관리자), CompetitionAdmin (대회 관리자), User (일반 사용자)
- **사용자 프로필**: 닉네임, 아바타, 부서, 자기소개 관리
- **관리자 대시보드**: 권한별 기능 접근 제어
- **세션 관리**: JWT 토큰 기반 자동 갱신

### 🏆 다중 대회 관리
- **대회 목록 관리**: 여러 대회 동시 운영 지원
- **대회별 설정**: 독립적인 대회 정보 및 권한 관리
- **권한 기반 접근**: 역할에 따른 대회 생성/수정/삭제 권한
- **사용자 관리**: SuperAdmin 전용 역할 할당 시스템

### 📊 리그 관리
- **팀 및 선수 관리**: 부서별 팀 구성, 선수 등록 및 관리
- **무소속 팀 시스템**: 선수 데이터 보존 중심 설계 (삭제 대신 무소속 팀으로 이동)
- **경기 일정 관리**: 리그전 및 플레이오프 경기 스케줄링
- **종합 경기 편집**: 날짜/시간, 홈팀/원정팀, 점수, 상태 통합 관리
- **대회 설정 관리**: 대회명, 기간, 설명 편집 시스템
- **순위표**: 실시간 자동 계산 (팀 순위 & 개인 순위)
  - 팀 순위: 승점, 득실차, 다득점 순
  - 개인 순위: 득점, 어시스트, 공격포인트, MOTM 횟수
- **플레이오프 시스템**: 리그 완료 후 자동 토너먼트 브래킷 생성

### ⚽ 실시간 경기 진행
- **라이브 스코어**: 실시간 골 및 어시스트 입력
- **자책골 시스템**: 자책골 시 상대팀 득점 처리, 개인 통계 제외
- **전반/후반 관리**: 경기 진행 시 전후반 선택 및 시간 관리
- **자동 시간 설정**: 경기 진행 중 이벤트 시간 자동 설정 (현재 분+1)
- **경기 이벤트**: 시간별 득점 기록 및 선수별 통계
- **이벤트 표시 개선**: 골만 표시하고 어시스트는 골 이벤트에 포함
- **아이콘 시스템**: 축구공(⚽), 골대(🥅) 아이콘으로 시각적 개선
- **Man of the Match**: 경기별 최우수 선수 선정 시스템
- **실시간 알림**: Supabase Realtime을 통한 즉시 업데이트

### 🎯 투표 시스템
- **경기 결과 맞히기**: 사용자별 경기 예측 및 정확도 리더보드
- **우승팀 맞히기**: 토너먼트 우승팀 예측 시스템
- **MVP 투표**: 팬 투표 기반 최우수선수 선정
- **베스트6 투표**: 포지션별 베스트 선수 선정 (공격수1, 미드필더2, 수비수2, 골키퍼1)
- **실시간 피드**: 새로운 예측/투표 실시간 알림
- **예측 통계**: 예측 참여율 및 정확도 분석

### 📈 통계 및 분석
- **상세 통계**: 팀별/선수별 성과 분석
- **시각화**: 차트와 그래프를 통한 데이터 표현
- **데이터 내보내기**: JSON, CSV, Excel 형식 지원 (UTF-8 BOM 한글 지원)
- **사진 관리**: 경기/팀별 사진 업로드 및 갤러리
- **하이라이트 영상**: 경기별 유튜브 영상 연동 및 썸네일 자동 생성
- **댓글 시스템**: 경기별/사진별/팀별 댓글 및 답글, 좋아요/싫어요 기능

### 🎨 사용자 경험
- **다크 모드**: 테마 전환 기능
- **반응형 디자인**: 모바일/데스크톱 최적화
- **실시간 검색**: 팀, 선수, 경기 통합 검색
- **캘린더 뷰**: 월별 경기 일정 시각화
- **애니메이션 없는 디자인**: 안정적인 성능과 접근성

## 🛠 기술 스택

**최신 기술 스택으로 구성된 안정적인 시스템:**

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Database**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **Authentication**: Supabase Auth (이메일/비밀번호 + OAuth)
- **Authorization**: 역할 기반 접근 제어 (RBAC)
- **Styling**: Tailwind CSS (커스텀 kopri-blue 컬러)
- **Icons**: Heroicons
- **Date Handling**: date-fns (한국어 로케일)
- **Charts**: 내장 차트 컴포넌트
- **Image Handling**: Next.js Image 컴포넌트 최적화
- **State Management**: React Context API
- **Real-time**: Supabase Realtime subscriptions

## 📦 설치 및 실행

1. **저장소 클론**
```bash
git clone [repository-url]
cd FcKopri
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
`.env.local` 파일을 생성하고 다음 내용을 추가:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**OAuth 소셜 로그인 설정 (선택사항):**
- Supabase 대시보드 → Authentication → Providers에서 설정
- Google: Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
- Kakao: Kakao Developers에서 앱 생성 후 REST API 키 사용
- Naver: Naver Developers에서 애플리케이션 등록 후 클라이언트 ID 사용

**Redirect URLs:**
- Development: `http://localhost:3000/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

4. **데이터베이스 설정**

**방법 1: Supabase CLI 사용 (권장)**
```bash
# Supabase 로컬 개발 환경 시작
npx supabase start

# 마이그레이션 적용
npx supabase db reset
```

**방법 2: 수동 설정**
Supabase SQL Editor에서 다음 마이그레이션 파일들을 실행:
- `supabase/migrations/20250702_user_profiles.sql` (사용자 프로필 시스템)
- `supabase/migrations/20250703_user_roles_system.sql` (역할 기반 권한 시스템)

**Storage 버킷 (자동 생성됨):**
- `match-photos` (경기 사진)
- `team-photos` (팀 사진)

**초기 사용자 설정:**
1. `/auth/login`에서 회원가입
2. Supabase 대시보드에서 첫 사용자를 SuperAdmin으로 설정:
```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('your-user-id', 'superadmin');
```

5. **개발 서버 실행**
```bash
npm run dev
```

6. **프로덕션 빌드**
```bash
npm run build
npm start
```

## 🔄 버전 관리

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

### 개발 명령어:
```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 시작
npm run lint         # 린팅 실행
npm run type-check   # 타입 체킹
npm run version:update # 버전 업데이트
```

## 📁 프로젝트 구조

```
FcKopri/
├── app/                     # Next.js 14 App Router
│   ├── admin/              # 관리자 페이지
│   ├── api/                # API 엔드포인트 (IP 가져오기)
│   ├── awards/             # MVP/베스트6 투표 및 시상식
│   ├── calendar/           # 캘린더 뷰
│   ├── champion/           # 우승팀 맞히기
│   ├── matches/            # 경기 관리
│   ├── playoffs/           # 플레이오프
│   ├── predictions/        # 경기 예측
│   ├── standings/          # 순위표
│   │   ├── page.tsx        # 팀 순위표
│   │   └── players/        # 개인 순위표
│   ├── stats/              # 통계 (메뉴에서 숨김)
│   └── teams/              # 팀 관리
├── components/             # 재사용 가능한 React 컴포넌트
│   ├── AdminRoute.tsx      # 관리자 전용 라우트
│   ├── ChampionVoting.tsx  # 우승팀 투표
│   ├── CommentSection.tsx  # 댓글 시스템
│   ├── GlobalSearch.tsx    # 전역 검색
│   ├── LivePredictionFeed.tsx # 실시간 예측 피드
│   ├── ManOfTheMatchSelector.tsx # MOTM 선정
│   ├── MatchLive.tsx       # 실시간 경기 진행
│   ├── MatchPhotos.tsx     # 경기 사진 관리
│   ├── MatchPrediction.tsx # 경기 예측
│   ├── Navigation.tsx      # 네비게이션
│   ├── TeamPhotos.tsx      # 팀 사진 관리
│   ├── YouTubeManager.tsx  # 유튜브 영상 관리
│   └── ...
├── contexts/               # React Context 
│   ├── AuthContext.tsx     # 인증 상태
│   ├── NotificationContext.tsx # 실시간 알림
│   └── ThemeContext.tsx    # 다크모드
├── lib/                    # 유틸리티 함수
│   ├── export-utils.ts     # 데이터 내보내기
│   ├── playoff-utils.ts    # 플레이오프 로직
│   ├── unassigned-team-utils.ts # 무소속 팀 관리
│   └── supabase.ts         # 데이터베이스 연결
├── types/                  # TypeScript 타입 정의
├── *.sql                   # 데이터베이스 스키마
├── TODO2.md                # 향후 개발 로드맵
└── FEATURES.md             # 기능 상세 명세
```

## 🗄 데이터베이스 스키마

### 핵심 테이블
- **teams**: 팀 정보 (이름, 부서, is_hidden으로 숨김 기능)
- **players**: 선수 정보 (이름, 소속팀, 무소속 팀 포함)
- **matches**: 경기 정보 (일정, 결과, 상태, MOTM)
- **competitions**: 대회 정보 (이름, 기간, 설명)
- **playoff_matches**: 플레이오프 경기

### 실시간 기능
- **match_events**: 경기 이벤트 (골, 어시스트, 시간)
- **match_predictions**: 경기 예측 데이터
- **champion_votes**: 우승팀 투표 데이터

### 투표 및 평가 시스템
- **mvp_votes**: MVP 투표 데이터
- **best6_votes**: 베스트6 투표 데이터 (포지션별)
- **comments**: 댓글 시스템 (경기/사진/팀별)
- **comment_reactions**: 댓글 좋아요/싫어요

### 미디어 및 추가 기능
- **match_photos**: 경기 사진 (업로드, 캡션, 타입)
- **team_photos**: 팀 사진 (로고, 단체사진, 훈련사진, 일반사진)
- **matches**: 유튜브 링크 필드 추가 (하이라이트 영상)

### 권한 관리
- Row Level Security (RLS) 비활성화 (클라이언트 사이드 인증 사용)
- 읽기: 모든 사용자
- 쓰기: 클라이언트 사이드 관리자 인증

## 🎯 사용 가이드

### 관리자 기능
1. `/admin/login`에서 암호로 로그인
2. 팀 및 선수 등록/수정
3. 경기 일정 생성 및 관리
4. 실시간 경기 진행 관리 (골, 어시스트 입력)
5. Man of the Match 선정
6. 경기/팀 사진 업로드 및 관리
7. 유튜브 하이라이트 영상 연동
8. 플레이오프 브래킷 생성
9. 댓글 관리 (삭제 권한)
10. 데이터 내보내기 (JSON, CSV, Excel)
11. 대회 설정 관리 (이름, 기간, 설명 편집)
12. 종합 경기 편집 (날짜/시간, 팀, 점수, 상태)
13. 무소속 팀 자동 관리

### 사용자 기능
1. 실시간 순위표 확인 (팀 순위 & 개인 순위)
2. 경기 결과 예측 참여 ("경기 결과 맞히기")
3. 우승팀 예측 참여 ("우승팀 맞히기")
4. MVP 투표 및 베스트6 투표 참여
5. 하이라이트 영상 시청
6. 댓글 작성 및 좋아요/싫어요
7. 통계 및 차트 확인
8. 캘린더 뷰로 경기 일정 확인
9. 경기/팀 사진 갤러리 보기
10. 전역 검색 기능 사용

## 🔄 실시간 기능

- **Supabase Realtime** 활용
- 경기 결과 즉시 반영
- 예측/투표 실시간 업데이트
- 순위표 자동 갱신
- 실시간 알림 시스템

## 📊 내보내기 기능

지원 형식:
- **JSON**: 개발자용, 백업용
- **CSV**: Excel, Google Sheets용 (UTF-8 BOM으로 한글 깨짐 방지)
- **Excel**: Microsoft Office용

내보내기 데이터:
- 팀 정보 (부서별 분류)
- 선수 정보 (소속팀 포함)
- 경기 데이터 (일정, 결과, MOTM)
- 순위표 (팀 순위 & 개인 순위)
- 경기 이벤트 (골, 어시스트, 시간)
- 예측 데이터 (사용자별 정확도)
- 투표 데이터 (우승팀 후보별 득표)

## 🌟 특별 기능

- **완전한 실시간 시스템**: Supabase Realtime으로 모든 데이터 즉시 동기화
- **사진 관리 시스템**: 경기별/팀별 사진 업로드 및 갤러리
- **Man of the Match**: 경기별 최우수 선수 선정 및 통계
- **개인 순위 시스템**: 득점, 어시스트, 공격포인트, MOTM 횟수 추적
- **무소속 팀 시스템**: 선수 데이터 보존 중심 설계 (삭제 대신 이동)
- **종합 경기 편집**: 모든 경기 정보를 한 곳에서 완전 관리
- **대회 관리 시스템**: 관리자 전용 대회 설정 및 편집 기능
- **예측 시스템**: "경기 결과 맞히기"와 "우승팀 투표" 통합 관리
- **다크모드**: 완전한 다크/라이트 테마 지원
- **반응형 디자인**: 모든 디바이스에서 최적화된 UI
- **안정적인 성능**: 애니메이션 없는 빠르고 안정적인 인터페이스
- **접근성**: ARIA 레이블 및 키보드 네비게이션 지원
- **한글 최적화**: UTF-8 BOM 지원으로 완벽한 한글 처리

## 🚀 배포

### Vercel (권장)
1. GitHub 연동
2. 환경 변수 설정
3. 자동 배포

### 다른 플랫폼
- Netlify
- AWS Amplify
- Docker 컨테이너

## 🤝 기여하기

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📊 현재 완성도

**✅ 100% 완성된 프로덕션 준비 상태**

모든 핵심 기능이 완전히 구현되어 실제 풋살 리그 운영에 바로 사용할 수 있습니다.

### 완성된 주요 기능들
- ✅ 팀/선수 관리 시스템 (무소속 팀 시스템 포함)
- ✅ 경기 일정 및 결과 관리  
- ✅ 실시간 경기 진행 (골/어시스트 입력)
- ✅ 자동 순위표 계산 (팀 순위 & 개인 순위)
- ✅ 플레이오프 토너먼트 시스템
- ✅ 경기 예측 시스템 ("경기 결과 맞히기")
- ✅ 우승팀 예측 기능 ("우승팀 맞히기")
- ✅ MVP/베스트6 투표 시스템 (포지션별)
- ✅ 실시간 알림 시스템
- ✅ 데이터 내보내기 (JSON/CSV/Excel)
- ✅ 다크모드 지원
- ✅ 완전 반응형 디자인
- ✅ 관리자 인증 시스템
- ✅ 전역 검색 기능
- ✅ 캘린더 뷰
- ✅ 경기 사진 업로드 시스템
- ✅ 팀 사진 업로드 시스템
- ✅ Man of the Match 선정 시스템
- ✅ 개인 순위 시스템 (공격포인트, MOTM 횟수)
- ✅ 실시간 예측 피드
- ✅ 대회 설정 관리 시스템 (v1.1.2)
- ✅ 종합 경기 편집 시스템 (날짜/시간/팀/점수/상태) (v1.1.2)
- ✅ 무소속 팀 자동 관리 (데이터 보존 중심) (v1.1.2)
- ✅ 유튜브 하이라이트 영상 연동
- ✅ 댓글 시스템 (경기/사진/팀별, 답글, 좋아요/싫어요)

## 🚀 향후 개발 계획

추가 기능 개발 계획은 [TODO2.md](TODO2.md) 파일에서 확인할 수 있습니다.

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 🙏 감사의 말

제 1회 KOPRI CUP 성공적인 개최를 위해 협력해주신 모든 분들께 감사드립니다.