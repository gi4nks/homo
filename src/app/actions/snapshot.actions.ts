'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/lib/types';
import { log } from '@/lib/logger';

const DEFAULT_RETENTION_LIMIT = 50;

export async function createSnapshot(sceneId: string, content: string, label?: string): Promise<ActionResponse<any>> {
  try {
    // Ensure content is at least an empty string to satisfy Prisma validation
    const safeContent = content || "";

    const snapshot = await prisma.snapshot.create({
      data: {
        sceneId,
        content: safeContent,
        label: label || "Snapshot"
      }
    });

    // Auto-cleanup old snapshots after creation (non-blocking)
    cleanupOldSnapshots(sceneId).catch(err =>
      log.error({ sceneId, event: 'snapshot_cleanup_error' }, 'Auto-cleanup failed', err)
    );

    log.snapshot({ sceneId, operation: 'create' });

    return { success: true, data: snapshot };
  } catch (error: any) {
    log.error({ sceneId, event: 'snapshot_create_error' }, 'Failed to create snapshot', error);
    return { success: false, error: 'Failed to create snapshot' };
  }
}

/**
 * Remove old snapshots beyond the retention limit for a specific scene
 */
export async function cleanupOldSnapshots(sceneId: string): Promise<ActionResponse<{ deleted: number }>> {
  try {
    // Get retention limit from settings
    const settings = await prisma.appSettings.findUnique({ where: { id: 'global' } });
    const retentionLimit = settings?.snapshotRetentionLimit ?? DEFAULT_RETENTION_LIMIT;

    // 0 means unlimited - no cleanup
    if (retentionLimit === 0) return { success: true, data: { deleted: 0 } };

    // Count snapshots for this scene
    const totalSnapshots = await prisma.snapshot.count({ where: { sceneId } });

    if (totalSnapshots <= retentionLimit) {
      return { success: true, data: { deleted: 0 } };
    }

    // Find IDs of snapshots to keep (newest N)
    const snapshotsToKeep = await prisma.snapshot.findMany({
      where: { sceneId },
      orderBy: { createdAt: 'desc' },
      take: retentionLimit,
      select: { id: true }
    });

    const keepIds = snapshotsToKeep.map(s => s.id);

    // Delete all snapshots NOT in the keep list
    const result = await prisma.snapshot.deleteMany({
      where: {
        sceneId,
        id: { notIn: keepIds }
      }
    });

    log.snapshot({ sceneId, operation: 'cleanup', count: result.count });

    return { success: true, data: { deleted: result.count } };
  } catch (error: any) {
    log.error({ sceneId, event: 'snapshot_cleanup_error' }, 'Failed to cleanup snapshots', error);
    return { success: false, error: 'Failed to cleanup snapshots' };
  }
}

/**
 * Cleanup snapshots for ALL scenes in the database
 */
export async function cleanupAllSnapshots(): Promise<ActionResponse<{ totalDeleted: number; scenesProcessed: number }>> {
  try {
    // Get all unique sceneIds that have snapshots
    const scenesWithSnapshots = await prisma.snapshot.findMany({
      select: { sceneId: true },
      distinct: ['sceneId']
    });

    let totalDeleted = 0;

    for (const { sceneId } of scenesWithSnapshots) {
      const result = await cleanupOldSnapshots(sceneId);
      if (result.success && result.data) {
        totalDeleted += result.data.deleted;
      }
    }

    return {
      success: true,
      data: {
        totalDeleted,
        scenesProcessed: scenesWithSnapshots.length
      }
    };
  } catch (error) {
    console.error('Cleanup All Snapshots Error:', error);
    return { success: false, error: 'Failed to cleanup all snapshots' };
  }
}

/**
 * Get snapshot statistics for the entire database
 */
export async function getSnapshotStats(): Promise<ActionResponse<{
  totalSnapshots: number;
  scenesWithSnapshots: number;
  retentionLimit: number;
}>> {
  try {
    const totalSnapshots = await prisma.snapshot.count();

    const scenesWithSnapshots = await prisma.snapshot.findMany({
      select: { sceneId: true },
      distinct: ['sceneId']
    });

    const settings = await prisma.appSettings.findUnique({ where: { id: 'global' } });
    const retentionLimit = settings?.snapshotRetentionLimit ?? DEFAULT_RETENTION_LIMIT;

    return {
      success: true,
      data: {
        totalSnapshots,
        scenesWithSnapshots: scenesWithSnapshots.length,
        retentionLimit
      }
    };
  } catch (error) {
    console.error('Snapshot Stats Error:', error);
    return { success: false, error: 'Failed to fetch snapshot stats' };
  }
}

/**
 * Update the snapshot retention limit
 */
export async function updateSnapshotRetentionLimit(limit: number): Promise<ActionResponse<void>> {
  try {
    if (limit < 0) return { success: false, error: 'Limit must be 0 or greater' };

    await prisma.appSettings.upsert({
      where: { id: 'global' },
      update: { snapshotRetentionLimit: limit },
      create: { id: 'global', snapshotRetentionLimit: limit }
    });

    return { success: true };
  } catch (error) {
    console.error('Update Retention Limit Error:', error);
    return { success: false, error: 'Failed to update retention limit' };
  }
}

export async function getSnapshotsBySceneId(sceneId: string) {
  try {
    return await prisma.snapshot.findMany({
      where: { sceneId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Fetch Snapshots Error:', error);
    return [];
  }
}

export async function deleteSnapshot(id: string): Promise<ActionResponse<null>> {
  try {
    await prisma.snapshot.delete({ where: { id } });
    return { success: true, data: null };
  } catch (error) {
    console.error('Delete Snapshot Error:', error);
    return { success: false, error: 'Failed to delete snapshot' };
  }
}

export async function restoreSnapshot(snapshotId: string): Promise<ActionResponse<any>> {
  try {
    const snapshot = await prisma.snapshot.findUnique({
      where: { id: snapshotId },
      include: { scene: { include: { chapter: true } } }
    });

    if (!snapshot) throw new Error('Snapshot not found');

    const updatedScene = await prisma.scene.update({
      where: { id: snapshot.sceneId },
      data: { content: snapshot.content }
    });

    revalidatePath(`/book/${snapshot.scene.chapter.bookId}`);
    return { success: true, data: updatedScene };
  } catch (error) {
    console.error('Restore Snapshot Error:', error);
    return { success: false, error: 'Failed to restore snapshot' };
  }
}
