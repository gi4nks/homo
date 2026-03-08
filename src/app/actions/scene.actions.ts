'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  UpdateSceneContentSchema,
  UpdateScenePromptGoalsSchema,
  IdSchema,
  CreateSceneSchema,
  UpdateSceneSchema,
  ToggleCharacterInSceneSchema,
  CloneItemSchema,
  ReorderPayloadSchema,
  CreateSceneInput,
  UpdateSceneContentInput,
  UpdateScenePromptGoalsInput,
  UpdateSceneInput,
} from '@/lib/validations';
import { sanitizeHtml, calculateWordCount, validateHtml } from '@/lib/html-sanitizer';
import { z } from 'zod';
import { Scene } from '@prisma/client';
import { ActionResponse } from '@/lib/types';
import { log } from '@/lib/logger';

// --- SCENE ACTIONS ---

export async function createScene(chapterId: string, title: string): Promise<ActionResponse<Scene>> {
  const validated = CreateSceneSchema.safeParse({ chapterId, title });
  if (!validated.success) return { success: false, error: "Invalid data" };

  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: validated.data.chapterId } });
    if (!chapter) return { success: false, error: "Chapter not found" };

    const lastScene = await prisma.scene.findFirst({
      where: { chapterId: validated.data.chapterId },
      orderBy: { sceneNumber: 'desc' },
    });
    
    const nextNumber = (lastScene?.sceneNumber ?? 0) + 1;
    const scene = await prisma.scene.create({
      data: { title: validated.data.title, chapterId: validated.data.chapterId, orderIndex: nextNumber, sceneNumber: nextNumber },
    });

    revalidatePath(`/book/${chapter.bookId}`);
    return { success: true, data: scene };
  } catch (err) { return { success: false, error: "Failed to create scene" }; }
}

export async function updateSceneContent(id: string, content: string): Promise<ActionResponse<Scene>> {
  const validated = UpdateSceneContentSchema.safeParse({ id, content });
  if (!validated.success) return { success: false, error: "Invalid ID or Content" };

  try {
    // SECURITY: Sanitize HTML content before storage
    const sanitizedContent = sanitizeHtml(validated.data.content);

    // Validate HTML structure
    const validation = validateHtml(validated.data.content);
    if (!validation.isValid) {
      log.warn({
        sceneId: validated.data.id,
        errors: validation.errors,
        warnings: validation.warnings,
        event: 'html_validation_warning'
      }, 'HTML validation warnings detected');

      // Log rejected content for debugging (only errors, not full content)
      if (validation.errors.length > 0) {
        log.error({
          sceneId: validated.data.id,
          errors: validation.errors,
          event: 'malicious_content_sanitized'
        }, 'Potentially malicious content detected and sanitized');
      }
    }

    // Calculate word count from sanitized content
    const wordCount = calculateWordCount(sanitizedContent);

    const scene = await prisma.scene.update({
      where: { id: validated.data.id },
      data: { content: sanitizedContent, wordCount },
      include: { chapter: true }
    });

    log.database({
      operation: 'update',
      model: 'scene',
      recordId: validated.data.id
    });

    // We don't revalidate path here because we use synchronous TipTap updates
    // and manual force-flushes to avoid editor resets.
    return { success: true, data: scene };
  } catch (err: any) {
    log.error({
      sceneId: validated.data.id,
      event: 'update_scene_content_error'
    }, 'Failed to update scene content', err);
    return { success: false, error: "Failed to update content" };
  }
}

export async function updateScenePromptGoals(id: string, promptGoals: string): Promise<ActionResponse<Scene>> {
  const validated = UpdateScenePromptGoalsSchema.safeParse({ id, promptGoals });
  if (!validated.success) return { success: false, error: "Invalid data" };

  try {
    const scene = await prisma.scene.update({
      where: { id: validated.data.id },
      data: { promptGoals: validated.data.promptGoals },
      include: { chapter: true }
    });
    revalidatePath(`/book/${scene.chapter.bookId}`);
    return { success: true, data: scene };
  } catch (err) { return { success: false, error: "Failed to update goals" }; }
}

export async function deleteScene(id: string): Promise<ActionResponse<{ id: string }>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid ID" };

  try {
    const scene = await prisma.scene.findUnique({ where: { id: validated.data }, include: { chapter: true } });
    if (!scene) return { success: false, error: "Scene not found" };
    const bookId = scene.chapter.bookId;

    await prisma.scene.delete({ where: { id: validated.data } });
    revalidatePath(`/book/${bookId}`);
    return { success: true, data: { id: validated.data } };
  } catch (err) { return { success: false, error: "Failed to delete scene" }; }
}

export async function updateScene(id: string, data: Partial<UpdateSceneInput>): Promise<ActionResponse<Scene>> {
  const validated = UpdateSceneSchema.safeParse({ id, ...data });
  if (!validated.success) return { success: false, error: "Invalid data" };

  try {
    const { id: sceneId, ...payload } = validated.data;
    const updateData: any = { ...payload };

    // SECURITY: Sanitize content if it's being updated
    if (payload.content !== undefined) {
      updateData.content = sanitizeHtml(payload.content);
      updateData.wordCount = calculateWordCount(updateData.content);

      // Validate and log warnings
      const validation = validateHtml(payload.content);
      if (!validation.isValid) {
        console.warn('[Scene Update] HTML validation warnings:', {
          sceneId,
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
    }

    const scene = await prisma.scene.update({
      where: { id: sceneId },
      data: updateData,
      include: { chapter: true }
    });

    // We don't revalidate here to avoid infinite loops during auto-save.
    // The UI is kept in sync via Zustand and WorkspaceSync.
    return { success: true, data: scene };
  } catch (err: any) {
    return { success: false, error: "Failed to update scene" };
  }
}

export async function getSceneById(id: string): Promise<ActionResponse<Scene>> {
  try {
    const scene = await prisma.scene.findUnique({ where: { id } });
    if (!scene) return { success: false, error: "Scene not found" };
    return { success: true, data: scene };
  } catch (err) { return { success: false, error: "Database error" }; }
}

export async function toggleCharacterInScene(sceneId: string, characterId: string): Promise<ActionResponse<{ isPresent: boolean }>> {
  try {
    const scene = await prisma.scene.findUnique({ where: { id: sceneId }, include: { characters: true, chapter: true } });
    if (!scene) return { success: false, error: "Scene not found" };
    const isPresent = scene.characters.some(c => c.id === characterId);
    
    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: { characters: isPresent ? { disconnect: { id: characterId } } : { connect: { id: characterId } } },
      include: { chapter: true }
    });
    revalidatePath(`/book/${updatedScene.chapter.bookId}`);
    return { success: true, data: { isPresent: !isPresent } };
  } catch (err) { return { success: false, error: "Failed to toggle character" }; }
}

export async function reorderScenes(chapterId: string, updates: any): Promise<ActionResponse<null>> {
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    await prisma.$transaction(updates.map((u: any) => prisma.scene.update({ where: { id: u.id }, data: { orderIndex: u.orderIndex, sceneNumber: u.orderIndex } })));
    if (chapter) revalidatePath(`/book/${chapter.bookId}`);
    return { success: true, data: null };
  } catch (err) { return { success: false, error: "Failed to reorder" }; }
}
