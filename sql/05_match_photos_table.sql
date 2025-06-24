-- 경기 사진 테이블 생성
CREATE TABLE IF NOT EXISTS match_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  caption TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_match_photos_match_id ON match_photos(match_id);
CREATE INDEX IF NOT EXISTS idx_match_photos_created_at ON match_photos(created_at);

-- Row Level Security 활성화
ALTER TABLE match_photos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 설정
CREATE POLICY "Allow read access for all users" ON match_photos
FOR SELECT USING (true);

-- 관리자만 삽입/수정/삭제 가능
CREATE POLICY "Allow admin insert access" ON match_photos
FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'admin@kopri.re.kr');

CREATE POLICY "Allow admin update access" ON match_photos
FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@kopri.re.kr')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@kopri.re.kr');

CREATE POLICY "Allow admin delete access" ON match_photos
FOR DELETE USING (auth.jwt() ->> 'email' = 'admin@kopri.re.kr');

-- 댓글 추가
COMMENT ON TABLE match_photos IS '경기별 사진 업로드 관리 테이블';
COMMENT ON COLUMN match_photos.match_id IS '경기 ID (외래키)';
COMMENT ON COLUMN match_photos.filename IS '원본 파일명';
COMMENT ON COLUMN match_photos.caption IS '사진 설명/캡션';
COMMENT ON COLUMN match_photos.file_path IS 'Supabase Storage 파일 경로';
COMMENT ON COLUMN match_photos.file_size IS '파일 크기 (바이트)';
COMMENT ON COLUMN match_photos.mime_type IS '파일 MIME 타입';
COMMENT ON COLUMN match_photos.uploaded_by IS '업로드한 사용자';
COMMENT ON COLUMN match_photos.created_at IS '업로드 시간';