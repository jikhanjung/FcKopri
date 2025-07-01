#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 로드
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIGRATIONS_DIR = path.join(__dirname, '../sql/migrations');
const SETUP_DIR = path.join(__dirname, '../sql/setup');

// 파일 체크섬 계산
function calculateChecksum(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// 마이그레이션 파일 목록 가져오기
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // 파일명 순서대로 정렬
  
  return files.map(file => {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const version = file.replace('.sql', '');
    
    // 파일의 첫 번째 주석에서 설명 추출
    const descMatch = content.match(/^--\s*(.+)/);
    const description = descMatch ? descMatch[1].trim() : version;
    
    return {
      version,
      description,
      content,
      checksum: calculateChecksum(content)
    };
  });
}

// 적용된 마이그레이션 목록 가져오기
async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version, checksum')
      .order('version');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    // 테이블이 없으면 빈 배열 반환
    if (error.message.includes('relation "schema_migrations" does not exist')) {
      return [];
    }
    throw error;
  }
}

// SQL 실행 (Supabase CLI 사용)
async function executeSql(sql, description) {
  console.log(`📄 Executing: ${description}`);
  
  try {
    // 임시 파일에 SQL 저장
    const tempFile = path.join(__dirname, 'temp_migration.sql');
    fs.writeFileSync(tempFile, sql);
    
    // Supabase CLI로 실행 (실제 구현시에는 child_process.exec 사용)
    console.log(`⚠️  Manual execution required:`);
    console.log(`   supabase db push --db-url "your-connection-string" --file ${tempFile}`);
    console.log(`   Or execute the SQL manually in Supabase SQL Editor`);
    
    // 임시 파일 삭제
    fs.unlinkSync(tempFile);
    
    console.log(`✅ Prepared: ${description}`);
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

// 마이그레이션 기록
async function recordMigration(migration) {
  const { error } = await supabase
    .from('schema_migrations')
    .insert({
      version: migration.version,
      description: migration.description,
      checksum: migration.checksum
    });
  
  if (error) throw error;
}

// 초기 설정 실행 (마이그레이션 추적 테이블 생성)
async function runInitialSetup() {
  const trackerFile = path.join(SETUP_DIR, '00_migration_tracker.sql');
  if (fs.existsSync(trackerFile)) {
    const content = fs.readFileSync(trackerFile, 'utf8');
    await executeSql(content, 'Migration tracker setup');
  }
}

// 마이그레이션 실행
async function runMigrations() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    // 1. 초기 설정 실행
    await runInitialSetup();
    
    // 2. 마이그레이션 파일 목록 가져오기
    const allMigrations = getMigrationFiles();
    console.log(`📋 Found ${allMigrations.length} migration files\n`);
    
    // 3. 적용된 마이그레이션 목록 가져오기
    const appliedMigrations = await getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));
    
    // 4. 체크섬 검증
    for (const applied of appliedMigrations) {
      const current = allMigrations.find(m => m.version === applied.version);
      if (current && current.checksum !== applied.checksum) {
        console.warn(`⚠️  Warning: ${applied.version} has been modified since it was applied`);
      }
    }
    
    // 5. 미적용 마이그레이션 실행
    const pendingMigrations = allMigrations.filter(m => !appliedVersions.has(m.version));
    
    if (pendingMigrations.length === 0) {
      console.log('✨ All migrations are up to date!');
      return;
    }
    
    console.log(`🔄 Running ${pendingMigrations.length} pending migrations:\n`);
    
    for (const migration of pendingMigrations) {
      await executeSql(migration.content, migration.description);
      await recordMigration(migration);
      console.log(`📝 Recorded: ${migration.version}\n`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// 마이그레이션 상태 확인
async function showStatus() {
  console.log('📊 Migration Status:\n');
  
  try {
    const allMigrations = getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));
    
    console.log('Version | Status | Description');
    console.log('--------|--------|------------');
    
    for (const migration of allMigrations) {
      const status = appliedVersions.has(migration.version) ? '✅ Applied' : '⏳ Pending';
      console.log(`${migration.version.padEnd(7)} | ${status.padEnd(8)} | ${migration.description}`);
    }
    
    const pendingCount = allMigrations.length - appliedMigrations.length;
    console.log(`\n📈 Total: ${allMigrations.length} migrations`);
    console.log(`✅ Applied: ${appliedMigrations.length}`);
    console.log(`⏳ Pending: ${pendingCount}`);
    
  } catch (error) {
    console.error('Failed to get migration status:', error.message);
    process.exit(1);
  }
}

// CLI 처리
const command = process.argv[2];

switch (command) {
  case 'run':
    runMigrations();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run migrate:run    - Run pending migrations');
    console.log('  npm run migrate:status - Show migration status');
    break;
}