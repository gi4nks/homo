'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { 
  CreateBookSchema, 
  UpdateBookBibleSchema, 
  IdSchema,
  CreateBookInput,
  UpdateBookBibleInput
} from '@/lib/validations';
import { Book } from '@prisma/client';
import { ActionResponse } from '@/lib/types';

export async function getBookStats(bookId: string): Promise<ActionResponse<{ totalWords: number, targetWords: number, progressPercentage: number }>> {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { targetWordCount: true }
    });

    const aggregate = await prisma.scene.aggregate({
      where: { chapter: { bookId: bookId } },
      _sum: { wordCount: true }
    });

    const totalWords = aggregate._sum.wordCount || 0;
    const targetWords = book?.targetWordCount || 80000;
    const progressPercentage = Math.min(100, (totalWords / targetWords) * 100);

    return { 
      success: true, 
      data: { 
        totalWords, 
        targetWords, 
        progressPercentage 
      } 
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch book stats" };
  }
}

export async function updateBookTarget(bookId: string, target: number): Promise<ActionResponse<Book>> {
  try {
    const book = await prisma.book.update({
      where: { id: bookId },
      data: { targetWordCount: target }
    });
    revalidatePath(`/book/${bookId}`);
    return { success: true, data: book };
  } catch (error) {
    return { success: false, error: "Failed to update book target" };
  }
}

export async function getBooks(): Promise<ActionResponse<any[]>> {
  try {
    const books = await prisma.book.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        genre: true,
        status: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            chapters: true
          }
        },
        chapters: {
          select: {
            scenes: {
              select: {
                wordCount: true
              }
            }
          }
        }
      }
    });

    // Post-process to simplify counts and sum words
    const formattedBooks = books.map(book => {
      let sceneCount = 0;
      let totalWords = 0;
      
      book.chapters.forEach(ch => {
        sceneCount += ch.scenes.length;
        ch.scenes.forEach(s => {
          totalWords += s.wordCount || 0;
        });
      });

      return {
        ...book,
        chaptersCount: book._count.chapters,
        scenesCount: sceneCount,
        totalWords
      };
    });

    return { success: true, data: formattedBooks };
  } catch (error) {
    console.error("Get Books Error:", error);
    return { success: false, error: "Failed to fetch books" };
  }
}

export async function getPromptTemplates() {
  try {
    return await prisma.promptTemplate.findMany({ orderBy: { name: 'asc' } });
  } catch (error) {
    return [];
  }
}

export async function getBookById(id: string): Promise<ActionResponse<any>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid Book ID" };

  try {
    const book = await prisma.book.findUnique({
      where: { id: validated.data },
      include: {
        genreConfig: true,
        charactersList: true,
        chapters: {
          orderBy: { orderIndex: 'asc' },
          select: { 
            id: true,
            title: true,
            orderIndex: true,
            chapterNumber: true,
            chapterGoal: true,
            scenes: { 
              orderBy: { orderIndex: 'asc' }, 
              select: { 
                id: true,
                title: true,
                orderIndex: true,
                sceneNumber: true,
                promptGoals: true,
                wordCount: true,
                defaultAiProfileId: true,
                defaultPromptTemplateId: true,
                characters: {
                  select: {
                    id: true,
                    name: true,
                    role: true
                  }
                }
              } 
            } 
          },
        },
      },
    });
    if (!book) return { success: false, error: "Book not found" };
    return { success: true, data: book };
  } catch (error) {
    return { success: false, error: "Database error fetching book" };
  }
}

export async function createBook(input: CreateBookInput): Promise<ActionResponse<Book>> {
  const validated = CreateBookSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
  }

  try {
    const book = await prisma.book.create({
      data: validated.data,
    });
    revalidatePath('/');
    return { success: true, data: book };
  } catch (error) {
    return { success: false, error: "Failed to create book" };
  }
}

export async function updateBookBible(id: string, data: Partial<UpdateBookBibleInput>): Promise<ActionResponse<Book>> {
  const validated = UpdateBookBibleSchema.safeParse({ id, ...data });
  if (!validated.success) {
    return { success: false, error: "Invalid data", fieldErrors: validated.error.flatten().fieldErrors };
  }

  try {
    const { id: bookId, ...payload } = validated.data;

    const book = await prisma.book.update({
      where: { id: bookId },
      data: payload,
    });

    revalidatePath(`/book/${bookId}`, 'layout');
    revalidatePath('/');
    return { success: true, data: book };
  } catch (error) {
    console.error('Failed to update book bible:', error);
    return { success: false, error: 'Could not update story bible' };
  }
}

export async function deleteBook(id: string): Promise<ActionResponse<{ id: string }>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid ID" };

  try {
    await prisma.book.delete({ where: { id: validated.data } });
    revalidatePath('/');
    return { success: true, data: { id: validated.data } };
  } catch (error) {
    return { success: false, error: "Failed to delete book" };
  }
}

export async function duplicateBook(id: string): Promise<ActionResponse<Book>> {
  const validated = IdSchema.safeParse(id);
  if (!validated.success) return { success: false, error: "Invalid Book ID" };

  try {
    const sourceBook = await prisma.book.findUnique({
      where: { id: validated.data },
      include: {
        charactersList: true,
        chapters: {
          include: {
            scenes: {
              include: {
                characters: true
              }
            }
          }
        }
      }
    });

    if (!sourceBook) return { success: false, error: "Source book not found" };

    // Deep Clone inside a Transaction
    const newBook = await prisma.$transaction(async (tx) => {
      // 1. Create Book
      const createdBook = await tx.book.create({
        data: {
          title: `${sourceBook.title} (Copy)`,
          synopsis: sourceBook.synopsis,
          tone: sourceBook.tone,
          genre: sourceBook.genre,
          genreId: sourceBook.genreId,
          status: "Drafting",
        }
      });

      // 2. Clone Characters and map IDs
      const charMap: Record<string, string> = {};
      for (const char of sourceBook.charactersList) {
        const newChar = await tx.character.create({
          data: {
            name: char.name,
            role: char.role,
            description: char.description,
            bookId: createdBook.id
          }
        });
        charMap[char.id] = newChar.id;
      }

      // 3. Clone Chapters & Scenes
      for (const chapter of sourceBook.chapters) {
        const newChapter = await tx.chapter.create({
          data: {
            bookId: createdBook.id,
            title: chapter.title,
            chapterNumber: chapter.chapterNumber,
            orderIndex: chapter.orderIndex,
            chapterGoal: chapter.chapterGoal,
          }
        });

        for (const scene of chapter.scenes) {
          await tx.scene.create({
            data: {
              chapterId: newChapter.id,
              title: scene.title,
              sceneNumber: scene.sceneNumber,
              orderIndex: scene.orderIndex,
              content: scene.content,
              promptGoals: scene.promptGoals,
              characters: {
                connect: scene.characters.map(c => ({ id: charMap[c.id] }))
              }
            }
          });
        }
      }

      return createdBook;
    });

    revalidatePath('/');
    return { success: true, data: newBook };
  } catch (error) {
    console.error('Duplicate book error:', error);
    return { success: false, error: "Failed to clone book" };
  }
}

// --- MANUSCRIPT EXPORT ENGINE ---
export async function compileManuscript(bookId: string, chapterId?: string, sceneId?: string): Promise<ActionResponse<string>> {
  const validatedBookId = IdSchema.safeParse(bookId);
  if (!validatedBookId.success) return { success: false, error: "Invalid Book ID" };

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          where: chapterId ? { id: chapterId } : undefined,
          orderBy: { orderIndex: 'asc' },
          include: {
            scenes: {
              where: sceneId ? { id: sceneId } : undefined,
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    if (!book) return { success: false, error: 'Book not found' };

    let markdown = "";
    
    // 1. FRONT MATTER / TITLE
    if (sceneId && book.chapters[0]?.scenes[0]) {
      markdown += `# ${book.chapters[0].scenes[0].title}\n\n`;
    } else if (chapterId && book.chapters[0]) {
      markdown += `# CHAPTER: ${book.chapters[0].title}\n\n`;
    } else {
      markdown += `# ${book.title.toUpperCase()}\n\n`;
      if (book.synopsis) markdown += `## Synopsis\n${book.synopsis}\n\n`;
      markdown += `* * *\n\n`;
    }

    // 2. COMPILATION LOOP
    for (const chapter of book.chapters) {
      // Add Chapter Title if exporting the whole book
      if (!chapterId && !sceneId) {
        markdown += `## CHAPTER ${chapter.chapterNumber}: ${chapter.title}\n\n`;
      }
      
      for (let i = 0; i < chapter.scenes.length; i++) {
        const scene = chapter.scenes[i];
        
        // Clean and Convert HTML to Markdown
        let content = scene.content || "";
        content = content
          .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
          .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
          .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
          .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
          .replace(/<em>(.*?)<\/em>/g, "_$1_")
          .replace(/<p>/g, "").replace(/<\/p>/g, "\n\n")
          .replace(/<li>(.*?)<\/li>/g, "- $1\n")
          .replace(/<ul>/g, "").replace(/<\/ul>/g, "\n")
          .replace(/<ol>/g, "").replace(/<\/ol>/g, "\n")
          .replace(/<br\s*\/?>/g, "\n")
          .replace(/&nbsp;/g, " ")
          .replace(/<[^>]*>/g, ""); // Final fallback to strip any remaining tags

        markdown += content.trim() + "\n\n";
        
        // Scene Divider (Thematic Break)
        if (i < chapter.scenes.length - 1) {
          markdown += `\n* * *\n\n`;
        }
      }
      markdown += `\n`;
    }

    return { success: true, data: markdown };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: 'Failed to compile manuscript' };
  }
}

