import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { generatePromptData } from '@/app/actions/ai.actions';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { selectedText, instruction, bookId, sceneId } = await req.json();

    if (!selectedText || !instruction || !bookId || !sceneId) {
      return new Response('Missing required data', { status: 400 });
    }

    // Leverage SSOT Prompt Factory for Context-Aware Rewrite
    const finalPrompt = await generatePromptData(
      bookId, 
      sceneId, 
      undefined, // Default profile for rewrite unless specified
      'REWRITE', 
      selectedText, 
      instruction
    );

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: finalPrompt,
    });

    return new Response(JSON.stringify({ rewrittenText: text.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Rewrite Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
