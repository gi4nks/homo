'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { 
  UpdateSceneContentSchema, 
  UpdateScenePromptGoalsSchema, 
  ReorderScenesSchema,
  IdSchema,
  CreateSceneSchema,
  UpdateSceneSchema,
  ToggleCharacterInSceneSchema,
  CloneItemSchema
} from '@/lib/validations';

// --- STANDARDIZED RESPONSE TYPE ---

export type ActionResponse<T = any> = 
  | { success: true; data: T }
  | { success: false; error: string; validationErrors?: any };

// --- SCENE ACTIONS ---

export async function createScene(chapterId: string, title: string): Promise<ActionResponse> {
  const validated = CreateSceneSchema.safeParse({ chapterId, title });
  if (!validated.success) return { success: false, error: "Invalid data", validationErrors: validated.error.format() };

  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: validated.data.chapterId } });
    if (!chapter) return { success: false, error: "Chapter not found" };

    const lastScene = await prisma.scene.findFirst({
      where: { chapterId: validated.data.chapterId },
      orderBy: { sceneNumber: 'desc' },
    });
    
    const nextNumber = (lastScene?.sceneNumber ?? 0) + 1;
    const scene = await prisma.scene.create({
      data: { 
        title: validated.data.title, 
        chapterId: validated.data.chapterId, 
        orderIndex: nextNumber, 
        sceneNumber: nextNumber 
      },
    });

    revalidatePath(`/book/${chapter.bookId}`);
    return { success: true, data: scene };
  } catch (err) {
    return { success: false, error: "Failed to create scene" };
  }
}

export async function updateSceneContent(id: string, content: string): Promise<ActionResponse> {
  const validated = UpdateSceneContentSchema.safeParse({ id, content });
  if (!validated.success) return { success: false, error: "Invalid ID or Content" };

  try {
    const scene = await prisma.scene.update({
      where: { id: validated.data.id },
      data: { content: validated.data.content },
      include: { chapter: true }
    });
    revalidatePath(`/book/${scene.chapter.bookId}`);
    return { success: true, data: scene };
  } catch (err) {
    return { success: false, error: "Failed to update content" };
  }
}

export async function updateScenePromptGoals(id: string, promptGoals: string): Promise<ActionResponse> {
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
  } catch (err) {
    return { success: false, error: "Failed to update goals" };
  }
}

export async function deleteScene(id: string): Promise<ActionResponse> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid ID" };

  try {
    const scene = await prisma.scene.findUnique({ 
      where: { id: validated.data }, 
      include: { chapter: true } 
    });
    if (!scene) return { success: false, error: "Scene not found" };

    const { chapterId, orderIndex } = scene;
    const bookId = scene.chapter.bookId;

    await prisma.$transaction([
      prisma.scene.delete({ where: { id: validated.data } }),
      prisma.scene.updateMany({
        where: { chapterId, orderIndex: { gt: orderIndex } },
        data: { orderIndex: { decrement: 1 }, sceneNumber: { decrement: 1 } }
      })
    ]);

    revalidatePath(`/book/${bookId}`);
    return { success: true, data: { id: validated.data } };
  } catch (err) {
    return { success: false, error: "Failed to delete scene" };
  }
}

export async function reorderScenes(chapterId: string, updates: any[]): Promise<ActionResponse> {
  const validated = ReorderScenesSchema.safeParse({ chapterId, updates });
  if (!validated.success) return { success: false, error: "Invalid sequence data" };

  try {
    await prisma.$transaction(
      validated.data.updates.map(u => prisma.scene.update({
        where: { id: u.id },
        data: { orderIndex: u.orderIndex, sceneNumber: u.orderIndex }
      }))
    );
    const chapter = await prisma.chapter.findUnique({ where: { id: validated.data.chapterId } });
    if (chapter) revalidatePath(`/book/${chapter.bookId}`);
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: "Failed to reorder scenes" };
  }
}

export async function toggleCharacterInScene(sceneId: string, characterId: string): Promise<ActionResponse> {
  const validated = ToggleCharacterInSceneSchema.safeParse({ sceneId, characterId });
  if (!validated.success) return { success: false, error: "Invalid IDs" };

  try {
    const scene = await prisma.scene.findUnique({ 
      where: { id: validated.data.sceneId }, 
      include: { characters: true, chapter: true } 
    });
    if (!scene) return { success: false, error: "Scene not found" };

    const isPresent = scene.characters.some(c => c.id === validated.data.characterId);
    
    await prisma.scene.update({
      where: { id: validated.data.sceneId },
      data: { 
        characters: isPresent 
          ? { disconnect: { id: validated.data.characterId } } 
          : { connect: { id: validated.data.characterId } } 
      }
    });

    revalidatePath(`/book/${scene.chapter.bookId}`);
    return { success: true, data: { isPresent: !isPresent } };
  } catch (err) {
    return { success: false, error: "Failed to toggle character" };
  }
}

export async function getSceneById(id: string): Promise<ActionResponse> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid Scene ID" };

  try {
    const scene = await prisma.scene.findUnique({
      where: { id: validated.data }
    });
    if (!scene) return { success: false, error: "Scene not found" };
    return { success: true, data: scene };
  } catch (err) {
    return { success: false, error: "Database error fetching scene" };
  }
}

export async function updateScene(id: string, data: any): Promise<ActionResponse> {
  const validated = UpdateSceneSchema.safeParse({ id, ...data });
  if (!validated.success) return { success: false, error: "Invalid update data", validationErrors: validated.error.format() };

  try {
    const { id: sceneId, ...payload } = validated.data;
    const scene = await prisma.scene.update({
      where: { id: sceneId },
      data: payload,
      include: { chapter: true }
    });
    revalidatePath(`/book/${scene.chapter.bookId}`);
    return { success: true, data: scene };
  } catch (err) {
    return { success: false, error: "Failed to update scene" };
  }
}

export async function cloneScene(id: string): Promise<ActionResponse> {
  const validated = CloneItemSchema.safeParse({ id });
  if (!validated.success) return { success: false, error: "Invalid Scene ID" };

  try {
    const original = await prisma.scene.findUnique({
      where: { id: validated.data.id },
      include: { characters: { select: { id: true } }, chapter: true }
    });
    if (!original) return { success: false, error: "Original scene not found" };

    const newScene = await prisma.$transaction(async (tx) => {
      // 1. Shift siblings forward to make room
      await tx.scene.updateMany({
        where: { 
          chapterId: original.chapterId, 
          orderIndex: { gt: original.orderIndex } 
        },
        data: { 
          orderIndex: { increment: 1 }, 
          sceneNumber: { increment: 1 } 
        }
      });

      // 2. Create the duplicated record
      return await tx.scene.create({
        data: {
          title: `${original.title} (Copy)`,
          chapterId: original.chapterId,
          orderIndex: original.orderIndex + 1,
          sceneNumber: original.sceneNumber + 1,
          content: original.content,
          promptGoals: original.promptGoals,
          characters: {
            connect: original.characters.map(c => ({ id: c.id }))
          }
        }
      });
    });

    revalidatePath(`/book/${original.chapter.bookId}`);
    return { success: true, data: newScene };
  } catch (error) {
    console.error("Clone Scene Error:", error);
    return { success: false, error: "Failed to clone scene" };
  }
}
