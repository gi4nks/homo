'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getGenreConfigs() {
  try {
    return await prisma.genreConfig.findMany({
      orderBy: { genreName: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch genre configs:', error);
    return [];
  }
}

export async function createGenreConfig(data: { genreName: string; customPromptRules: string }) {
  try {
    const config = await prisma.genreConfig.create({
      data,
    });
    revalidatePath('/settings/genres');
    return config;
  } catch (error) {
    console.error('Failed to create genre config:', error);
    throw new Error('Could not create genre configuration');
  }
}

export async function updateGenreConfig(id: string, data: { genreName: string; customPromptRules: string }) {
  try {
    const config = await prisma.genreConfig.update({
      where: { id },
      data,
    });
    revalidatePath('/settings/genres');
    return config;
  } catch (error) {
    console.error('Failed to update genre config:', error);
    throw new Error('Could not update genre configuration');
  }
}

export async function deleteGenreConfig(id: string) {
  try {
    await prisma.genreConfig.delete({
      where: { id },
    });
    revalidatePath('/settings/genres');
  } catch (error) {
    console.error('Failed to delete genre config:', error);
    throw new Error('Could not delete genre configuration');
  }
}
