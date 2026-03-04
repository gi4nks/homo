import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { generatePromptData } from '@/app/actions/ai.actions';
import prisma from '@/lib/prisma';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const sceneId = reqBody.prompt || reqBody.sceneId;
    const profileId = reqBody.profileId;

    if (!sceneId) return new Response('Missing sceneId', { status: 400 });

    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { chapter: true }
    });

    if (!scene) return new Response('Scene not found', { status: 404 });

    // Leverage SSOT Prompt Factory via AI Actions
    const finalPrompt = await generatePromptData(scene.chapter.bookId, sceneId, profileId, 'DRAFT');

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: finalPrompt,
      providerOptions: {
        google: {
          thinkingConfig: { thinkingBudget: 1024 },
        },
      },
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('Critical AI Generation Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
