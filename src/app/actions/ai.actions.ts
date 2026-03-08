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

// --- OPTIMIZED: Find previous scene without loading full book hierarchy ---
// Only uses 1-2 targeted queries instead of fetching all chapters + all scenes
async function findPreviousScene(currentScene: { id: string; chapterId: string; orderIndex: number; chapter: { bookId: string; orderIndex: number } }) {
  // 1. Try to find previous scene in the same chapter (orderIndex - 1)
  const prevInChapter = await prisma.scene.findFirst({
    where: {
      chapterId: currentScene.chapterId,
      orderIndex: { lt: currentScene.orderIndex }
    },
    orderBy: { orderIndex: 'desc' },
    select: { id: true, title: true, content: true, promptGoals: true }
  });

  if (prevInChapter) return prevInChapter;

  // 2. If this is the first scene in the chapter, find the last scene of the previous chapter
  const prevChapter = await prisma.chapter.findFirst({
    where: {
      bookId: currentScene.chapter.bookId,
      orderIndex: { lt: currentScene.chapter.orderIndex }
    },
    orderBy: { orderIndex: 'desc' },
    select: {
      scenes: {
        orderBy: { orderIndex: 'desc' },
        take: 1,
        select: { id: true, title: true, content: true, promptGoals: true }
      }
    }
  });

  return prevChapter?.scenes[0] || null;
}

// --- GENERATE PROMPT DATA ---
export async function generatePromptData(
  bookId: string,
  currentSceneId?: string | null,
  profileId?: string,
  promptTemplateId?: string,
  taskType: 'DRAFT' | 'REWRITE' | 'ANALYZE' = 'DRAFT',
  selectedText?: string,
  instruction?: string,
  originalVersion?: string,
  revisedVersion?: string,
  liveContent?: string
): Promise<{
  system: string;
  prompt: string;
  staticContext: string;
  dynamicContext: string;
  tokenEstimate?: {
    total: number;
    static: number;
    dynamic: number;
    limit: number;
    usagePercentage: number;
    wasTruncated: boolean;
    warning: string | null;
  };
}> {
  try {
    const book = await prisma.book.findUnique({ 
      where: { id: bookId },
      include: { genreConfig: true }
    });
    if (!book) throw new Error('Book not found');

    let currentScene = null;
    if (currentSceneId && !currentSceneId.startsWith("DUMMY_")) {
      currentScene = await prisma.scene.findUnique({
        where: { id: currentSceneId },
        include: { chapter: true, characters: true }
      });
    }

    // Default mock structures if scene is missing (book-level context)
    const chapter = currentScene?.chapter || { bookId, chapterGoal: 'N/A' };
    const scene = currentScene || { id: currentSceneId || 'global', title: 'Global Context', narrativePosition: 'MIDPOINT', promptGoals: 'N/A', characters: [] };

    let previousTextSnippet = "";
    let previousSceneGoal = "N/A";

    if (currentScene) {
      // OPTIMIZED: Find previous scene without loading entire book hierarchy
      // Strategy: Try same chapter first (orderIndex - 1), then last scene of previous chapter
      const prevScene = await findPreviousScene(currentScene);

      if (prevScene) {
        const prevContentClean = cleanHtml(prevScene.content);
        previousTextSnippet += `### CONTEXT FROM PREVIOUS SCENE ("${prevScene.title}"):\n`;
        previousTextSnippet += `[SCENE GOAL]: ${prevScene.promptGoals || 'N/A'}\n`;
        previousTextSnippet += `[LAST 150 WORDS]:\n...${prevContentClean.slice(-1200)}\n\n`;
        previousSceneGoal = prevScene.promptGoals || 'N/A';
      }

      const contentToUse = liveContent !== undefined ? liveContent : currentScene.content;
      const currentContentClean = cleanHtml(contentToUse);
      if (currentContentClean.length > 10) {
        previousTextSnippet += `### CURRENT SCENE PROGRESS ("${currentScene.title}"):\n${currentContentClean}\n`;
      }
    }

    if (!previousTextSnippet) {
      previousTextSnippet = "Global Book Context. No specific scene progress available.";
    }

    // VARIABLE: {{sceneText}} - Selection or full cleaned text
    const sceneText = selectedText || (currentScene ? cleanHtml(liveContent || currentScene.content) : "");

    // CALL THE PROMPT FACTORY (SSOT)
    return await buildMasterPrompt({
      book,
      chapter,
      scene,
      aiProfileId: profileId,
      promptTemplateId,
      taskType,
      selectedText,
      inlineInstruction: instruction,
      previousTextSnippet,
      previousSceneGoal,
      originalVersion,
      revisedVersion,
      sceneText
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
    const { name, description, phase, systemInstruction, contextTemplate, taskDirective, isDefault } = data;
    const updateData: any = { name, description, phase, systemInstruction, contextTemplate, taskDirective, isDefault };
    if (isDefault) await prisma.promptTemplate.updateMany({ where: { NOT: { id } }, data: { isDefault: false } });
    const template = await prisma.promptTemplate.update({ where: { id }, data: updateData });
    revalidatePath('/settings/prompts');
    return { success: true, data: template };
  } catch (error) {
    return { success: false, error: 'Failed to update template' };
  }
}

export async function clonePromptTemplate(id: string): Promise<ActionResponse<PromptTemplate>> {
  try {
    const source = await prisma.promptTemplate.findUnique({ where: { id } });
    if (!source) return { success: false, error: "Source template not found" };
    const clone = await prisma.promptTemplate.create({
      data: { name: `${source.name} (Copy)`, description: source.description, phase: source.phase, systemInstruction: source.systemInstruction, contextTemplate: source.contextTemplate, taskDirective: source.taskDirective, isDefault: false }
    });
    revalidatePath('/settings/prompts');
    return { success: true, data: clone };
  } catch (error) {
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

export async function getAppSettings(): Promise<AppSettings & { inspectorBindingsParsed?: any }> {
  try {
    let settings = await prisma.appSettings.findUnique({ where: { id: 'global' } });
    if (!settings) settings = await prisma.appSettings.create({ data: { id: 'global' } });
    return { ...settings, inspectorBindingsParsed: settings.inspectorBindings ? JSON.parse(settings.inspectorBindings) : {} };
  } catch (error) {
    return {
      id: 'global',
      activeProvider: 'GOOGLE' as AIProvider,
      activeModelName: 'gemini-2.5-flash',
      inspectorBindings: "{}",
      inspectorBindingsParsed: {},
      snapshotRetentionLimit: 50,
      rateLimitGenerate: 20,
      rateLimitRewrite: 30,
      updatedAt: new Date()
    };
  }
}

export async function updateAppSettings(data: Partial<{
  activeProvider: AIProvider,
  activeModelName: string,
  inspectorBindings: string,
  rateLimitGenerate: number,
  rateLimitRewrite: number
}>): Promise<ActionResponse<AppSettings>> {
  try {
    const settings = await prisma.appSettings.upsert({ where: { id: 'global' }, update: data, create: { id: 'global', ...data } });
    revalidatePath('/settings/ai-models');
    revalidatePath('/settings/prompts');
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: 'Failed to update AI configuration' };
  }
}
