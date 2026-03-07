'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/lib/types';

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
    return { success: true, data: snapshot };
  } catch (error) {
    console.error('Create Snapshot Error:', error);
    return { success: false, error: 'Failed to create snapshot' };
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
