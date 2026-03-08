'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { 
  CreateChapterSchema, 
  UpdateChapterSchema, 
  IdSchema, 
  ReorderPayloadSchema,
  UpdateChapterInput
} from '@/lib/validations';
import { ActionResponse } from '@/lib/types';
import { Chapter } from '@prisma/client';
import { z } from 'zod';

export async function createChapter(bookId: string, title: string): Promise<ActionResponse<Chapter>> {
  const validated = CreateChapterSchema.safeParse({ bookId, title });
  if (!validated.success) return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };

  try {
    const lastChapter = await prisma.chapter.findFirst({
      where: { bookId: validated.data.bookId },
      orderBy: { chapterNumber: 'desc' },
    });
    const nextNumber = (lastChapter?.chapterNumber ?? 0) + 1;
    const chapter = await prisma.chapter.create({
      data: { 
        title: validated.data.title, 
        bookId: validated.data.bookId, 
        orderIndex: nextNumber, 
        chapterNumber: nextNumber 
      },
    });
    revalidatePath(`/book/${validated.data.bookId}`);
    revalidatePath('/');
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: "Failed to create chapter" };
  }
}

export async function updateChapter(id: string, data: Partial<UpdateChapterInput>): Promise<ActionResponse<Chapter>> {
  const validated = UpdateChapterSchema.safeParse({ id, ...data });
  if (!validated.success) return { success: false, error: "Invalid data", fieldErrors: validated.error.flatten().fieldErrors };

  try {
    const { id: chapterId, ...payload } = validated.data;
    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: payload,
    });
    // Removed revalidatePath to avoid infinite loops during auto-save.
    return { success: true, data: chapter };
    } catch (err) {
    return { success: false, error: "Could not update chapter" };
  }
}

export async function deleteChapter(id: string): Promise<ActionResponse<{ id: string }>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid ID" };

  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: validated.data } });
    if (!chapter) return { success: false, error: "Chapter not found" };
    
    const { bookId, orderIndex } = chapter;
    
    await prisma.$transaction([
      prisma.chapter.delete({ where: { id: validated.data } }),
      prisma.chapter.updateMany({
        where: { bookId, orderIndex: { gt: orderIndex } },
        data: { orderIndex: { decrement: 1 }, chapterNumber: { decrement: 1 } }
      })
    ]);

    revalidatePath(`/book/${bookId}`);
    revalidatePath('/');
    return { success: true, data: { id: validated.data } };
  } catch (error) {
    return { success: false, error: "Failed to delete chapter" };
  }
}

export async function reorderChapters(bookId: string, updates: z.infer<typeof ReorderPayloadSchema>): Promise<ActionResponse<null>> {
  const validatedParent = IdSchema.safeParse(bookId);
  const validatedUpdates = ReorderPayloadSchema.safeParse(updates);

  if (!validatedParent.success || !validatedUpdates.success) {
    return { success: false, error: "Invalid reorder payload" };
  }

  try {
    await prisma.$transaction(
      validatedUpdates.data.map(u => prisma.chapter.update({
        where: { id: u.id },
        data: { orderIndex: u.orderIndex, chapterNumber: u.orderIndex }
      }))
    );
    revalidatePath(`/book/${validatedParent.data}`);
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: "Failed to reorder chapters" };
  }
}

export async function updateChapterGoal(id: string, chapterGoal: string): Promise<ActionResponse<Chapter>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid ID" };

  try {
    const chapter = await prisma.chapter.update({
      where: { id: validated.data },
      data: { chapterGoal }
    });
    revalidatePath(`/book/${chapter.bookId}`);
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: "Failed to update chapter goal" };
  }
}
