-- 사용자-대회 관계 테이블 생성
-- 이 테이블은 사용자가 어떤 대회에 참여하거나 관리할 수 있는지를 정의합니다.

CREATE TABLE IF NOT EXISTS user_competition_relations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'moderator')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 동일한 사용자가 같은 대회에 중복으로 참여할 수 없도록 unique 제약
  UNIQUE(user_id, competition_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_competition_relations_user_id ON user_competition_relations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_competition_relations_competition_id ON user_competition_relations(competition_id);
CREATE INDEX IF NOT EXISTS idx_user_competition_relations_role ON user_competition_relations(role);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE user_competition_relations ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 읽을 수 있음
CREATE POLICY "Anyone can view user competition relations" ON user_competition_relations
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 본인의 관계는 볼 수 있음
CREATE POLICY "Users can view their own relations" ON user_competition_relations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 인증된 사용자만 수정 가능 (클라이언트 사이드에서 권한 체크)
CREATE POLICY "Authenticated users can manage user competition relations" ON user_competition_relations
  FOR ALL
  TO authenticated
  USING (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_user_competition_relations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_competition_relations_updated_at
  BEFORE UPDATE ON user_competition_relations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_competition_relations_updated_at();

-- 편의를 위한 뷰 생성: 사용자 정보와 대회 정보를 조인
CREATE OR REPLACE VIEW user_competition_details AS
SELECT 
  ucr.id,
  ucr.user_id,
  ucr.competition_id,
  ucr.role as competition_role,
  ucr.joined_at,
  ucr.created_at,
  ucr.updated_at,
  
  -- 사용자 정보
  up.display_name,
  up.email,
  up.avatar_url,
  up.department,
  
  -- 대회 정보
  c.name as competition_name,
  c.description as competition_description,
  c.start_date,
  c.end_date,
  
  -- 사용자 전체 역할 정보 (추후 확장 가능)
  null as user_system_role

FROM user_competition_relations ucr
LEFT JOIN user_profiles up ON ucr.user_id = up.id
LEFT JOIN competitions c ON ucr.competition_id = c.id;

-- 뷰에 대한 RLS 정책
ALTER VIEW user_competition_details OWNER TO postgres;

COMMENT ON TABLE user_competition_relations IS '사용자와 대회 간의 관계를 정의하는 테이블';
COMMENT ON COLUMN user_competition_relations.role IS '대회 내에서의 역할: participant(참가자), admin(관리자), moderator(중재자)';
COMMENT ON VIEW user_competition_details IS '사용자-대회 관계 정보와 관련 상세 정보를 조인한 뷰';