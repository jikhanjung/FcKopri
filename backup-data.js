#!/usr/bin/env node

/**
 * FcKopri Database Data Backup Script
 * This script exports all data from Supabase database to JSON files
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
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
  // 'playoff_matches', // Commented out - table doesn't exist yet
  'match_events',
  'match_predictions',
  'champion_votes',
  'match_photos',
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
    // Read all SQL files in order
    const sqlFiles = [
      '00_initial_schema.sql',
      '01_match_events_table.sql',
      '02_match_predictions_table.sql',
      '03_champion_votes_table.sql',
      '04_add_man_of_the_match.sql',
      '05_match_photos_table.sql',
      '06_team_photos_table.sql',
      '07_mvp_votes_table.sql',
      '08_comments_table.sql',
      '09_add_youtube_links.sql',
      '10_best6_votes_table.sql',
      '11_playoff_matches_table.sql',
      '20_storage_setup.sql',
      '30_security_policies.sql'
    ];
    
    let schemaContent = `-- FcKopri Complete Database Schema
-- Generated: ${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })} (Asia/Seoul)
-- Database: Supabase PostgreSQL
-- Existing tables: ${existingTables.join(', ')}
-- Includes: Tables, Indexes, Triggers, Storage, Security Policies

`;
    
    for (const file of sqlFiles) {
      const filePath = path.join(sqlDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        schemaContent += `\n-- ========================================\n`;
        schemaContent += `-- ${file}\n`;
        schemaContent += `-- ========================================\n\n`;
        schemaContent += fileContent + '\n';
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}: ${error.message}`);
      }
    }
    
    return schemaContent;
    
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