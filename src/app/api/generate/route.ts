import { streamText } from 'ai';
import { generatePromptData, getAppSettings } from '@/app/actions/ai.actions';
import { getAIModel } from '@/lib/ai-factory';
import prisma from '@/lib/prisma';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const sceneId = reqBody.prompt || reqBody.sceneId;
    const profileId = reqBody.profileId;
    const promptTemplateId = reqBody.promptTemplateId;
    const instruction = reqBody.instruction;
    const taskType = reqBody.taskType || 'DRAFT';
    const originalVersion = reqBody.originalVersion;
    const revisedVersion = reqBody.revisedVersion;
    const liveContent = reqBody.liveContent;
    const selectedText = reqBody.selectedText; // CRITICAL: Accept selectedText

    if (!sceneId) return new Response('Missing sceneId', { status: 400 });

    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { chapter: true }
    });

    if (!scene) return new Response('Scene not found', { status: 404 });

    // Leverage SSOT Prompt Factory via AI Actions
    const { system, prompt } = await generatePromptData(
      scene.chapter.bookId, 
      sceneId, 
      profileId, 
      promptTemplateId, 
      taskType,
      selectedText, // CRITICAL: Pass selectedText
      instruction,
      originalVersion,
      revisedVersion,
      liveContent
    );


    const settings = await getAppSettings();
    const model = getAIModel(settings.activeProvider, settings.activeModelName);

    const result = streamText({
      model,
      system,
      prompt,
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('Critical AI Generation Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
