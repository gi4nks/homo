/**
 * HOMO PROMPT FACTORY (v2 - CMS Driven)
 * Single Source of Truth for all LLM Instructions
 */

import prisma from '@/lib/prisma';
import { compileTemplate } from './template-engine';

interface PromptParams {
  book: any;
  chapter: any;
  scene: any;
  aiProfileId?: string;
  promptTemplateId?: string;
  taskType: 'DRAFT' | 'REWRITE';
  inlineInstruction?: string;
  selectedText?: string;
  previousTextSnippet?: string;
  previousSceneGoal?: string;
}

export async function buildMasterPrompt({
  book,
  chapter,
  scene,
  aiProfileId,
  promptTemplateId,
  taskType,
  inlineInstruction,
  selectedText,
  previousTextSnippet,
  previousSceneGoal
}: PromptParams): Promise<{ system: string; prompt: string }> {
  
  // 1. FETCH TEMPLATE
  // Priority: Explicit ID -> Book specific template -> Default template
  const targetTemplateId = promptTemplateId || book.defaultPromptTemplateId;
  let template = null;
  
  if (targetTemplateId) {
    template = await prisma.promptTemplate.findUnique({ where: { id: targetTemplateId } });
  }
  
  if (!template) {
    template = await prisma.promptTemplate.findFirst({ where: { isDefault: true } });
  }

  if (!template) {
    throw new Error("No prompt template found in system.");
  }

  // 2. FETCH AI PROFILE
  // Priority: Explicit ID -> Book specific profile -> Default profile
  const targetProfileId = aiProfileId || book.defaultAiProfileId;
  let profile = null;

  if (targetProfileId) {
    profile = await prisma.aiProfile.findUnique({ where: { id: targetProfileId } });
  }

  if (!profile) {
    profile = await prisma.aiProfile.findFirst({ where: { isDefault: true } });
  }

  // 3. GENRE & TASK LOGIC
  const activeGenreName = book.genreConfig?.genreName || book.genre || 'Standard Fiction';
  const isNonFiction = /tecnico|article|essay|blog|non-fiction|tech|linkedin|educational/i.test(activeGenreName);

  const currentObjective = scene.promptGoals || 'Develop the current section.';
  
  // 4. VARIABLE MAPPING
  const templateData: Record<string, any> = {
    bookStyle: book.tone || 'Professional, literary prose.',
    styleReference: book.styleReference || 'N/A',
    authorialIntent: book.authorialIntent || 'N/A',
    loreConstraints: book.loreConstraints || 'N/A',
    narrativePosition: scene.narrativePosition || 'Metà',
    aiPersonaPrompt: profile?.systemPrompt || 'You are an expert creative writing assistant.',
    pacingConstraints: `[GENRE: ${activeGenreName}]\n${book.genreConfig?.customPromptRules || 'Maintain appropriate pacing for the selected genre.'}`,
    bookSynopsis: book.synopsis || 'N/A',
    sceneGoal: chapter.chapterGoal || 'N/A',
    sceneCast: scene.characters?.map((c: any) => `- ${c.name}: ${c.description || c.role}`).join('\n') || 'N/A',
    previousSceneGoal: previousSceneGoal || 'N/A',
    previousContent: previousTextSnippet || 'Start of section.',
    taskType: taskType === 'DRAFT' ? 'DRAFTING CONTINUATION' : 'INLINE REWRITE/EDIT',
    taskGoal: taskType === 'DRAFT' ? currentObjective : selectedText,
  };

  // 4. CONDITIONAL INSTRUCTIONS
  if (taskType === 'DRAFT') {
    if (inlineInstruction) {
      templateData.taskInstruction = inlineInstruction;
    } else {
      templateData.taskInstruction = isNonFiction 
        ? "Develop the provided key points into structured, engaging paragraphs. Ensure a clear, logical flow that fulfills the current objective."
        : "Write the next logical paragraphs for the scene, fulfilling the immediate scene beats.";
    }
    
    templateData.finalConstraint = isNonFiction
      ? "Focus on clarity, value delivery, and maintaining the author's intended message. Do not treat this as a fictional story."
      : "Focus on sensory details, show-don't-tell, and character agency.";
  } else {
    templateData.taskInstruction = `Rewrite the selected text strictly following this instruction: ${inlineInstruction}. Apply the stylistic lens of the persona while remaining compatible with the manuscript style.`;
    templateData.finalConstraint = "Return ONLY the rewritten text. No quotes, no preamble, no commentary.";
  }

  // 5. ASSEMBLY
  const system = template.systemInstruction;
  const context = compileTemplate(template.contextTemplate, templateData);
  const task = compileTemplate(template.taskDirective, templateData);

  return {
    system,
    prompt: `${context}\n\n${task}`
  };
}
