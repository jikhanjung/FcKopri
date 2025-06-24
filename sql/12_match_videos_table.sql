-- Match videos table for multiple video types per match
-- This table stores multiple videos per match with different types

CREATE TABLE IF NOT EXISTS match_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    video_type VARCHAR(50) NOT NULL CHECK (video_type IN ('highlight', 'goals', 'full_match', 'interview', 'analysis', 'other')),
    title VARCHAR(255) NOT NULL,
    youtube_url TEXT NOT NULL,
    youtube_video_id VARCHAR(20),
    thumbnail_url TEXT,
    duration VARCHAR(20),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE, -- 대표 영상 여부
    uploaded_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- 유튜브 URL 유효성 검사
    CONSTRAINT check_youtube_url 
    CHECK (youtube_url ~ '^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]+(&.*)?$')
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_match_videos_match_id ON match_videos(match_id);
CREATE INDEX IF NOT EXISTS idx_match_videos_type ON match_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_match_videos_featured ON match_videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_match_videos_order ON match_videos(display_order);
CREATE INDEX IF NOT EXISTS idx_match_videos_created_at ON match_videos(created_at);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_match_videos_updated_at BEFORE UPDATE ON match_videos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security 비활성화 (기존 시스템과 일치)
ALTER TABLE match_videos DISABLE ROW LEVEL SECURITY;

-- 테이블 설명
COMMENT ON TABLE match_videos IS '경기별 다중 영상 관리 테이블 - 하이라이트, 골 장면, 전체 경기 등 다양한 영상 타입 지원';
COMMENT ON COLUMN match_videos.match_id IS '경기 ID (외래키)';
COMMENT ON COLUMN match_videos.video_type IS '영상 타입 (highlight: 하이라이트, goals: 골 장면, full_match: 전체 경기, interview: 인터뷰, analysis: 분석, other: 기타)';
COMMENT ON COLUMN match_videos.title IS '영상 제목';
COMMENT ON COLUMN match_videos.youtube_url IS '유튜브 영상 URL';
COMMENT ON COLUMN match_videos.youtube_video_id IS '유튜브 비디오 ID (자동 추출)';
COMMENT ON COLUMN match_videos.thumbnail_url IS '썸네일 이미지 URL';
COMMENT ON COLUMN match_videos.duration IS '영상 길이 (예: 3:45)';
COMMENT ON COLUMN match_videos.description IS '영상 설명';
COMMENT ON COLUMN match_videos.display_order IS '표시 순서 (숫자가 작을수록 먼저 표시)';
COMMENT ON COLUMN match_videos.is_featured IS '대표 영상 여부 (경기 카드에 표시될 메인 영상)';
COMMENT ON COLUMN match_videos.uploaded_by IS '업로드한 사용자';
COMMENT ON COLUMN match_videos.created_at IS '등록 시간';
COMMENT ON COLUMN match_videos.updated_at IS '수정 시간';