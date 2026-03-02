'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- UTILITY FUNCTIONS ---
function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLast400Chars(text: string): string {
  const cleaned = cleanHtml(text);
  if (cleaned.length <= 400) return cleaned;
  return "..." + cleaned.slice(-400);
}

// --- GENERATE PROMPT DATA ---
export async function generatePromptData(bookId: string, currentSceneId: string) {
  try {
    const currentScene = await prisma.scene.findUnique({
      where: { id: currentSceneId },
      include: { 
        chapter: true, 
        characters: {
          select: { name: true, role: true }
        } 
      }
    });
    if (!currentScene) throw new Error('Scene not found');

    const book = await prisma.book.findUnique({ 
      where: { id: bookId },
      include: { genreConfig: true }
    });
    if (!book) throw new Error('Book not found');

    // Get all scenes in order to find the previous one
    const bookWithOrderedContent = await prisma.book.findUnique({
      where: { id: bookId },
      include: { 
        chapters: { 
          orderBy: { orderIndex: 'asc' }, 
          include: { 
            scenes: { 
              orderBy: { orderIndex: 'asc' } 
            } 
          } 
        } 
      }
    });
    
    const allScenes: any[] = [];
    bookWithOrderedContent?.chapters.forEach(ch => ch.scenes.forEach(s => allScenes.push(s)));
    const currentIndex = allScenes.findIndex(s => s.id === currentSceneId);
    
    const prevScene = currentIndex > 0 ? allScenes[currentIndex - 1] : null;

    // Logic for [PREVIOUS TEXT]
    let previousTextSnippet = "";
    if (cleanHtml(currentScene.content).length > 20) {
      previousTextSnippet = getLast400Chars(currentScene.content);
    } else if (prevScene) {
      previousTextSnippet = getLast400Chars(prevScene.content);
    }

    const genreRulesText = book.genreConfig?.customPromptRules || "";
    const castList = currentScene.characters
      .map(c => `- ${c.name}${c.role ? ` (${c.role})` : ''}`)
      .join('\n');

    const prompt = `[SYSTEM/STYLE]
You are an expert novelist writing a ${book.genre || 'fiction'} novel in a ${book.tone || 'Professional'} tone.
${genreRulesText}

[STORY CONTEXT]
Macro-Arc: ${book.synopsis || 'No synopsis provided.'}
Current Chapter Focus: ${currentScene.chapter.chapterGoal || 'No specific chapter goal set.'}
Active Cast in this scene:
${castList || 'No specific characters assigned to this scene.'}

[PREVIOUS SCENE SUMMARY]
${prevScene?.promptGoals || ''}

[PREVIOUS TEXT]
Continue the story seamlessly from these exact last lines:
"${previousTextSnippet || 'Beginning of the scene.'}"

[IMMEDIATE ACTION (YOUR TASK)]
${currentScene.promptGoals || 'Write the next part of the story.'}

[RULES]
Maintain a heavy, tangible, and grave tone.
NO recaps of the past. Move the scene forward immediately.
Length: Generate approximately 800-1000 words.
Stop EXACTLY when the new obstacle or goal described in the IMMEDIATE ACTION is met. Do not resolve it unless instructed.`;

    return prompt;
  } catch (error) {
    console.error('Error generating prompt data:', error);
    throw new Error('Failed to assemble prompt');
  }
}

// --- MANUSCRIPT EXPORT ENGINE ---
export async function compileManuscript(bookId: string) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: { orderBy: { orderIndex: 'asc' }, include: { scenes: { orderBy: { orderIndex: 'asc' } } } } }
    });
    if (!book) return { success: false, error: 'Book not found' };
    
    let markdown = `# ${book.title}\n\n`;
    if (book.synopsis) markdown += `> ${book.synopsis}\n\n`;
    markdown += `* * *\n\n`;

    for (const chapter of book.chapters) {
      markdown += `## ${chapter.title}\n\n`;
      for (let i = 0; i < chapter.scenes.length; i++) {
        const scene = chapter.scenes[i];
        let content = (scene.content || "")
          .replace(/<p>/g, "").replace(/<\/p>/g, "\n\n")
          .replace(/<strong>/g, "**").replace(/<\/strong>/g, "**")
          .replace(/<em>/g, "_").replace(/<\/em>/g, "_")
          .replace(/<h1>/g, "# ").replace(/<\/h1>/g, "\n\n")
          .replace(/<h2>/g, "## ").replace(/<\/h2>/g, "\n\n")
          .replace(/<li>/g, "- ").replace(/<\/li>/g, "\n")
          .replace(/<br\s*\/?>/g, "\n")
          .replace(/&nbsp;/g, " ")
          .replace(/<[^>]*>/g, "");
        markdown += content.trim() + "\n\n";
        if (i < chapter.scenes.length - 1) markdown += `\n* * *\n\n`;
      }
      markdown += `\n`;
    }
    return { success: true, markdown };
  } catch (error) {
    return { success: false, error: 'Failed to compile manuscript' };
  }
}

// --- BOOK ACTIONS ---
export async function getBooks() {
  try {
    return await prisma.book.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { chapters: { include: { scenes: true } } },
    });
  } catch (error) { return []; }
}

export async function getBookById(id: string) {
  return await prisma.book.findUnique({
    where: { id },
    include: {
      genreConfig: true,
      charactersList: true,
      chapters: {
        orderBy: { orderIndex: 'asc' },
        include: { 
          scenes: { 
            orderBy: { orderIndex: 'asc' }, 
            include: { characters: true } 
          } 
        },
      },
    },
  });
}

export async function createBook(data: { title: string; genre?: string; status?: string; tone?: string }) {
  const book = await prisma.book.create({
    data: {
      title: data.title,
      genre: data.genre || '',
      status: data.status || 'Planning',
      tone: data.tone || 'Professional',
    },
  });
  revalidatePath('/');
  return book;
}

export async function updateBookBible(id: string, data: any) {
  const book = await prisma.book.update({ where: { id }, data });
  revalidatePath(`/book/${id}`);
  revalidatePath('/');
  return book;
}

export async function deleteBook(id: string) {
  await prisma.book.delete({ where: { id } });
  revalidatePath('/');
}

// --- CHAPTER ACTIONS ---
export async function createChapter(bookId: string, title: string) {
  const lastChapter = await prisma.chapter.findFirst({
    where: { bookId },
    orderBy: { chapterNumber: 'desc' },
  });
  const nextNumber = (lastChapter?.chapterNumber ?? 0) + 1;
  const chapter = await prisma.chapter.create({
    data: { title, bookId, orderIndex: nextNumber, chapterNumber: nextNumber },
  });
  revalidatePath(`/book/${bookId}`);
  revalidatePath('/');
  return chapter;
}

export async function updateChapter(id: string, data: { title?: string; orderIndex?: number; chapterNumber?: number; chapterGoal?: string }) {
  const chapter = await prisma.chapter.update({ where: { id }, data });
  revalidatePath(`/book/${chapter.bookId}`);
  revalidatePath('/');
  return chapter;
}

export async function deleteChapter(id: string) {
  const chapter = await prisma.chapter.findUnique({ where: { id } });
  if (!chapter) return;
  const { bookId, orderIndex } = chapter;
  await prisma.$transaction([
    prisma.chapter.delete({ where: { id } }),
    prisma.chapter.updateMany({
      where: { bookId, orderIndex: { gt: orderIndex } },
      data: { orderIndex: { decrement: 1 }, chapterNumber: { decrement: 1 } }
    })
  ]);
  revalidatePath(`/book/${bookId}`);
  revalidatePath('/');
}

export async function reorderChapters(bookId: string, updates: { id: string, orderIndex: number }[]) {
  await prisma.$transaction(
    updates.map(u => prisma.chapter.update({
      where: { id: u.id },
      data: { orderIndex: u.orderIndex, chapterNumber: u.orderIndex }
    }))
  );
  revalidatePath(`/book/${bookId}`);
}

export async function updateChapterGoal(id: string, chapterGoal: string) {
  const chapter = await prisma.chapter.update({ where: { id }, data: { chapterGoal } });
  revalidatePath(`/book/${chapter.bookId}`);
}

// --- SCENE ACTIONS ---
export async function createScene(chapterId: string, title: string) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) return;
  const lastScene = await prisma.scene.findFirst({
    where: { chapterId },
    orderBy: { sceneNumber: 'desc' },
  });
  const nextNumber = (lastScene?.sceneNumber ?? 0) + 1;
  const scene = await prisma.scene.create({
    data: { title, chapterId, orderIndex: nextNumber, sceneNumber: nextNumber },
  });
  revalidatePath(`/book/${chapter.bookId}`);
  revalidatePath('/');
  return scene;
}

export async function getSceneById(id: string) {
  return await prisma.scene.findUnique({ where: { id } });
}

export async function updateScene(id: string, data: { title?: string; orderIndex?: number; sceneNumber?: number; content?: string; promptGoals?: string }) {
  const scene = await prisma.scene.update({ where: { id }, data, include: { chapter: true } });
  revalidatePath(`/book/${scene.chapter.bookId}`);
  revalidatePath('/');
  return scene;
}

export async function updateSceneContent(id: string, content: string) {
  const scene = await prisma.scene.update({ where: { id }, data: { content }, include: { chapter: true } });
  revalidatePath(`/book/${scene.chapter.bookId}`);
  return scene;
}

export async function updateScenePromptGoals(id: string, promptGoals: string) {
  const scene = await prisma.scene.update({ where: { id }, data: { promptGoals }, include: { chapter: true } });
  revalidatePath(`/book/${scene.chapter.bookId}`);
  return scene;
}

export async function deleteScene(id: string) {
  const scene = await prisma.scene.findUnique({ where: { id }, include: { chapter: true } });
  if (!scene) return;
  const { chapterId, orderIndex } = scene;
  const bookId = scene.chapter.bookId;
  await prisma.$transaction([
    prisma.scene.delete({ where: { id } }),
    prisma.scene.updateMany({
      where: { chapterId, orderIndex: { gt: orderIndex } },
      data: { orderIndex: { decrement: 1 }, sceneNumber: { decrement: 1 } }
    })
  ]);
  revalidatePath(`/book/${bookId}`);
  revalidatePath('/');
}

export async function reorderScenes(chapterId: string, updates: { id: string, orderIndex: number }[]) {
  await prisma.$transaction(
    updates.map(u => prisma.scene.update({
      where: { id: u.id },
      data: { orderIndex: u.orderIndex, sceneNumber: u.orderIndex }
    }))
  );
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (chapter) revalidatePath(`/book/${chapter.bookId}`);
}

// --- CHARACTER ACTIONS ---
export async function createCharacter(bookId: string, data: { name: string; role?: string; description?: string }) {
  await prisma.character.create({ data: { bookId, ...data } });
  revalidatePath(`/book/${bookId}`);
}

export async function updateCharacter(id: string, data: { name?: string; role?: string; description?: string }) {
  const char = await prisma.character.update({ where: { id }, data });
  revalidatePath(`/book/${char.bookId}`);
}

export async function deleteCharacter(id: string) {
  const char = await prisma.character.delete({ where: { id } });
  revalidatePath(`/book/${char.bookId}`);
}

export async function toggleCharacterInScene(sceneId: string, characterId: string) {
  const scene = await prisma.scene.findUnique({ where: { id: sceneId }, include: { characters: true, chapter: true } });
  if (!scene) return;
  const isPresent = scene.characters.some(c => c.id === characterId);
  await prisma.scene.update({
    where: { id: sceneId },
    data: { characters: isPresent ? { disconnect: { id: characterId } } : { connect: { id: characterId } } }
  });
  revalidatePath(`/book/${scene.chapter.bookId}`);
}

// --- GENRE ACTIONS ---
export async function getGenreConfigs() {
  return await prisma.genreConfig.findMany({ orderBy: { genreName: 'asc' } });
}

export async function upsertGenreConfig(genreName: string, customPromptRules: string) {
  const config = await prisma.genreConfig.upsert({
    where: { genreName },
    update: { customPromptRules },
    create: { genreName, customPromptRules },
  });
  revalidatePath('/settings');
  return config;
}

export async function deleteGenreConfig(id: string) {
  await prisma.genreConfig.delete({ where: { id } });
  revalidatePath('/settings');
}
