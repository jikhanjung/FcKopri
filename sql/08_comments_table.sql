-- 댓글 시스템 테이블
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 댓글 대상 정보 (하나만 설정되어야 함)
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  match_photo_id UUID REFERENCES match_photos(id) ON DELETE CASCADE,
  team_photo_id UUID REFERENCES team_photos(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- 댓글 작성자 정보
  author_name VARCHAR(50) NOT NULL,
  author_ip VARCHAR(45) NOT NULL, -- IP 기반 식별
  
  -- 댓글 내용
  content TEXT NOT NULL,
  
  -- 관리자 여부
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- 부모 댓글 (대댓글용)
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- 하나의 대상에만 댓글이 달릴 수 있도록 제약
  CHECK (
    (match_id IS NOT NULL AND match_photo_id IS NULL AND team_photo_id IS NULL AND team_id IS NULL) OR
    (match_id IS NULL AND match_photo_id IS NOT NULL AND team_photo_id IS NULL AND team_id IS NULL) OR
    (match_id IS NULL AND match_photo_id IS NULL AND team_photo_id IS NOT NULL AND team_id IS NULL) OR
    (match_id IS NULL AND match_photo_id IS NULL AND team_photo_id IS NULL AND team_id IS NOT NULL)
  )
);

-- 댓글 좋아요/싫어요 테이블
CREATE TABLE comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,
  reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- IP당 댓글별 한 번만 반응 가능
  UNIQUE(comment_id, user_ip)
);

-- 인덱스 생성
CREATE INDEX idx_comments_match_id ON comments(match_id);
CREATE INDEX idx_comments_match_photo_id ON comments(match_photo_id);
CREATE INDEX idx_comments_team_photo_id ON comments(team_photo_id);
CREATE INDEX idx_comments_team_id ON comments(team_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comment_reactions_comment_id ON comment_reactions(comment_id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();