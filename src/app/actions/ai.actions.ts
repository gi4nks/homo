'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './scene.actions';
import { buildMasterPrompt } from '@/lib/prompt-builder';

// --- UTILITY FUNCTIONS ---
function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- GENERATE PROMPT DATA ---
export async function generatePromptData(bookId: string, currentSceneId: string, profileId?: string, taskType: 'DRAFT' | 'REWRITE' = 'DRAFT', selectedText?: string, instruction?: string) {
  try {
    const currentScene = await prisma.scene.findUnique({
      where: { id: currentSceneId },
      include: { 
        chapter: true, 
        characters: true 
      }
    });
    if (!currentScene) throw new Error('Scene not found');

    const book = await prisma.book.findUnique({ 
      where: { id: bookId },
      include: { genreConfig: true }
    });
    if (!book) throw new Error('Book not found');

    // Get all scenes in order to find the previous one
    const bookWithOrderedContent = await prisma.book.findUnique({
      where: { id: bookId },
      include: { 
        chapters: { 
          orderBy: { orderIndex: 'asc' }, 
          include: { 
            scenes: { 
              orderBy: { orderIndex: 'asc' } 
            } 
          } 
        } 
      }
    });
    
    const allScenes: any[] = [];
    bookWithOrderedContent?.chapters.forEach(ch => ch.scenes.forEach(s => allScenes.push(s)));
    const currentIndex = allScenes.findIndex(s => s.id === currentSceneId);
    
    const prevScene = currentIndex > 0 ? allScenes[currentIndex - 1] : null;

    let previousTextSnippet = "";
    if (cleanHtml(currentScene.content).length > 20) {
      previousTextSnippet = cleanHtml(currentScene.content).slice(-1000);
    } else if (prevScene) {
      previousTextSnippet = cleanHtml(prevScene.content).slice(-1000);
    }

    // Resolve AI Profile
    let aiProfile = null;
    if (profileId) {
      aiProfile = await prisma.aiProfile.findUnique({ where: { id: profileId } });
    }

    // CALL THE PROMPT FACTORY (SSOT)
    return buildMasterPrompt({
      book,
      chapter: currentScene.chapter,
      scene: currentScene,
      aiProfile,
      taskType,
      selectedText,
      inlineInstruction: instruction,
      previousTextSnippet,
      previousSceneGoal: prevScene?.promptGoals
    });

  } catch (error) {
    console.error('Error generating prompt data:', error);
    throw new Error('Failed to assemble prompt');
  }
}

// --- AI PROFILE ACTIONS ---

export async function getAiProfiles() {
  try {
    return await prisma.aiProfile.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error('Failed to fetch AI profiles:', error);
    return [];
  }
}

export async function seedAiProfiles() {
  try {
    const count = await prisma.aiProfile.count();
    if (count > 0) return { success: true, message: 'Already seeded' };

    const defaults = [
      {
        name: "The Dark Epic Poet",
        description: "Visceral language focused on weight and shadows.",
        systemPrompt: "You are a master of dark epic fantasy. Use visceral, material language. Focus on weight, pain, shadows, and physical sensations. Show, don't tell. Do not use conversational filler.",
        isDefault: true
      },
      {
        name: "The Action Director",
        description: "Short, punchy sentences focusing on kinetic energy.",
        systemPrompt: "You are an action-oriented writer. Use short, punchy sentences. Focus on kinetic energy, tactical movements, and brutal efficiency. Avoid flowery adjectives.",
        isDefault: false
      },
      {
        name: "The Lore Archivist",
        description: "Academic, encyclopedic and grandiose tone.",
        systemPrompt: "You are an academic historian of a high fantasy world. Write in a detached, encyclopedic, and grandiose tone.",
        isDefault: false
      }
    ];

    for (const p of defaults) {
      await prisma.aiProfile.create({ data: p });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to seed AI profiles:', error);
    return { success: false, error: String(error) };
  }
}

// --- PREVIEW ACTION ---
export async function getPromptPreview(sceneId: string, profileId?: string) {
  // Fetch the scene to get the bookId
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    select: { chapter: { select: { bookId: true } } }
  });
  if (!scene) throw new Error('Scene not found');
  
  return generatePromptData(scene.chapter.bookId, sceneId, profileId, 'DRAFT');
}

export async function createAiProfile(data: { name: string, description?: string, systemPrompt: string, isDefault?: boolean }): Promise<ActionResponse> {
  try {
    const profile = await prisma.aiProfile.create({ data });
    revalidatePath('/settings/profiles');
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Failed to create AI profile' };
  }
}

export async function updateAiProfile(id: string, data: Partial<{ name: string, description: string, systemPrompt: string, isDefault: boolean }>): Promise<ActionResponse> {
  try {
    if (data.isDefault) {
      await prisma.aiProfile.updateMany({ where: { NOT: { id } }, data: { isDefault: false } });
    }
    const profile = await prisma.aiProfile.update({ where: { id }, data });
    revalidatePath('/settings/profiles');
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Failed to update AI profile' };
  }
}

export async function deleteAiProfile(id: string): Promise<ActionResponse> {
  try {
    await prisma.aiProfile.delete({ where: { id } });
    revalidatePath('/settings/profiles');
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'Failed to delete AI profile' };
  }
}
