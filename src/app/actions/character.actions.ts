'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CharacterSchema, UpdateCharacterSchema, IdSchema, CharacterInput, UpdateCharacterInput } from '@/lib/validations';
import { ActionResponse } from '@/lib/types';
import { Character } from '@prisma/client';

export async function createCharacter(bookId: string, data: Partial<CharacterInput>): Promise<ActionResponse<Character>> {
  const validated = CharacterSchema.safeParse({ bookId, ...data });
  if (!validated.success) return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };

  try {
    const character = await prisma.character.create({ 
      data: validated.data
    });
    revalidatePath(`/book/${validated.data.bookId}`);
    return { success: true, data: character };
  } catch (error) {
    return { success: false, error: "Failed to create character" };
  }
}

export async function updateCharacter(id: string, data: Partial<UpdateCharacterInput>): Promise<ActionResponse<Character>> {
  const validated = UpdateCharacterSchema.safeParse({ id, ...data });
  if (!validated.success) return { success: false, error: "Invalid character data", fieldErrors: validated.error.flatten().fieldErrors };

  try {
    const { id: charId, ...payload } = validated.data;
    const char = await prisma.character.update({ 
      where: { id: charId }, 
      data: payload 
    });
    revalidatePath(`/book/${char.bookId}`);
    return { success: true, data: char };
  } catch (error) {
    return { success: false, error: "Failed to update character" };
  }
}

export async function deleteCharacter(id: string): Promise<ActionResponse<{ id: string }>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid ID" };

  try {
    const char = await prisma.character.delete({ 
      where: { id: validated.data } 
    });
    revalidatePath(`/book/${char.bookId}`);
    return { success: true, data: { id: validated.data } };
  } catch (error) {
    return { success: false, error: "Failed to delete character" };
  }
}
