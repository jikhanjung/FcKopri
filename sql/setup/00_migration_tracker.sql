-- 마이그레이션 추적 테이블
-- 이 테이블은 어떤 마이그레이션이 언제 적용되었는지 추적합니다.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum TEXT -- 파일 내용 변경 감지용
);

COMMENT ON TABLE schema_migrations IS '스키마 마이그레이션 추적 테이블';
COMMENT ON COLUMN schema_migrations.version IS '마이그레이션 버전 (파일명에서 추출)';
COMMENT ON COLUMN schema_migrations.description IS '마이그레이션 설명';
COMMENT ON COLUMN schema_migrations.applied_at IS '마이그레이션 적용 시각';
COMMENT ON COLUMN schema_migrations.checksum IS '파일 체크섬 (무결성 검증용)';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);