import { generateText } from 'ai';
import { generatePromptData, getAppSettings } from '@/app/actions/ai.actions';
import { getAIModel } from '@/lib/ai-factory';
import { withRateLimit } from '@/lib/rate-limiter';
import { log } from '@/lib/logger';

export const maxDuration = 30;

export async function POST(req: Request) {
  // Rate limiting (configurable via AppSettings, defaults to 30/min)
  const rateLimitResult = await withRateLimit(req, 'AI_REWRITE');
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  const startTime = Date.now();
  let sceneId: string | undefined;
  let bookId: string | undefined;

  try {
    const reqBody = await req.json();
    const {
      selectedText,
      instruction,
      profileId,
      promptTemplateId,
      liveContent // CRITICAL: Accept liveContent
    } = reqBody;

    sceneId = reqBody.sceneId;
    bookId = reqBody.bookId;

    if (!selectedText || !instruction || !bookId || !sceneId) {
      return new Response('Missing required data', { status: 400 });
    }

    log.info({ sceneId, bookId, event: 'ai_rewrite_start' }, 'AI rewrite started');

    // Leverage SSOT Prompt Factory for Context-Aware Rewrite
    const { system, prompt } = await generatePromptData(
      bookId, 
      sceneId, 
      profileId, 
      promptTemplateId, 
      'REWRITE', 
      selectedText, 
      instruction,
      undefined,
      undefined,
      liveContent
    );

    const settings = await getAppSettings();
    const model = getAIModel(settings.activeProvider as any, settings.activeModelName);

    const { text } = await generateText({
      model,
      system,
      prompt,
    });

    const duration = Date.now() - startTime;
    log.aiGeneration({
      sceneId,
      bookId,
      provider: settings.activeProvider,
      model: settings.activeModelName,
      taskType: 'REWRITE',
      duration
    });

    return new Response(JSON.stringify({ rewrittenText: text.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    log.error(
      {
        sceneId,
        bookId,
        event: 'ai_rewrite_error',
        duration: Date.now() - startTime
      },
      'AI rewrite failed',
      error
    );
    return new Response('Internal Server Error', { status: 500 });
  }
}
