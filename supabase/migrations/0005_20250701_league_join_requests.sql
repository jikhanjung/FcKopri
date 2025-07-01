-- 리그 참여 신청 테이블 생성
-- 사용자가 리그 참여를 신청하고 관리자가 승인/거부할 수 있는 시스템

CREATE TABLE IF NOT EXISTS league_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL DEFAULT 'participant' CHECK (requested_role IN ('participant', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT, -- 신청자가 작성한 메시지
  admin_response TEXT, -- 관리자 응답 메시지
  processed_by UUID REFERENCES auth.users(id), -- 처리한 관리자
  processed_at TIMESTAMP WITH TIME ZONE, -- 처리 시간
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 동일한 사용자가 같은 대회에 중복 신청할 수 없도록 제약
  UNIQUE(user_id, competition_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_league_join_requests_user_id ON league_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_league_join_requests_competition_id ON league_join_requests(competition_id);
CREATE INDEX IF NOT EXISTS idx_league_join_requests_status ON league_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_league_join_requests_created_at ON league_join_requests(created_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE league_join_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 신청을 볼 수 있음
CREATE POLICY "Users can view their own requests" ON league_join_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 신청을 생성할 수 있음
CREATE POLICY "Users can create their own requests" ON league_join_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 pending 상태 신청을 수정할 수 있음 (메시지 수정)
CREATE POLICY "Users can update their pending requests" ON league_join_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 관리자는 모든 신청을 보고 처리할 수 있음 (클라이언트에서 권한 체크)
CREATE POLICY "Admins can manage all requests" ON league_join_requests
  FOR ALL
  TO authenticated
  USING (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_league_join_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_league_join_requests_updated_at
  BEFORE UPDATE ON league_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_league_join_requests_updated_at();

-- 편의를 위한 뷰 생성: 신청 정보와 사용자/대회 정보를 조인
CREATE OR REPLACE VIEW league_join_request_details AS
SELECT 
  ljr.id,
  ljr.user_id,
  ljr.competition_id,
  ljr.requested_role,
  ljr.status,
  ljr.message,
  ljr.admin_response,
  ljr.processed_by,
  ljr.processed_at,
  ljr.created_at,
  ljr.updated_at,
  
  -- 신청자 정보
  up.display_name as user_display_name,
  up.email as user_email,
  up.avatar_url as user_avatar_url,
  up.department as user_department,
  
  -- 대회 정보
  c.name as competition_name,
  c.description as competition_description,
  c.start_date as competition_start_date,
  c.end_date as competition_end_date,
  
  -- 처리한 관리자 정보
  admin_up.display_name as admin_display_name,
  admin_up.email as admin_email

FROM league_join_requests ljr
LEFT JOIN user_profiles up ON ljr.user_id = up.id
LEFT JOIN competitions c ON ljr.competition_id = c.id
LEFT JOIN user_profiles admin_up ON ljr.processed_by = admin_up.id;

-- 뷰 소유자 설정
ALTER VIEW league_join_request_details OWNER TO postgres;

-- 신청 승인 함수
CREATE OR REPLACE FUNCTION approve_league_join_request(
  request_id UUID,
  admin_user_id UUID,
  response_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- 신청 정보 조회
  SELECT * INTO request_record
  FROM league_join_requests
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  -- 신청 승인 처리
  UPDATE league_join_requests
  SET 
    status = 'approved',
    admin_response = response_message,
    processed_by = admin_user_id,
    processed_at = NOW()
  WHERE id = request_id;
  
  -- user_competition_relations 테이블에 관계 추가
  INSERT INTO user_competition_relations (user_id, competition_id, role)
  VALUES (request_record.user_id, request_record.competition_id, request_record.requested_role)
  ON CONFLICT (user_id, competition_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- 신청 거부 함수
CREATE OR REPLACE FUNCTION reject_league_join_request(
  request_id UUID,
  admin_user_id UUID,
  response_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- 신청 거부 처리
  UPDATE league_join_requests
  SET 
    status = 'rejected',
    admin_response = response_message,
    processed_by = admin_user_id,
    processed_at = NOW()
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON TABLE league_join_requests IS '리그 참여 신청 테이블';
COMMENT ON COLUMN league_join_requests.requested_role IS '신청하는 역할: participant(참가자), admin(관리자), moderator(중재자)';
COMMENT ON COLUMN league_join_requests.status IS '신청 상태: pending(대기중), approved(승인됨), rejected(거부됨)';
COMMENT ON VIEW league_join_request_details IS '리그 참여 신청 상세 정보 뷰';
COMMENT ON FUNCTION approve_league_join_request IS '리그 참여 신청 승인 함수';
COMMENT ON FUNCTION reject_league_join_request IS '리그 참여 신청 거부 함수';