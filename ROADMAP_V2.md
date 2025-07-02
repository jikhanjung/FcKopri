# FcKopri v1.2.0 로드맵

## 개요

FcKopri v1.2.0은 사용자 계정 시스템과 세분화된 권한 관리를 도입하여 더욱 강력하고 유연한 리그 관리 플랫폼으로 진화합니다.

## 핵심 확장 기능

### 1. 사용자 계정 시스템

#### 1.1 회원가입 및 로그인 (하이브리드 접근)
- **Supabase 이메일 기반 회원가입**
  - 이메일/비밀번호 직접 가입
  - 이메일 인증 프로세스
  - 비밀번호 강도 검증
  - 중복 가입 방지
  
- **OAuth 소셜 로그인 지원**
  - Google OAuth (구글 계정)
  - GitHub OAuth (개발자 친화적)
  - Kakao OAuth (한국 사용자용)
  - Naver OAuth (한국 사용자용)

- **통합 인증 관리**
  - 동일 이메일로 여러 방식 연동 가능
  - 계정 연결/해제 기능
  - 통합 프로필 관리

- **프로필 관리**
  - 프로필 사진 업로드
  - 닉네임 설정
  - 소속 팀/부서 선택
  - 선호 포지션 설정
  - 연락처 정보 (선택사항)

#### 1.2 계정 보안
- 비밀번호 재설정 (이메일 인증)
- 2단계 인증 (TOTP)
- 로그인 기록 추적
- 세션 관리

### 2. 권한 시스템 (RBAC - Role-Based Access Control)

#### 2.1 기본 역할 구조
```
SuperAdmin (최고 관리자)
├── CompetitionAdmin (대회 관리자)
├── TeamManager (팀 관리자)
├── Player (등록 선수)
└── User (일반 사용자)
```

#### 2.2 역할별 권한

**SuperAdmin (최고 관리자)**
- 모든 기능에 대한 완전한 접근 권한
- 사용자 역할 관리
- 시스템 설정 변경
- 모든 대회 생성/삭제

**CompetitionAdmin (대회 관리자)**
- 특정 대회에 대한 전체 권한
- 대회 정보 수정
- 팀/선수 등록 관리
- 경기 일정 및 결과 관리
- 대회별 관리자 지정

**TeamManager (팀 관리자)**
- 소속 팀 정보 수정
- 팀 로스터 관리
- 팀 사진/영상 업로드
- 경기 라인업 제출

**Player (등록 선수)**
- 본인 프로필 수정
- 팀 가입 요청
- 경기 참가 확인
- 개인 통계 열람

**User (일반 사용자)**
- 경기 예측 참여
- 투표 참여
- 댓글 작성
- 공개 정보 열람

### 3. Competition 관리 확장

#### 3.1 대회별 독립 관리
- **다중 대회 지원**
  - 동시에 여러 대회 운영 가능
  - 대회별 독립적인 설정
  - 대회 간 데이터 격리

- **대회 설정 커스터마이징**
  - 대회 규칙 설정 (승점 체계 등)
  - 참가 자격 요건 설정
  - 대회 기간 및 일정 관리
  - 스폰서 정보 관리

#### 3.2 권한별 대회 정보 수정
- CompetitionAdmin: 모든 정보 수정 가능
- TeamManager: 팀 관련 정보만 수정
- 일반 사용자: 읽기 전용

### 4. AI 음성 인식 경기 기록 시스템

#### 4.1 실시간 음성 기록
- **모바일 음성 입력**
  - Web Speech API 활용 (브라우저 내장)
  - 실시간 음성-텍스트 변환
  - 한국어 최적화
  
- **AI 기반 의도 분석**
  - OpenAI API 또는 Claude API 연동
  - 자연어 처리로 경기 이벤트 추출
  - 선수명, 이벤트 타입, 시간 자동 파싱

- **자동 이벤트 생성**
  - 분석된 내용을 match_events에 자동 입력
  - 관리자 확인/수정 인터페이스
  - 오류 수정 및 학습 기능

#### 4.2 음성 명령 예시
- "7번 김철수 골" → Goal 이벤트 생성
- "박영희가 이민호에게 어시스트" → Assist 이벤트 생성
- "25분에 골 취소" → 이벤트 삭제
- "홈팀 3번 경고" → 경고 이벤트 (향후 확장)

#### 4.3 구현 기술 스택
```typescript
// 음성 인식 (Web Speech API)
const recognition = new webkitSpeechRecognition();
recognition.lang = 'ko-KR';
recognition.continuous = true;

// AI 분석 (예: OpenAI)
const result = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: "축구 경기 음성 중계를 분석하여 이벤트를 추출합니다."
  }, {
    role: "user",
    content: voiceTranscript
  }]
});

// 자동 DB 입력
await supabase.from('match_events').insert({
  match_id: currentMatch.id,
  event_type: parsedEvent.type,
  player_id: parsedEvent.playerId,
  time: parsedEvent.time
});
```

### 5. 독립적인 선수 관리 시스템

#### 5.1 선수 풀(Pool) 관리
- **팀 독립적 선수 등록**
  - 선수 데이터베이스 구축
  - 팀 소속 없이 선수 프로필 유지
  - 이적 히스토리 추적

- **선수 프로필 확장**
  - 기본 정보 (이름, 생년월일, 포지션)
  - 신체 정보 (키, 몸무게)
  - 경력 사항
  - 대표 사진 및 갤러리
  - SNS 연동

#### 5.2 팀-선수 관계 관리
- **유연한 소속 관리**
  - 시즌별 팀 소속 변경
  - 임대 선수 관리
  - 다중 대회 참가 지원

- **선수 이적 시스템**
  - 이적 요청 및 승인 프로세스
  - 이적 기간 설정
  - 이적 히스토리 보관

## 기술적 구현 계획

### 데이터베이스 스키마 확장

#### 새로운 테이블
```sql
-- 사용자 계정 테이블
users (
  id, email, password_hash, 
  created_at, updated_at, 
  email_verified, two_factor_enabled
)

-- 사용자 프로필 테이블
user_profiles (
  user_id, nickname, avatar_url,
  phone, preferred_position,
  team_id, department
)

-- 역할 및 권한 테이블
roles (id, name, description)
user_roles (user_id, role_id, competition_id)
permissions (id, resource, action)
role_permissions (role_id, permission_id)

-- 선수 풀 테이블
player_pool (
  id, user_id, full_name,
  birth_date, height, weight,
  position, career_info
)

-- 팀-선수 관계 테이블
team_player_relations (
  player_id, team_id, competition_id,
  joined_at, left_at, is_loan,
  jersey_number
)
```

### 인증 및 권한 구현

#### Supabase Auth 활용
- **다중 인증 방식 통합**
  - 이메일/비밀번호 인증
  - OAuth 프로바이더 (Google, GitHub, Kakao, Naver)
  - 모든 방식에서 동일한 JWT 토큰 발급
  
- **Row Level Security (RLS) 정책 구현**
  - 인증 여부에 따른 접근 제어
  - 역할별 세분화된 권한 정책
  - 익명 사용자를 위한 읽기 전용 정책
  
- **세션 관리 및 갱신**
  - 자동 토큰 갱신
  - 다중 디바이스 세션 관리
  - 보안 로그아웃

#### 권한 검증 미들웨어
```typescript
// 권한 검증 예시
function requireRole(roles: string[]) {
  return async (req, res, next) => {
    const userRoles = await getUserRoles(req.user.id);
    if (roles.some(role => userRoles.includes(role))) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
}
```

### UI/UX 개선사항

#### 사용자 대시보드
- 역할별 맞춤 대시보드
- 빠른 액세스 메뉴
- 최근 활동 내역

#### 관리자 인터페이스
- 통합 관리 패널
- 벌크 작업 지원
- 실시간 모니터링

## 마이그레이션 전략

### 단계별 마이그레이션
1. **Phase 1**: 사용자 계정 시스템 도입
   - 기존 IP 기반 시스템과 병행 운영
   - 점진적 사용자 전환

2. **Phase 2**: 권한 시스템 적용
   - 기본 역할 부여
   - 권한 정책 점진적 적용

3. **Phase 3**: 독립 선수 관리 전환
   - 기존 선수 데이터 마이그레이션
   - 팀-선수 관계 재정립

### 하위 호환성 유지
- v1.x API 엔드포인트 유지
- 레거시 기능 단계적 폐기
- 충분한 전환 기간 제공

## 예상 일정

### 2025년 3분기
- 사용자 계정 시스템 개발
- 기본 권한 시스템 구현

### 2025년 4분기
- Competition 관리 확장
- 독립 선수 관리 시스템

### 2026년 1분기
- 베타 테스트 및 피드백
- 공식 v1.2.0 릴리스

## 인증 방식별 사용 예시

### 이메일/비밀번호 가입
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      nickname: '사용자닉네임',
      preferred_position: 'midfielder'
    }
  }
})
```

### OAuth 로그인
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // 또는 'github', 'kakao' 등
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

### 통합된 RLS 정책 예시
```sql
-- 모든 인증된 사용자 (이메일/OAuth 무관)
CREATE POLICY "Authenticated users can create predictions"
ON match_predictions
FOR INSERT 
TO authenticated
USING (auth.uid() = user_id);

-- 익명 사용자도 읽기 가능
CREATE POLICY "Anyone can view matches"
ON matches
FOR SELECT
TO anon, authenticated
USING (true);
```

## 기대 효과

1. **확장성**: 다중 대회 및 대규모 사용자 지원
2. **보안성**: 역할 기반 접근 제어로 데이터 보호
3. **유연성**: 다양한 리그 형태 지원
4. **사용성**: 역할별 최적화된 인터페이스
5. **데이터 무결성**: 체계적인 선수 이력 관리
6. **운영 효율성**: AI 음성 인식으로 실시간 경기 기록 자동화
7. **접근성**: 모바일에서 손쉬운 음성 입력으로 관리자 부담 감소

---

*이 로드맵은 개발 진행 상황에 따라 조정될 수 있습니다.*