import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import prisma from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { selectedText, instruction, bookId, sceneId } = await req.json();

    if (!selectedText || !instruction || !bookId || !sceneId) {
      return new Response('Missing required data', { status: 400 });
    }

    // Recuperiamo il contesto come nel prompt principale
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { genreConfig: true }
    });

    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { chapter: true }
    });

    if (!book || !scene) return new Response('Context not found', { status: 404 });

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: `You are an expert creative writing editor. 
STRICT RULE: Respond in the SAME LANGUAGE as the input text (Italian).
You have access to the full story context to ensure consistency.

[STORY CONTEXT]
<BOOK_SYNOPSIS>${book.synopsis || 'N/A'}</BOOK_SYNOPSIS>
<CHAPTER_GOAL>${scene.chapter.chapterGoal || 'N/A'}</CHAPTER_GOAL>
<GENRE_RULES>${book.genreConfig?.customPromptRules || 'N/A'}</GENRE_RULES>

[EDITOR INSTRUCTION]
Rewrite the provided fragment strictly following this directive: "${instruction}"
Maintain the narrative voice, POV, and consistency with the context above.
Return ONLY the rewritten prose. No quotes, no intro, no commentary.`,
      prompt: `TEXT TO REWRITE:\n"${selectedText}"`,
    });

    return new Response(JSON.stringify({ rewrittenText: text.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Rewrite Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
