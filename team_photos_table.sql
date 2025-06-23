-- 팀 사진 테이블 생성
CREATE TABLE IF NOT EXISTS team_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  caption TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  photo_type TEXT DEFAULT 'general' CHECK (photo_type IN ('logo', 'team', 'training', 'general')),
  uploaded_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_team_photos_team_id ON team_photos(team_id);
CREATE INDEX IF NOT EXISTS idx_team_photos_photo_type ON team_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_team_photos_created_at ON team_photos(created_at);

-- Row Level Security 비활성화 (간단한 인증 시스템과 일치)
ALTER TABLE team_photos DISABLE ROW LEVEL SECURITY;

-- 댓글 추가
COMMENT ON TABLE team_photos IS '팀별 사진 업로드 관리 테이블';
COMMENT ON COLUMN team_photos.team_id IS '팀 ID (외래키)';
COMMENT ON COLUMN team_photos.filename IS '원본 파일명';
COMMENT ON COLUMN team_photos.caption IS '사진 설명/캡션';
COMMENT ON COLUMN team_photos.file_path IS 'Supabase Storage 파일 경로';
COMMENT ON COLUMN team_photos.file_size IS '파일 크기 (바이트)';
COMMENT ON COLUMN team_photos.mime_type IS '파일 MIME 타입';
COMMENT ON COLUMN team_photos.photo_type IS '사진 유형 (logo: 팀 로고, team: 팀 단체사진, training: 훈련사진, general: 일반사진)';
COMMENT ON COLUMN team_photos.uploaded_by IS '업로드한 사용자';
COMMENT ON COLUMN team_photos.created_at IS '업로드 시간';