-- matches 테이블에 유튜브 관련 필드 추가
ALTER TABLE matches 
ADD COLUMN youtube_url TEXT,
ADD COLUMN youtube_title VARCHAR(255),
ADD COLUMN youtube_thumbnail_url TEXT,
ADD COLUMN youtube_duration VARCHAR(20);

-- 인덱스 추가
CREATE INDEX idx_matches_youtube_url ON matches(youtube_url);

-- 유튜브 URL 유효성 검사 제약 조건
ALTER TABLE matches 
ADD CONSTRAINT check_youtube_url 
CHECK (
  youtube_url IS NULL OR 
  youtube_url ~ '^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]+(&.*)?$'
);