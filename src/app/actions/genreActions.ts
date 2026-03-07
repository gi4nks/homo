'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { GenreConfigSchema, UpdateGenreConfigSchema, IdSchema, GenreConfigInput, UpdateGenreConfigInput } from '@/lib/validations';
import { ActionResponse } from '@/lib/types';
import { GenreConfig } from '@prisma/client';

export async function getGenreConfigs(): Promise<GenreConfig[]> {
  try {
    return await prisma.genreConfig.findMany({
      orderBy: { genreName: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch genre configs:', error);
    return [];
  }
}

export async function createGenreConfig(data: GenreConfigInput): Promise<ActionResponse<GenreConfig>> {
  const validated = GenreConfigSchema.safeParse(data);
  if (!validated.success) return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };

  try {
    const config = await prisma.genreConfig.create({
      data: validated.data,
    });
    revalidatePath('/settings/genres');
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: "Could not create genre configuration" };
  }
}

export async function updateGenreConfig(id: string, data: Partial<UpdateGenreConfigInput>): Promise<ActionResponse<GenreConfig>> {
  const validated = UpdateGenreConfigSchema.safeParse({ id, ...data });
  if (!validated.success) return { success: false, error: "Invalid data", fieldErrors: validated.error.flatten().fieldErrors };

  try {
    const { id: configId, ...payload } = validated.data;
    const config = await prisma.genreConfig.update({
      where: { id: configId },
      data: payload,
    });
    revalidatePath('/settings/genres');
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: "Could not update genre configuration" };
  }
}

export async function deleteGenreConfig(id: string): Promise<ActionResponse<{ id: string }>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid ID" };

  try {
    await prisma.genreConfig.delete({
      where: { id: validated.data },
    });
    revalidatePath('/settings/genres');
    return { success: true, data: { id: validated.data } };
  } catch (error) {
    return { success: false, error: "Could not delete genre configuration" };
  }
}
