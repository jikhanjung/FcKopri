-- MVP 투표 테이블
CREATE TABLE mvp_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_ip VARCHAR(45) NOT NULL, -- IP 기반 중복 투표 방지
  voted_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  reason TEXT, -- 투표 이유 (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- IP당 한 번만 투표 가능
  UNIQUE(voter_ip)
);

-- 베스트6 투표 테이블
CREATE TABLE best6_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_ip VARCHAR(45) NOT NULL, -- IP 기반 중복 투표 방지
  voted_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position_type VARCHAR(20) NOT NULL CHECK (position_type IN ('forward', 'midfielder', 'defender', 'goalkeeper')), -- 포지션 타입
  position_slot INTEGER NOT NULL, -- 같은 포지션 내에서의 슬롯 (미드필더1, 미드필더2, 수비수1, 수비수2)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- IP당 각 포지션 슬롯별로 한 번만 투표 가능
  UNIQUE(voter_ip, position_type, position_slot),
  
  -- 포지션별 슬롯 제한
  CHECK (
    (position_type = 'forward' AND position_slot = 1) OR
    (position_type = 'midfielder' AND position_slot IN (1, 2)) OR
    (position_type = 'defender' AND position_slot IN (1, 2)) OR
    (position_type = 'goalkeeper' AND position_slot = 1)
  )
);

-- 인덱스 생성
CREATE INDEX idx_mvp_votes_player_id ON mvp_votes(voted_player_id);
CREATE INDEX idx_mvp_votes_created_at ON mvp_votes(created_at);
CREATE INDEX idx_best6_votes_player_id ON best6_votes(voted_player_id);
CREATE INDEX idx_best6_votes_position_type ON best6_votes(position_type);
CREATE INDEX idx_best6_votes_position_slot ON best6_votes(position_slot);
CREATE INDEX idx_best6_votes_created_at ON best6_votes(created_at);