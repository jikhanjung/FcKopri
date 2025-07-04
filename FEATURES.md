# FcKopri 기능 명세서

## 📋 완성된 기능 목록

### 🏆 리그 관리 시스템

#### 팀 관리
- ✅ 팀 등록 및 편집
- ✅ 부서별 팀 분류
- ✅ 팀 삭제 (관리자) - 선수들은 무소속 팀으로 이동
- ✅ 팀별 선수 목록 표시
- ✅ 팀별 경기 일정 및 결과 표시
- ✅ 팀 전적 통계 (승/무/패)
- ✅ 무소속 팀 시스템 (숨겨진 특수 팀)

#### 선수 관리  
- ✅ 선수 등록 및 편집
- ✅ 팀별 선수 관리
- ✅ 선수 팀 제외 기능 (무소속으로 이동, 데이터 보존)
- ✅ 선수 검색 기능
- ✅ 무소속 선수 관리 시스템

#### 경기 관리
- ✅ 경기 일정 생성
- ✅ 경기 결과 입력
- ✅ 경기 상태 관리 (예정/진행중/완료/취소)
- ✅ 경기 수정 및 삭제 (관리자)
- ✅ 경기 상세 페이지에서 팀 이름 클릭으로 팀 페이지 이동
- ✅ 종합 경기 편집 시스템 (날짜/시간, 홈팀/원정팀, 점수, 상태)

#### 대회 관리
- ✅ 대회 정보 편집 시스템
- ✅ 대회명, 설명, 연도 수정
- ✅ 대회 시작일/종료일 설정
- ✅ **전반 시간 설정** (기본 45분, 대회별 커스터마이징)
- ✅ 관리자 전용 대회 설정 페이지
- ✅ 대회 기간 자동 계산 및 표시

### ⚽ 실시간 경기 진행

#### 라이브 경기 관리
- ✅ 실시간 경기 시작/중지/종료
- ✅ 시간 카운터 (분:초 형식 표시)
- ✅ 실시간 스코어 표시

#### 경기 이벤트 시스템
- ✅ 골 입력 (득점자, 시간)
- ✅ 어시스트 입력 (어시스트 제공자)
- ✅ **자책골 시스템** (상대팀 득점 처리, 개인 통계 제외)
- ✅ **전반/후반 관리** (경기 진행 시 전후반 선택)
- ✅ **자동 시간 설정** (경기 진행 중 현재 분+1으로 자동 설정)
- ✅ 이벤트 삭제 기능
- ✅ 시간순 이벤트 정렬
- ✅ **경기 이벤트 표시 개선** (골만 표시, 어시스트는 골 이벤트에 포함)
- ✅ **이벤트 아이콘 시스템** (축구공⚽, 골대🥅)

#### 경기 이벤트 표시 시스템
- ✅ 스코어 카드 내 축약 이벤트 표시 (골, 경고, 퇴장)
- ✅ 상세 경기 이벤트 타임라인 (골, 어시스트)
- ✅ 시간별 이벤트 그룹화 및 정렬
- ✅ 팀별 이벤트 구분 (홈팀/원정팀)
- ✅ 이벤트 아이콘 시스템 (⚽ 골, 👟 어시스트, 🟨 경고, 🟥 퇴장)
- ✅ 선수명 클릭으로 개인 프로필 연결
- ✅ 실시간 이벤트 업데이트 (Supabase Realtime)

#### 선수별 기록
- ✅ 득점 기록
- ✅ 어시스트 기록
- ✅ 경기별 이벤트 추적

### 📊 순위 및 통계

#### 순위표 시스템
- ✅ 실시간 순위 계산
- ✅ 승점 기반 정렬 (승리 3점, 무승부 2점, 패배 1점)
- ✅ 득실차, 다득점 순 정렬
- ✅ 반응형 순위표 (모바일/데스크톱)

#### 개인 순위 시스템
- ✅ 득점/어시스트 기반 공격포인트 계산
- ✅ 동점자 공동 순위 처리 시스템
- ✅ 다양한 정렬 기준 (득점순, 어시스트순, 공격포인트순, MOTM 횟수)
- ✅ 선수별 상세 통계 및 경기당 평균

#### 통계 기능
- ✅ 팀별 상세 통계
- ✅ 경기 통계 요약
- ✅ 차트 및 그래프 시각화
- ✅ 순위 변동 추적

### 🎯 투표 시스템

#### 경기 결과 맞히기
- ✅ 경기별 스코어 예측
- ✅ 확신도 5단계 별점 시스템
- ✅ 예측 근거 작성 (선택사항)
- ✅ 정확도 기반 리더보드
- ✅ 실시간 예측 통계 (승리 예측 비율)

#### 우승팀 맞히기
- ✅ 팀별 우승 후보 예측
- ✅ 실시간 득표율 표시
- ✅ 예측 이유 작성 (선택사항)
- ✅ 평균 확신도 계산
- ✅ 순위별 시각적 표시

#### MVP 투표 시스템
- ✅ 팬 투표 기반 MVP 선정
- ✅ IP 기반 중복 투표 방지
- ✅ 투표 이유 작성 기능
- ✅ 실시간 투표 결과 집계
- ✅ 득점순/투표순 결과 표시

#### 베스트6 투표 시스템 (풋살 특화)
- ✅ 포지션별 베스트 선수 선정
- ✅ 공격수 1명, 미드필더 2명, 수비수 2명, 골키퍼 1명
- ✅ IP 기반 중복 투표 방지
- ✅ 투표 이유 작성 기능
- ✅ 실시간 투표 결과 집계
- ✅ 포지션별 득표 순위 표시

#### 예측 정확도 평가
- ✅ 완벽한 스코어 맞춤 (100점)
- ✅ 승부 결과만 맞춤 (50점)
- ✅ 사용자별 정확도 통계
- ✅ 예측 리더보드

### 🏆 시상식 및 기록 시스템

#### 개인 순위 시스템
- ✅ 득점순 순위 (기본 정렬)
- ✅ 어시스트순 순위
- ✅ 공격포인트(득점+어시스트) 순위
- ✅ Man of the Match 횟수 표시
- ✅ 경기당 평균 포인트 계산
- ✅ 부서별 선수 분류 및 필터링
- ✅ 새로고침 버튼 (데이터 재로드)
- ✅ Supabase 쿼리 최적화 (조인 쿼리 분리)
- ✅ 선수명 클릭으로 개인 프로필 페이지 이동

#### 선수 개인 프로필 시스템
- ✅ 선수별 전용 프로필 페이지 (`/players/[id]`)
- ✅ 개인 통계 카드 (득점, 어시스트, 공격포인트, MOTM)
- ✅ 시즌 요약 통계 (출전 경기, 경기당 평균, 골/어시 비율)
- ✅ 경기별 상세 기록 (날짜, 상대팀, 개인 성과, MOTM 여부)
- ✅ 반응형 디자인 및 다크모드 지원
- ✅ 개인 순위 페이지로 돌아가기 링크

#### 선수 프로필 연결점
- ✅ 개인 순위표에서 선수명 클릭
- ✅ 팀 상세 페이지에서 선수명 클릭 (모바일/데스크톱)
- ✅ 전역 검색 결과에서 선수 검색 시 프로필 링크
- ✅ 경기 이벤트에서 득점자/어시스트 선수명 클릭
- ✅ Man of the Match 표시에서 MOTM 선수명 클릭
- ✅ 스코어 카드 내 축약 이벤트에서 선수명 클릭

#### Man of the Match 시스템
- ✅ 경기별 최우수 선수 선정
- ✅ 관리자 전용 선정/변경/제거 기능
- ✅ 모달 인터페이스로 선수 선택
- ✅ 개인 순위에 MOTM 횟수 연동
- ✅ 경기 상세 페이지에서 MOTM 표시

### 🎪 플레이오프 시스템

#### 토너먼트 관리
- ✅ 리그 완료 후 플레이오프 생성
- ✅ 상위 4팀 자동 선정
- ✅ 토너먼트 브래킷 표시
- ✅ 플레이오프 경기 관리

#### 브래킷 시각화
- ✅ 준결승, 3/4위전, 결승전 구조
- ✅ 팀 위치 자동 배치
- ✅ 경기 결과 연동

### 🔔 실시간 알림 시스템

#### Supabase Realtime 연동
- ✅ 경기 결과 업데이트 알림
- ✅ 새 경기 일정 알림
- ✅ 플레이오프 업데이트 알림
- ✅ 예측/투표 실시간 업데이트
- ✅ 댓글 실시간 알림
- ✅ MVP/베스트6 투표 알림

#### 알림 UI
- ✅ 네비게이션 알림 벨
- ✅ 읽지 않은 알림 개수 표시
- ✅ 알림 드롭다운 패널
- ✅ 토스트 메시지 (화면 우상단)

#### 실시간 피드
- ✅ 새 예측 실시간 표시 (경기 상세 페이지)
- ✅ 새 댓글 실시간 업데이트
- ✅ 투표 결과 실시간 반영
- ✅ 자동 사라짐 (5초 후)

### 🎨 사용자 인터페이스

#### 테마 시스템
- ✅ 라이트/다크 모드
- ✅ 시스템 테마 감지
- ✅ 테마 설정 저장
- ✅ 모든 컴포넌트 다크모드 지원

#### 반응형 디자인
- ✅ 모바일 최적화
- ✅ 태블릿 지원
- ✅ 데스크톱 레이아웃
- ✅ 터치 친화적 UI

#### 네비게이션
- ✅ 메인 네비게이션 바
- ✅ 드롭다운 서브메뉴 (투표, 순위)
- ✅ 현재 페이지 하이라이트
- ✅ 모바일 햄버거 메뉴
- ✅ 투표 메뉴: 경기 결과 맞히기, 우승팀 맞히기, MVP 투표, 베스트6 투표
- ✅ 순위 메뉴: 팀 순위, 개인 순위, 시상식
- ✅ 통계 메뉴 숨김 처리
- ✅ 관리자 전용 메뉴: 대회 설정, 데이터 내보내기

### 🔍 검색 시스템

#### 전역 검색
- ✅ 통합 검색 기능
- ✅ 팀, 선수, 경기 검색
- ✅ 실시간 검색 결과
- ✅ 키보드 단축키 지원

#### 검색 결과
- ✅ 카테고리별 결과 분류
- ✅ 하이라이트된 검색어
- ✅ 직접 링크 이동

### 📅 캘린더 기능

#### 월별 캘린더
- ✅ 경기 일정 시각화
- ✅ 월 단위 네비게이션
- ✅ 날짜별 경기 표시
- ✅ 경기 상태별 색상 구분

#### 경기 정보 표시
- ✅ 팀명 및 시간 표시
- ✅ 경기 상태 시각화
- ✅ 경기 상세 페이지 링크

### 🔐 권한 및 보안

#### 관리자 시스템
- ✅ 관리자 로그인
- ✅ 세션 관리
- ✅ 관리자 전용 컴포넌트
- ✅ 권한 기반 UI 표시
- ✅ 대회 설정 관리 권한
- ✅ 무소속 팀 자동 관리

#### 데이터 보안
- ✅ Row Level Security (RLS)
- ✅ 읽기 권한: 모든 사용자
- ✅ 쓰기 권한: 관리자만
- ✅ 안전한 API 호출
- ✅ 숨겨진 팀 필터링 (is_hidden)

### 📤 데이터 관리

#### 내보내기 기능
- ✅ JSON 형식 (백업/개발용)
- ✅ CSV 형식 (Excel/스프레드시트용)
- ✅ Excel 형식 (Microsoft Office용)
- ✅ UTF-8 BOM으로 한글 깨짐 방지
- ✅ 선택적 데이터 내보내기

#### 내보내기 데이터
- ✅ 팀 정보
- ✅ 선수 정보
- ✅ 경기 데이터
- ✅ 순위표 (팀 순위 & 개인 순위)
- ✅ 경기 이벤트 (골, 어시스트, 시간)
- ✅ 예측 데이터 (사용자별 정확도)
- ✅ 투표 데이터 (MVP, 베스트6, 우승팀)

### 📸 미디어 관리 시스템

#### 경기 사진 시스템
- ✅ 경기별 사진 업로드 (모든 사용자)
- ✅ 사진 캡션 및 타입 분류
- ✅ Supabase Storage 연동
- ✅ 이미지 최적화 및 썸네일
- ✅ 갤러리 뷰 및 슬라이드쇼
- ✅ 관리자 사진 관리 (삭제)

#### 팀 사진 시스템
- ✅ 팀별 사진 업로드 (모든 사용자)
- ✅ 사진 타입별 분류 (로고, 단체사진, 훈련사진, 일반사진)
- ✅ Next.js Image 컴포넌트 최적화
- ✅ 반응형 갤러리 레이아웃
- ✅ 사진 캡션 및 설명 기능

#### 경기별 다중 영상 시스템
- ✅ 경기당 여러 영상 업로드 및 관리
- ✅ 영상 타입별 분류 시스템
  - 🎬 하이라이트 영상
  - ⚽ 골 장면 모음
  - 📹 전체 경기 영상
  - 🎤 선수/감독 인터뷰
  - 📊 경기 분석 영상
  - 📽️ 기타 영상
- ✅ 대표 영상 설정 (⭐)
- ✅ 영상 순서 조정 (↑↓)
- ✅ 유튜브 URL 자동 검증 및 썸네일 생성
- ✅ 임베드 영상 플레이어
- ✅ 영상별 제목, 설명, 시간 정보
- ✅ 관리자 영상 관리 (추가/수정/삭제/순서변경)

### 💬 댓글 시스템

#### 통합 댓글 기능
- ✅ 경기별 댓글 및 답글
- ✅ 사진별 댓글 시스템
- ✅ 팀별 댓글 기능
- ✅ 중첩 답글 지원 (최대 2단계)
- ✅ IP 기반 작성자 식별

#### 댓글 상호작용
- ✅ 좋아요/싫어요 기능
- ✅ 실시간 댓글 업데이트
- ✅ 관리자 댓글 관리 (삭제 권한)
- ✅ 댓글 작성 시간 표시
- ✅ 작성자명 표시 시스템

### 🎪 대시보드

#### 홈페이지 위젯
- ✅ 대회 정보 표시
- ✅ 통계 카드 (팀 수, 경기 수)
- ✅ 우승 후보 위젯
- ✅ 빠른 액션 버튼

#### 실시간 업데이트
- ✅ 위젯 자동 새로고침
- ✅ 실시간 통계 반영

## 🚀 기술적 구현 사항

### 프론트엔드
- ✅ Next.js 14 App Router
- ✅ TypeScript 완전 적용
- ✅ Tailwind CSS 스타일링
- ✅ Heroicons 아이콘
- ✅ date-fns 날짜 처리

### 백엔드
- ✅ Supabase PostgreSQL
- ✅ Supabase Realtime
- ✅ Supabase Auth
- ✅ Row Level Security

### 상태 관리
- ✅ React Context API
- ✅ 로컬 컴포넌트 상태
- ✅ 실시간 구독 관리

### 성능 최적화
- ✅ 컴포넌트 레벨 로딩
- ✅ 이미지 최적화
- ✅ 코드 스플리팅
- ✅ 메모리 누수 방지

## 📱 모바일 지원

### 반응형 기능
- ✅ 모바일 최적화 레이아웃
- ✅ 터치 제스처 지원
- ✅ 모바일 네비게이션
- ✅ 카드 기반 UI

### 모바일 전용 기능
- ✅ 햄버거 메뉴
- ✅ 스와이프 친화적 카드
- ✅ 큰 터치 타겟
- ✅ 모바일 검색 인터페이스

## 🎯 사용자 경험

### 접근성
- ✅ 키보드 네비게이션
- ✅ ARIA 레이블
- ✅ 시맨틱 HTML
- ✅ 컬러 대비 준수

### 사용성
- ✅ 직관적인 네비게이션
- ✅ 명확한 상태 표시
- ✅ 즉각적인 피드백
- ✅ 에러 처리 및 알림

## 📈 확장 가능한 구조

### 코드 구조
- ✅ 컴포넌트 재사용성
- ✅ 유틸리티 함수 분리
- ✅ 타입 안정성
- ✅ 확장 가능한 스키마

### 데이터베이스 설계
- ✅ 정규화된 스키마
- ✅ 인덱스 최적화
- ✅ 관계 무결성
- ✅ 확장 가능한 구조
- ✅ 숨겨진 팀 시스템 (is_hidden 컬럼)
- ✅ 무소속 팀 자동 생성 및 관리
- ✅ 데이터 보존 중심 설계 (삭제 대신 이동)

## 🔄 실시간 기능 상세

### 구독 관리
- ✅ Supabase Realtime 채널
- ✅ 자동 구독/해제
- ✅ 메모리 누수 방지
- ✅ 연결 상태 관리

### 실시간 데이터
- ✅ 경기 이벤트 즉시 반영
- ✅ 순위표 자동 업데이트
- ✅ 예측 통계 실시간 변경
- ✅ 투표 결과 즉시 표시

## 📋 완성도

- **전체 기능**: 100% 완성
- **모바일 최적화**: 100% 완성
- **실시간 기능**: 100% 완성
- **관리자 기능**: 100% 완성
- **사용자 기능**: 100% 완성
- **데이터 관리**: 100% 완성
- **UI/UX**: 100% 완성

## 🏁 프로젝트 상태

**✅ 완전 완성된 프로덕션 준비 상태**

모든 핵심 기능이 구현되어 있으며, 실제 풋살 리그 운영에 바로 사용할 수 있는 수준입니다. 특히 6v6 풋살 대회에 최적화된 MVP/베스트6 투표 시스템과 종합적인 미디어 관리 기능을 포함합니다.