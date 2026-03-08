import { streamText } from 'ai';
import { generatePromptData, getAppSettings } from '@/app/actions/ai.actions';
import { getAIModel } from '@/lib/ai-factory';
import prisma from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limiter';
import { log } from '@/lib/logger';

export const maxDuration = 60;

// Simple in-memory cache for Gemini Cache IDs (for demo/local use)
const geminiCacheRegistry: Record<string, { cacheName: string, expiresAt: number }> = {};

export async function POST(req: Request) {
  // Rate limiting (configurable via AppSettings, defaults to 20/min)
  const rateLimitResult = await withRateLimit(req, 'AI_GENERATE');
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  const startTime = Date.now();
  let sceneId: string | undefined;
  let bookId: string | undefined;

  try {
    const reqBody = await req.json();
    sceneId = reqBody.prompt || reqBody.sceneId;
    const preBuiltPrompt = reqBody.preBuiltPrompt;

    if (!sceneId) return new Response('Missing sceneId', { status: 400 });

    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { chapter: true }
    });

    if (!scene) return new Response('Scene not found', { status: 404 });

    bookId = scene.chapter.bookId;

    log.info({ sceneId, bookId, event: 'ai_generation_start' }, 'AI generation started');

    // Use pre-built prompt from client (eliminates redundant rebuild)
    // Falls back to server-side rebuild for backward compatibility
    let system: string, prompt: string, staticContext: string, dynamicContext: string;

    if (preBuiltPrompt) {
      ({ system, prompt, staticContext, dynamicContext } = preBuiltPrompt);
    } else {
      const profileId = reqBody.profileId;
      const promptTemplateId = reqBody.promptTemplateId;
      const instruction = reqBody.instruction;
      const taskType = reqBody.taskType || 'DRAFT';
      const originalVersion = reqBody.originalVersion;
      const revisedVersion = reqBody.revisedVersion;
      const liveContent = reqBody.liveContent;
      const selectedText = reqBody.selectedText;

      ({ system, prompt, staticContext, dynamicContext } = await generatePromptData(
        bookId,
        sceneId,
        profileId,
        promptTemplateId,
        taskType,
        selectedText,
        instruction,
        originalVersion,
        revisedVersion,
        liveContent
      ));
    }

    const settings = await getAppSettings();
    const provider = settings.activeProvider;
    const modelName = settings.activeModelName;

    // Helper to update hit status in DB and log
    const updateCacheHitStatus = async (isHit: boolean) => {
      await prisma.book.update({
        where: { id: bookId },
        data: { lastAiCacheHit: isHit }
      });

      const duration = Date.now() - startTime;
      log.aiGeneration({
        sceneId: sceneId!,
        bookId: bookId!,
        provider,
        model: modelName,
        taskType: preBuiltPrompt ? 'DRAFT' : 'FALLBACK',
        duration,
        cacheHit: isHit
      });
    };

    // --- ANTHROPIC EPHEMERAL CACHING ---
    if (provider === 'ANTHROPIC') {
      const result = streamText({
        model: getAIModel('ANTHROPIC', modelName),
        system: staticContext,
        prompt: dynamicContext,
        experimental_providerMetadata: {
          anthropic: { cacheControl: { type: 'ephemeral' } }
        },
        headers: {
          'anthropic-beta': 'prompt-caching-2024-07-31'
        },
        onFinish: async (event: any) => {
          // Anthropic cache hit detection
          const cacheRead = event.usage?.cacheReadInputTokens || 0;
          await updateCacheHitStatus(cacheRead > 0);
        }
      } as any);
      return result.toTextStreamResponse();
    }

    // --- GOOGLE GEMINI CONTEXT CACHING ---
    if (provider === 'GOOGLE') {
      const estimatedTokens = staticContext.length / 4;
      if (estimatedTokens >= 32768) {
        const cached = geminiCacheRegistry[bookId];
        const now = Date.now();
        
        if (cached && cached.expiresAt > now) {
          // Hit! (Mocked)
          const result = streamText({
            model: getAIModel('GOOGLE', modelName),
            system,
            prompt,
            onFinish: async () => {
              await updateCacheHitStatus(true);
            }
          });
          return result.toTextStreamResponse();
        } else {
          // Miss.
          geminiCacheRegistry[bookId] = {
            cacheName: `cachedContents/${bookId}-${now}`,
            expiresAt: now + (60 * 60 * 1000)
          };
          const result = streamText({
            model: getAIModel('GOOGLE', modelName),
            system,
            prompt,
            onFinish: async () => {
              await updateCacheHitStatus(false);
            }
          });
          return result.toTextStreamResponse();
        }
      }
    }

    // DEFAULT FALLBACK
    const model = getAIModel(provider as any, modelName);
    const result = streamText({
      model,
      system,
      prompt,
      onFinish: async () => {
        await updateCacheHitStatus(false);
      }
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    log.error(
      {
        sceneId,
        bookId,
        event: 'ai_generation_error',
        duration: Date.now() - startTime
      },
      'AI generation failed',
      error
    );
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
