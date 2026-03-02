import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { generatePromptData } from '@/app/actions';
import prisma from '@/lib/prisma';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    
    // Support both 'prompt' (from useCompletion default) and 'sceneId' (custom)
    const sceneId = reqBody.prompt || reqBody.sceneId;

    console.log('--- SERVER DEBUG: AI Generation Request Received ---');
    console.log('Payload:', JSON.stringify(reqBody));
    console.log('Resolved sceneId:', sceneId);

    if (!sceneId) {
      console.error('--- SERVER DEBUG: Missing sceneId in payload ---');
      return new Response(JSON.stringify({ error: "Missing scene ID" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Resolve context
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { chapter: true }
    });

    if (!scene || !scene.chapter) {
      console.error('--- SERVER DEBUG: Scene or Chapter context not found for ID:', sceneId);
      return new Response(JSON.stringify({ error: "Scene context not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Build the directive prompt using our 7-block engine
    console.log('--- SERVER DEBUG: Assembling Prompt Data ---');
    const prompt = await generatePromptData(scene.chapter.bookId, sceneId);

    // 3. Stream with Gemini 2.5 Flash + Thinking Budget
    console.log('--- SERVER DEBUG: Initiating Gemini Stream ---');
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 1024,
          },
        },
      },
    });

    // Use toTextStreamResponse as verified in previous successful build
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('--- SERVER DEBUG: Critical AI Generation Error ---');
    console.error(error);
    
    return new Response(JSON.stringify({ 
      error: "Internal Server Error during AI generation",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
