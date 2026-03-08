'use server';

/**
 * Server Actions for Database Backup & Restore
 *
 * Provides safe backup/restore operations with integrity checks
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { log } from '@/lib/logger';

const PROJECT_ROOT = path.resolve(process.cwd());
const DB_PATH = path.join(PROJECT_ROOT, 'dev.db');
const BACKUPS_DIR = path.join(PROJECT_ROOT, 'backups');
const MAX_BACKUPS = 30;

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  sizeFormatted: string;
  timestamp: string;
  checksum: string;
  createdAt: number;
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
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get list of all available backups
 */
export async function getBackupsList(): Promise<ActionResponse<BackupInfo[]>> {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      return { success: true, data: [] };
    }

    const backupFiles = fs.readdirSync(BACKUPS_DIR)
      .filter(file => file.startsWith('dev-') && file.endsWith('.db'))
      .map(filename => {
        const filePath = path.join(BACKUPS_DIR, filename);
        const stats = fs.statSync(filePath);

        return {
          filename,
          path: filePath,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          timestamp: filename.replace('dev-', '').replace('.db', ''),
          checksum: calculateChecksum(filePath),
          createdAt: stats.mtime.getTime()
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Newest first

    return { success: true, data: backupFiles };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Create a manual backup
 */
export async function createManualBackup(): Promise<ActionResponse<BackupInfo>> {
  try {
    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
      return {
        success: false,
        error: 'Database file not found'
      };
    }

    // Ensure backups directory exists
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    // Generate backup filename with "manual" prefix
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/T/, '_')
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    const backupFilename = `dev-manual_${timestamp}.db`;
    const backupPath = path.join(BACKUPS_DIR, backupFilename);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);

    // Verify integrity
    const originalChecksum = calculateChecksum(DB_PATH);
    const backupChecksum = calculateChecksum(backupPath);

    if (originalChecksum !== backupChecksum) {
      fs.unlinkSync(backupPath); // Delete corrupted backup
      return {
        success: false,
        error: 'Backup verification failed: checksums do not match'
      };
    }

    // Get backup info
    const stats = fs.statSync(backupPath);
    const backupInfo: BackupInfo = {
      filename: backupFilename,
      path: backupPath,
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      timestamp: backupFilename.replace('dev-manual_', '').replace('.db', ''),
      checksum: backupChecksum,
      createdAt: stats.mtime.getTime()
    };

    // Rotate old backups
    await rotateBackups();

    log.backup({
      operation: 'create',
      filename: backupFilename,
      size: stats.size,
      checksum: backupChecksum
    });

    return { success: true, data: backupInfo };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error({ event: 'backup_create_error' }, 'Failed to create backup', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Restore database from backup
 */
export async function restoreFromBackup(backupFilename: string): Promise<ActionResponse> {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupFilename);

    // Verify backup file exists
    if (!fs.existsSync(backupPath)) {
      return {
        success: false,
        error: 'Backup file not found'
      };
    }

    // Create a safety backup of current database before restore
    if (fs.existsSync(DB_PATH)) {
      const safetyBackupFilename = `dev-pre-restore_${Date.now()}.db`;
      const safetyBackupPath = path.join(BACKUPS_DIR, safetyBackupFilename);
      fs.copyFileSync(DB_PATH, safetyBackupPath);
    }

    // Restore: copy backup to dev.db
    fs.copyFileSync(backupPath, DB_PATH);

    // Verify restoration
    const backupChecksum = calculateChecksum(backupPath);
    const restoredChecksum = calculateChecksum(DB_PATH);

    if (backupChecksum !== restoredChecksum) {
      return {
        success: false,
        error: 'Restore verification failed: checksums do not match'
      };
    }

    log.backup({
      operation: 'restore',
      filename: backupFilename,
      checksum: backupChecksum
    });

    return { success: true };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error({ event: 'backup_restore_error', backupFilename }, 'Failed to restore backup', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a specific backup file
 */
export async function deleteBackup(backupFilename: string): Promise<ActionResponse> {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupFilename);

    if (!fs.existsSync(backupPath)) {
      return {
        success: false,
        error: 'Backup file not found'
      };
    }

    fs.unlinkSync(backupPath);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Download backup file (returns file buffer)
 */
export async function downloadBackup(backupFilename: string): Promise<ActionResponse<Buffer>> {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupFilename);

    if (!fs.existsSync(backupPath)) {
      return {
        success: false,
        error: 'Backup file not found'
      };
    }

    const fileBuffer = fs.readFileSync(backupPath);
    return { success: true, data: fileBuffer };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Rotate old backups (internal helper)
 */
async function rotateBackups(): Promise<void> {
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
    });
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<ActionResponse<{
  totalBackups: number;
  totalSize: number;
  totalSizeFormatted: string;
  oldestBackup: string | null;
  newestBackup: string | null;
}>> {
  try {
    const backupsResult = await getBackupsList();
    if (!backupsResult.success || !backupsResult.data) {
      return { success: false, error: backupsResult.error };
    }

    const backups = backupsResult.data;
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

    return {
      success: true,
      data: {
        totalBackups: backups.length,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
        newestBackup: backups.length > 0 ? backups[0].timestamp : null
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
