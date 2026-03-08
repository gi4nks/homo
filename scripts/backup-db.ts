#!/usr/bin/env tsx

/**
 * Automated SQLite Database Backup Script
 *
 * Features:
 * - Copies dev.db to backups/ with timestamp
 * - Verifies file integrity with checksum
 * - Rotates backups (keeps last 30)
 * - Graceful error handling
 *
 * Usage:
 *   tsx scripts/backup-db.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(PROJECT_ROOT, './prisma/dev.db');
const BACKUPS_DIR = path.join(PROJECT_ROOT, './prisma/backups');
const MAX_BACKUPS = 30;

interface BackupResult {
  success: boolean;
  backupPath?: string;
  checksum?: string;
  error?: string;
}

/**
 * Calculate MD5 checksum of a file
 */
function calculateChecksum(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Format timestamp for backup filename
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .replace(/\..+/, ''); // Remove milliseconds
}

/**
 * Ensure backups directory exists
 */
function ensureBackupsDir(): void {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    console.log(`✅ Created backups directory: ${BACKUPS_DIR}`);
  }
}

/**
 * Rotate old backups (keep only last MAX_BACKUPS)
 */
function rotateBackups(): void {
  if (!fs.existsSync(BACKUPS_DIR)) return;

  const backupFiles = fs.readdirSync(BACKUPS_DIR)
    .filter(file => file.startsWith('dev-') && file.endsWith('.db'))
    .map(file => ({
      name: file,
      path: path.join(BACKUPS_DIR, file),
      mtime: fs.statSync(path.join(BACKUPS_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime); // Sort by newest first

  // Delete backups beyond MAX_BACKUPS
  if (backupFiles.length > MAX_BACKUPS) {
    const toDelete = backupFiles.slice(MAX_BACKUPS);
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`🗑️  Deleted old backup: ${backup.name}`);
    });
    console.log(`✅ Rotated backups (kept last ${MAX_BACKUPS})`);
  }
}

/**
 * Perform database backup
 */
export function backupDatabase(): BackupResult {
  try {
    // Check if source database exists
    if (!fs.existsSync(DB_PATH)) {
      console.warn('⚠️  Database file not found (fresh install?). Skipping backup.');
      return {
        success: true,
        error: 'Database file not found - skipping backup for fresh install'
      };
    }

    // Check if database is empty (size < 1KB = likely fresh)
    const dbStats = fs.statSync(DB_PATH);
    if (dbStats.size < 1024) {
      console.warn('⚠️  Database file is empty or very small. Skipping backup.');
      return {
        success: true,
        error: 'Database file empty - skipping backup'
      };
    }

    // Ensure backups directory exists
    ensureBackupsDir();

    // Generate backup filename
    const timestamp = getTimestamp();
    const backupFilename = `dev-${timestamp}.db`;
    const backupPath = path.join(BACKUPS_DIR, backupFilename);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);

    // Verify integrity
    const originalChecksum = calculateChecksum(DB_PATH);
    const backupChecksum = calculateChecksum(backupPath);

    if (originalChecksum !== backupChecksum) {
      fs.unlinkSync(backupPath); // Delete corrupted backup
      throw new Error('Backup verification failed: checksums do not match');
    }

    console.log(`✅ Database backup created: ${backupFilename}`);
    console.log(`   Checksum: ${backupChecksum}`);
    console.log(`   Size: ${(dbStats.size / 1024).toFixed(2)} KB`);

    // Rotate old backups
    rotateBackups();

    return {
      success: true,
      backupPath,
      checksum: backupChecksum
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Backup failed:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Main execution (when run directly)
 */
if (require.main === module) {
  console.log('🔄 Starting database backup...\n');
  const result = backupDatabase();

  if (!result.success && result.error && !result.error.includes('skipping')) {
    process.exit(1);
  }

  console.log('\n✅ Backup process completed successfully');
}
