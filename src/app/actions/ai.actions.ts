'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { buildMasterPrompt } from '@/lib/prompt-builder';
import { ActionResponse } from '@/lib/types';
import { AiProfile, PromptTemplate, AppSettings, AIProvider } from '@prisma/client';

// --- UTILITY FUNCTIONS ---
function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<\/p>/g, '\n\n') // Preserve paragraph breaks
    .replace(/<br\s*\/?>/g, '\n') // Preserve line breaks
    .replace(/<[^>]*>?/gm, ' ') // Strip other tags
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces
    .trim();
}

// --- GENERATE PROMPT DATA ---
export async function generatePromptData(
  bookId: string, 
  currentSceneId: string, 
  profileId?: string, 
  promptTemplateId?: string,
  taskType: 'DRAFT' | 'REWRITE' = 'DRAFT', 
  selectedText?: string, 
  instruction?: string
): Promise<{ system: string; prompt: string }> {
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

    // Get all scenes in order across all chapters
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
    bookWithOrderedContent?.chapters.forEach(ch => {
      ch.scenes.forEach(s => {
        allScenes.push({ id: s.id, title: s.title, chapter: ch.title, promptGoals: s.promptGoals });
      });
    });
    
    const currentIndex = allScenes.findIndex(s => s.id === currentSceneId);
    
    const prevSceneSummary = currentIndex > 0 ? allScenes[currentIndex - 1] : null;
    let prevScene = null;
    if (prevSceneSummary) {
      prevScene = await prisma.scene.findUnique({ where: { id: prevSceneSummary.id } });
    }

    const currentContentClean = cleanHtml(currentScene.content);
    const prevContentClean = prevScene ? cleanHtml(prevScene.content) : "";

    let previousTextSnippet = "";

    if (prevScene) {
      previousTextSnippet += `### CONTEXT FROM PREVIOUS SCENE ("${prevScene.title}"):\n`;
      previousTextSnippet += `[SCENE GOAL]: ${prevScene.promptGoals || 'N/A'}\n`;
      previousTextSnippet += `[LAST 150 WORDS]:\n...${prevContentClean.slice(-1200)}\n\n`;
    }

    if (currentContentClean.length > 10) {
      previousTextSnippet += `### CURRENT SCENE PROGRESS ("${currentScene.title}"):\n`;
      previousTextSnippet += `${currentContentClean}\n`;
    } else if (!prevScene) {
      previousTextSnippet = "START OF MANUSCRIPT: This is the very first scene of the book. No previous context available.";
    } else {
      previousTextSnippet += `### CURRENT SCENE STATUS:\n[The author has not written any prose for this scene yet. Continue from the previous scene context.]`;
    }

    // CALL THE PROMPT FACTORY (SSOT)
    return await buildMasterPrompt({
      book,
      chapter: currentScene.chapter,
      scene: currentScene,
      aiProfileId: profileId,
      promptTemplateId,
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
export async function getPromptPreview(sceneId: string, profileId?: string, promptTemplateId?: string): Promise<string> {
  // Fetch the scene to get the bookId
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    select: { chapter: { select: { bookId: true } } }
  });
  if (!scene) throw new Error('Scene not found');
  
  const { system, prompt } = await generatePromptData(scene.chapter.bookId, sceneId, profileId, promptTemplateId, 'DRAFT');
  return `[SYSTEM INSTRUCTION]\n${system}\n\n[USER PROMPT]\n${prompt}`;
}

export async function createAiProfile(data: { name: string, description?: string, systemPrompt: string, isDefault?: boolean }): Promise<ActionResponse<AiProfile>> {
  try {
    const profile = await prisma.aiProfile.create({ data });
    revalidatePath('/settings/profiles');
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Failed to create AI profile' };
  }
}

export async function updateAiProfile(id: string, data: Partial<{ name: string, description: string, systemPrompt: string, isDefault: boolean }>): Promise<ActionResponse<AiProfile>> {
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

export async function deleteAiProfile(id: string): Promise<ActionResponse<null>> {
  try {
    await prisma.aiProfile.delete({ where: { id } });
    revalidatePath('/settings/profiles');
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'Failed to delete AI profile' };
  }
}

// --- PROMPT TEMPLATE ACTIONS ---

export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  try {
    return await prisma.promptTemplate.findMany({ orderBy: { name: 'asc' } });
  } catch (error) {
    console.error('Failed to fetch prompt templates:', error);
    return [];
  }
}

export async function createPromptTemplate(data: any): Promise<ActionResponse<PromptTemplate>> {
  try {
    const template = await prisma.promptTemplate.create({ data });
    revalidatePath('/settings/prompts');
    return { success: true, data: template };
  } catch (error) {
    return { success: false, error: 'Failed to create template' };
  }
}

export async function updatePromptTemplate(id: string, data: any): Promise<ActionResponse<PromptTemplate>> {
  try {
    // Only pick relevant fields to avoid clobbering relations or internal fields
    const { name, description, phase, systemInstruction, contextTemplate, taskDirective, isDefault } = data;
    
    const updateData: any = {
      name,
      description,
      phase,
      systemInstruction,
      contextTemplate,
      taskDirective,
      isDefault
    };

    if (isDefault) {
      await prisma.promptTemplate.updateMany({ where: { NOT: { id } }, data: { isDefault: false } });
    }
    const template = await prisma.promptTemplate.update({ where: { id }, data: updateData });
    revalidatePath('/settings/prompts');
    return { success: true, data: template };
  } catch (error) {
    console.error("Update Template Error:", error);
    return { success: false, error: 'Failed to update template' };
  }
}

export async function clonePromptTemplate(id: string): Promise<ActionResponse<PromptTemplate>> {
  try {
    const source = await prisma.promptTemplate.findUnique({ where: { id } });
    if (!source) return { success: false, error: "Source template not found" };

    const clone = await prisma.promptTemplate.create({
      data: {
        name: `${source.name} (Copy)`,
        description: source.description,
        phase: source.phase,
        systemInstruction: source.systemInstruction,
        contextTemplate: source.contextTemplate,
        taskDirective: source.taskDirective,
        isDefault: false,
      }
    });

    revalidatePath('/settings/prompts');
    return { success: true, data: clone };
  } catch (error) {
    console.error('Clone failed:', error);
    return { success: false, error: "Failed to clone template" };
  }
}

export async function deletePromptTemplate(id: string): Promise<ActionResponse<null>> {
  try {
    const template = await prisma.promptTemplate.findUnique({ where: { id } });
    if (!template) return { success: false, error: "Template not found" };
    if (template.isDefault) return { success: false, error: "Cannot delete the system default template" };

    await prisma.promptTemplate.delete({ where: { id } });
    revalidatePath('/settings/prompts');
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'Failed to delete template' };
  }
}

// --- APP SETTINGS ACTIONS ---

export async function getAppSettings(): Promise<AppSettings> {
  try {
    let settings = await prisma.appSettings.findUnique({
      where: { id: 'global' }
    });
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: { id: 'global' }
      });
    }
    return settings;
  } catch (error) {
    console.error('Failed to fetch app settings:', error);
    return {
      id: 'global',
      activeProvider: 'GOOGLE' as AIProvider,
      activeModelName: 'gemini-2.5-flash',
      updatedAt: new Date()
    };
  }
}

export async function updateAppSettings(data: Partial<{ activeProvider: AIProvider, activeModelName: string }>): Promise<ActionResponse<AppSettings>> {
  try {
    const settings = await prisma.appSettings.upsert({
      where: { id: 'global' },
      update: data,
      create: { id: 'global', ...data }
    });
    revalidatePath('/settings/ai-models');
    return { success: true, data: settings };
  } catch (error) {
    console.error('Failed to update app settings:', error);
    return { success: false, error: 'Failed to update AI configuration' };
  }
}
