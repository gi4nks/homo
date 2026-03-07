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
import { z } from 'zod';
import { Scene } from '@prisma/client';
import { ActionResponse } from '@/lib/types';

// --- UTILITIES ---
function calculateWordCount(html: string): number {
  if (!html) return 0;
  const text = html
    .replace(/<[^>]*>?/gm, ' ') 
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')       
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

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
    const wordCount = calculateWordCount(validated.data.content);
    const scene = await prisma.scene.update({
      where: { id: validated.data.id },
      data: { content: validated.data.content, wordCount },
      include: { chapter: true }
    });
    return { success: true, data: scene };
  } catch (err) { return { success: false, error: "Failed to update content" }; }
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

    if (payload.content !== undefined) {
      updateData.wordCount = calculateWordCount(payload.content);
    }

    const scene = await prisma.scene.update({
      where: { id: sceneId },
      data: updateData,
      include: { chapter: true }
    });
    
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
    
    await prisma.scene.update({
      where: { id: sceneId },
      data: { characters: isPresent ? { disconnect: { id: characterId } } : { connect: { id: characterId } } }
    });
    return { success: true, data: { isPresent: !isPresent } };
  } catch (err) { return { success: false, error: "Failed to toggle character" }; }
}

export async function reorderScenes(chapterId: string, updates: any): Promise<ActionResponse<null>> {
  try {
    await prisma.$transaction(updates.map((u: any) => prisma.scene.update({ where: { id: u.id }, data: { orderIndex: u.orderIndex, sceneNumber: u.orderIndex } })));
    return { success: true, data: null };
  } catch (err) { return { success: false, error: "Failed to reorder" }; }
}
