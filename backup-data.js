#!/usr/bin/env node

/**
 * FcKopri Database Data Backup Script
 * This script exports all data from Supabase database to JSON files
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
// Try .env.development.local first (for local DB), then .env.local (for cloud)
require('dotenv').config({ path: '.env.development.local' }) || 
require('dotenv').config({ path: '.env.local' }) || 
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tables to backup in dependency order
const tables = [
  'competitions',
  'teams',
  'players',
  'matches',
  'playoff_matches',
  'match_events',
  'match_predictions',
  'champion_votes',
  'match_photos',
  'match_videos',
  'team_photos',
  'mvp_votes',
  'best6_votes',
  'comments',
  'comment_reactions'
];

async function backupTable(tableName) {
  try {
    console.log(`📥 Backing up ${tableName}...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      table: tableName,
      count: data.length,
      data: data
    };
  } catch (error) {
    console.error(`❌ Error backing up ${tableName}:`, error.message);
    return {
      table: tableName,
      count: 0,
      data: [],
      error: error.message
    };
  }
}

async function generateSchemaSQL() {
  console.log('📋 Generating database schema...');
  
  // Check which tables actually exist
  const existingTables = [];
  for (const table of [...tables, 'playoff_matches']) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (!error) {
        existingTables.push(table);
      }
    } catch (e) {
      // Table doesn't exist
    }
  }
  
  console.log(`   Found ${existingTables.length} tables in database`);
  
  // Generate complete schema from sql directory
  const fs = require('fs');
  const sqlDir = path.join(__dirname, 'sql');
  
  try {
    // Use the complete schema file v1.1.3
    const completeSchemaPath = path.join(sqlDir, 'complete_schema_v1.1.3.sql');
    try {
      const completeSchema = fs.readFileSync(completeSchemaPath, 'utf-8');
      console.log('   Using complete schema v1.1.3');
      
      // Add header with backup information
      const schemaContent = `-- FcKopri Complete Database Schema
-- Generated: ${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })} (Asia/Seoul)
-- Database: Supabase PostgreSQL
-- Existing tables: ${existingTables.join(', ')}
-- Source: complete_schema_v1.1.3.sql

${completeSchema}`;
      
      return schemaContent;
    } catch (error) {
      console.warn(`⚠️  Could not read complete schema: ${error.message}`);
      // Return basic schema info if file not found
      return `-- FcKopri Database Schema
-- Generated: ${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })} (Asia/Seoul)
-- Schema file not found: complete_schema_v1.1.3.sql`;
    }
    
  } catch (error) {
    console.error('❌ Could not generate schema from sql directory');
    return `-- FcKopri Database Schema
-- Generated: ${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })} (Asia/Seoul)
-- Schema generation failed: ${error.message}`;
  }
}

async function createBackup() {
  // 한국 시간(Asia/Seoul) 기준으로 타임스탬프 생성
  const koreaTime = new Date().toLocaleString('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/[- :]/g, '').replace('T', '-');
  
  const backupDir = path.join(__dirname, 'backups', `backup-${koreaTime}`);
  
  try {
    // Create backup directory
    await fs.mkdir(path.join(__dirname, 'backups'), { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });
    
    console.log('🚀 Starting FcKopri database backup...');
    console.log(`📁 Backup directory: ${backupDir}`);
    
    // Generate and save schema
    try {
      const schemaSQL = await generateSchemaSQL();
      await fs.writeFile(
        path.join(backupDir, 'schema.sql'),
        schemaSQL,
        'utf-8'
      );
      console.log('📋 Schema SQL generated and saved');
    } catch (error) {
      console.warn('⚠️  Could not generate schema:', error.message);
    }
    
    const backupData = {
      version: '1.0',
      timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }),
      timezone: 'Asia/Seoul',
      database: 'FcKopri Supabase Database',
      tables: {}
    };
    
    // Backup each table
    for (const table of tables) {
      const tableData = await backupTable(table);
      backupData.tables[table] = tableData;
      
      // Save individual table backup
      await fs.writeFile(
        path.join(backupDir, `${table}.json`),
        JSON.stringify(tableData, null, 2),
        'utf-8'
      );
    }
    
    // Save complete backup
    await fs.writeFile(
      path.join(backupDir, 'complete-backup.json'),
      JSON.stringify(backupData, null, 2),
      'utf-8'
    );
    
    // Create backup summary
    const summary = {
      timestamp: backupData.timestamp,
      tables: Object.entries(backupData.tables).map(([name, data]) => ({
        name,
        count: data.count,
        error: data.error || null
      })),
      totalRecords: Object.values(backupData.tables).reduce((sum, table) => sum + table.count, 0)
    };
    
    await fs.writeFile(
      path.join(backupDir, 'backup-summary.json'),
      JSON.stringify(summary, null, 2),
      'utf-8'
    );
    
    console.log('\n✅ Backup completed successfully!');
    console.log('\n📊 Backup Summary:');
    summary.tables.forEach(table => {
      if (table.error) {
        console.log(`   ${table.name}: ❌ Error - ${table.error}`);
      } else {
        console.log(`   ${table.name}: ${table.count} records`);
      }
    });
    console.log(`\n📈 Total records backed up: ${summary.totalRecords}`);
    console.log(`📁 Backup saved to: ${backupDir}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run backup
createBackup();