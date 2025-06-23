# FcKopri - KOPRI CUP 축구 리그 관리 시스템

제 1회 KOPRI CUP을 위한 완전한 축구 리그 관리 웹 애플리케이션입니다.

## 🚀 주요 기능

### 📊 리그 관리
- **팀 및 선수 관리**: 부서별 팀 구성, 선수 등록 및 관리
- **경기 일정 관리**: 리그전 및 플레이오프 경기 스케줄링
- **순위표**: 실시간 자동 계산 (팀 순위 & 개인 순위)
  - 팀 순위: 승점, 득실차, 다득점 순
  - 개인 순위: 득점, 어시스트, 공격포인트, MOTM 횟수
- **플레이오프 시스템**: 리그 완료 후 자동 토너먼트 브래킷 생성

### ⚽ 실시간 경기 진행
- **라이브 스코어**: 실시간 골 및 어시스트 입력
- **경기 이벤트**: 시간별 득점 기록 및 선수별 통계
- **Man of the Match**: 경기별 최우수 선수 선정 시스템
- **실시간 알림**: Supabase Realtime을 통한 즉시 업데이트

### 🎯 예측 시스템
- **경기 결과 맞히기**: 사용자별 경기 예측 및 정확도 리더보드
- **우승팀 투표**: 토너먼트 우승 후보 투표 시스템
- **실시간 피드**: 새로운 예측/투표 실시간 알림
- **예측 통계**: 예측 참여율 및 정확도 분석

### 📈 통계 및 분석
- **상세 통계**: 팀별/선수별 성과 분석
- **시각화**: 차트와 그래프를 통한 데이터 표현
- **데이터 내보내기**: JSON, CSV, Excel 형식 지원 (UTF-8 BOM 한글 지원)
- **사진 관리**: 경기/팀별 사진 업로드 및 갤러리

### 🎨 사용자 경험
- **다크 모드**: 테마 전환 기능
- **반응형 디자인**: 모바일/데스크톱 최적화
- **실시간 검색**: 팀, 선수, 경기 통합 검색
- **캘린더 뷰**: 월별 경기 일정 시각화
- **애니메이션 없는 디자인**: 안정적인 성능과 접근성

### 🔐 관리 시스템
- **관리자 인증**: 암호 기반 인증 시스템
- **권한 기반 접근**: 읽기/쓰기 권한 분리 (클라이언트 사이드)
- **백업 기능**: 전체 데이터 내보내기
- **사진 업로드**: Supabase Storage 연동

## 🛠 기술 스택

**현재 사용 중인 안정적인 기술 스택:**

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Database**: Supabase (PostgreSQL + Realtime + Storage)
- **Styling**: Tailwind CSS (커스텀 kopri-blue 컬러)
- **Authentication**: 클라이언트 사이드 암호 인증
- **Icons**: Heroicons
- **Date Handling**: date-fns (한국어 로케일)
- **Charts**: 내장 차트 컴포넌트
- **Image Handling**: Next.js Image 컴포넌트 최적화

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

4. **데이터베이스 설정**
Supabase SQL Editor에서 다음 파일들을 순서대로 실행:
- `match_events_table.sql`
- `match_predictions_table.sql`  
- `champion_votes_table.sql`
- `add_man_of_the_match.sql`
- `match_photos_table.sql`
- `team_photos_table.sql`

그리고 Supabase Storage에서 다음 버킷들을 생성:
- `match-photos` (경기 사진)
- `team-photos` (팀 사진)

5. **개발 서버 실행**
```bash
npm run dev
```

6. **프로덕션 빌드**
```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
FcKopri/
├── app/                     # Next.js 14 App Router
│   ├── admin/              # 관리자 페이지
│   ├── calendar/           # 캘린더 뷰
│   ├── champion/           # 우승팀 투표
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
│   ├── GlobalSearch.tsx    # 전역 검색
│   ├── LivePredictionFeed.tsx # 실시간 예측 피드
│   ├── ManOfTheMatchSelector.tsx # MOTM 선정
│   ├── MatchLive.tsx       # 실시간 경기 진행
│   ├── MatchPhotos.tsx     # 경기 사진 관리
│   ├── MatchPrediction.tsx # 경기 예측
│   ├── Navigation.tsx      # 네비게이션
│   ├── TeamPhotos.tsx      # 팀 사진 관리
│   └── ...
├── contexts/               # React Context 
│   ├── AuthContext.tsx     # 인증 상태
│   ├── NotificationContext.tsx # 실시간 알림
│   └── ThemeContext.tsx    # 다크모드
├── lib/                    # 유틸리티 함수
│   ├── export-utils.ts     # 데이터 내보내기
│   ├── playoff-utils.ts    # 플레이오프 로직
│   └── supabase.ts         # 데이터베이스 연결
├── types/                  # TypeScript 타입 정의
├── *.sql                   # 데이터베이스 스키마
├── TODO2.md                # 향후 개발 로드맵
└── FEATURES.md             # 기능 상세 명세
```

## 🗄 데이터베이스 스키마

### 핵심 테이블
- **teams**: 팀 정보 (이름, 부서)
- **players**: 선수 정보 (이름, 소속팀)
- **matches**: 경기 정보 (일정, 결과, 상태, MOTM)
- **playoff_matches**: 플레이오프 경기

### 실시간 기능
- **match_events**: 경기 이벤트 (골, 어시스트, 시간)
- **match_predictions**: 경기 예측 데이터
- **champion_votes**: 우승팀 투표 데이터

### 미디어 및 추가 기능
- **match_photos**: 경기 사진 (업로드, 캡션, 타입)
- **team_photos**: 팀 사진 (로고, 단체사진, 훈련사진, 일반사진)

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
7. 플레이오프 브래킷 생성
8. 데이터 내보내기 (JSON, CSV, Excel)

### 사용자 기능
1. 실시간 순위표 확인 (팀 순위 & 개인 순위)
2. 경기 결과 예측 참여 ("경기 결과 맞히기")
3. 우승팀 투표 참여
4. 통계 및 차트 확인
5. 캘린더 뷰로 경기 일정 확인
6. 경기/팀 사진 갤러리 보기
7. 전역 검색 기능 사용

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

모든 핵심 기능이 완전히 구현되어 실제 축구 리그 운영에 바로 사용할 수 있습니다.

### 완성된 주요 기능들
- ✅ 팀/선수 관리 시스템
- ✅ 경기 일정 및 결과 관리  
- ✅ 실시간 경기 진행 (골/어시스트 입력)
- ✅ 자동 순위표 계산 (팀 순위 & 개인 순위)
- ✅ 플레이오프 토너먼트 시스템
- ✅ 경기 예측 시스템 ("경기 결과 맞히기")
- ✅ 우승팀 투표 기능
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

## 🚀 향후 개발 계획

추가 기능 개발 계획은 [TODO2.md](TODO2.md) 파일에서 확인할 수 있습니다.

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 🙏 감사의 말

제 1회 KOPRI CUP 성공적인 개최를 위해 협력해주신 모든 분들께 감사드립니다.