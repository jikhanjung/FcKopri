#!/usr/bin/env node

/**
 * FcKopri Database Data Restore Script
 * This script restores data from JSON backup files to Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

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

// Tables to restore in dependency order
const tableOrder = [
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function clearTable(tableName) {
  try {
    console.log(`🗑️  Clearing ${tableName}...`);
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (error) throw error;
    console.log(`✅ Cleared ${tableName}`);
  } catch (error) {
    console.error(`❌ Error clearing ${tableName}:`, error.message);
    throw error;
  }
}

async function restoreTable(tableName, data) {
  try {
    if (!data || data.length === 0) {
      console.log(`⏭️  Skipping ${tableName} (no data)`);
      return { table: tableName, restored: 0 };
    }

    console.log(`📤 Restoring ${data.length} records to ${tableName}...`);
    
    // Insert data in batches of 100
    const batchSize = 100;
    let restored = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error in batch ${i}-${i + batch.length}:`, error.message);
        throw error;
      }
      
      restored += batch.length;
      console.log(`   Restored ${restored}/${data.length} records...`);
    }
    
    console.log(`✅ Restored ${restored} records to ${tableName}`);
    return { table: tableName, restored };
    
  } catch (error) {
    console.error(`❌ Error restoring ${tableName}:`, error.message);
    throw error;
  }
}

async function listBackups() {
  try {
    const backupsDir = path.join(__dirname, 'backups');
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    
    const backups = entries
      .filter(entry => entry.isDirectory() && entry.name.startsWith('backup-'))
      .map(entry => entry.name)
      .sort()
      .reverse();
    
    return backups;
  } catch (error) {
    return [];
  }
}

async function restoreBackup() {
  try {
    console.log('🔍 Looking for available backups...\n');
    
    const backups = await listBackups();
    
    if (backups.length === 0) {
      console.log('❌ No backups found in ./backups directory');
      console.log('💡 Run backup-data.js first to create a backup');
      process.exit(1);
    }
    
    console.log('📂 Available backups:');
    backups.forEach((backup, index) => {
      console.log(`   ${index + 1}. ${backup}`);
    });
    
    const choice = await question('\nSelect backup number (or press Enter for latest): ');
    const backupIndex = choice ? parseInt(choice) - 1 : 0;
    
    if (backupIndex < 0 || backupIndex >= backups.length) {
      console.log('❌ Invalid selection');
      process.exit(1);
    }
    
    const selectedBackup = backups[backupIndex];
    const backupDir = path.join(__dirname, 'backups', selectedBackup);
    
    console.log(`\n📁 Selected backup: ${selectedBackup}`);
    
    // Load backup data
    const backupPath = path.join(backupDir, 'complete-backup.json');
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf-8'));
    
    // Show backup summary
    console.log('\n📊 Backup Summary:');
    console.log(`   Timestamp: ${backupData.timestamp}`);
    console.log(`   Tables: ${Object.keys(backupData.tables).length}`);
    console.log(`   Total records: ${Object.values(backupData.tables).reduce((sum, t) => sum + t.count, 0)}`);
    
    const confirm = await question('\n⚠️  WARNING: This will DELETE all existing data. Continue? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Restore cancelled');
      process.exit(0);
    }
    
    console.log('\n🚀 Starting restore process...\n');
    
    // Clear tables in reverse order
    console.log('📥 Clearing existing data...');
    for (const table of [...tableOrder].reverse()) {
      await clearTable(table);
    }
    
    console.log('\n📤 Restoring data...');
    
    // Restore tables in correct order
    const results = [];
    for (const table of tableOrder) {
      const tableData = backupData.tables[table];
      if (tableData && tableData.data) {
        const result = await restoreTable(table, tableData.data);
        results.push(result);
      }
    }
    
    console.log('\n✅ Restore completed successfully!\n');
    console.log('📊 Restore Summary:');
    results.forEach(result => {
      console.log(`   ${result.table}: ${result.restored} records`);
    });
    console.log(`\n📈 Total records restored: ${results.reduce((sum, r) => sum + r.restored, 0)}`);
    
  } catch (error) {
    console.error('\n❌ Restore failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Show usage
console.log('🏆 FcKopri Database Restore Tool');
console.log('================================\n');

// Run restore
restoreBackup();