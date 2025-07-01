#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../sql/migrations');

// 다음 마이그레이션 번호 계산 (v1.1.4+부터 01번 시작)
function getNextMigrationNumber() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => {
      const match = file.match(/^(\d+)_/);
      return match ? parseInt(match[1]) : 0;
    })
    .sort((a, b) => b - a);
  
  const lastNumber = files[0] || 0; // v1.1.4+는 01부터 시작
  return String(lastNumber + 1).padStart(2, '0');
}

// 마이그레이션 파일 생성
function createMigration(description) {
  if (!description) {
    console.error('❌ Migration description is required');
    console.log('Usage: npm run migrate:create "add_new_feature"');
    process.exit(1);
  }
  
  const number = getNextMigrationNumber();
  const fileName = `${number}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`;
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  
  const template = `-- ${description}
-- Migration: ${fileName}
-- Created: ${new Date().toISOString()}
-- Base Schema: v1.1.3

-- Add your SQL migration here
-- This migration will be applied AFTER the complete_schema_v1.1.3.sql

-- Example:
-- ALTER TABLE teams ADD COLUMN new_field TEXT;
-- CREATE INDEX IF NOT EXISTS idx_teams_new_field ON teams(new_field);

-- 마이그레이션 설명 업데이트
COMMENT ON TABLE schema_migrations IS 'Migration ${fileName} applied at ${new Date().toISOString()}';
`;
  
  fs.writeFileSync(filePath, template);
  
  console.log(`✅ Created migration: ${fileName}`);
  console.log(`📁 Location: ${filePath}`);
  console.log(`✏️  Edit the file to add your SQL changes`);
}

const description = process.argv[2];
createMigration(description);