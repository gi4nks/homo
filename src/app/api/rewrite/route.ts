import { generateText } from 'ai';
import { generatePromptData, getAppSettings } from '@/app/actions/ai.actions';
import { getAIModel } from '@/lib/ai-factory';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { 
      selectedText, 
      instruction, 
      bookId, 
      sceneId, 
      profileId, 
      promptTemplateId 
    } = await req.json();

    if (!selectedText || !instruction || !bookId || !sceneId) {
      return new Response('Missing required data', { status: 400 });
    }

    // Leverage SSOT Prompt Factory for Context-Aware Rewrite
    const { system, prompt } = await generatePromptData(
      bookId, 
      sceneId, 
      profileId, 
      promptTemplateId, 
      'REWRITE', 
      selectedText, 
      instruction
    );

    const settings = await getAppSettings();
    const model = getAIModel(settings.activeProvider, settings.activeModelName);

    const { text } = await generateText({
      model,
      system,
      prompt,
    });

    return new Response(JSON.stringify({ rewrittenText: text.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Rewrite Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
