'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CreateBookSchema, UpdateBookBibleSchema, IdSchema } from '@/lib/validations';
import { ActionResponse } from './scene.actions';

export async function getBooks(): Promise<ActionResponse> {
  try {
    const books = await prisma.book.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { chapters: { include: { scenes: true } } },
    });
    return { success: true, data: books };
  } catch (error) {
    return { success: false, error: "Failed to fetch books" };
  }
}

export async function getBookById(id: string): Promise<ActionResponse> {
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
          include: { 
            scenes: { 
              orderBy: { orderIndex: 'asc' }, 
              include: { characters: true } 
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

export async function createBook(input: any): Promise<ActionResponse> {
  const validated = CreateBookSchema.safeParse(input);
  if (!validated.success) return { success: false, error: "Validation failed", validationErrors: validated.error.format() };

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

export async function updateBookBible(id: string, data: any): Promise<ActionResponse> {
  const validated = UpdateBookBibleSchema.safeParse({ id, ...data });
  if (!validated.success) return { success: false, error: "Invalid data", validationErrors: validated.error.format() };

  try {
    const { id: bookId, ...payload } = validated.data;
    const book = await prisma.book.update({
      where: { id: bookId },
      data: payload,
    });
    revalidatePath(`/book/${bookId}`);
    revalidatePath('/');
    return { success: true, data: book };
  } catch (error) {
    console.error('Failed to update book bible:', error);
    return { success: false, error: 'Could not update story bible' };
  }
}

export async function deleteBook(id: string): Promise<ActionResponse> {
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

// --- MANUSCRIPT EXPORT ENGINE ---
export async function compileManuscript(bookId: string): Promise<ActionResponse<string>> {
  const validated = IdSchema.safeParse(bookId);
  if (!validated.success) return { success: false, error: "Invalid Book ID" };

  try {
    const book = await prisma.book.findUnique({
      where: { id: validated.data },
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

    if (!book) return { success: false, error: 'Book not found' };

    let markdown = `# ${book.title}\n\n`;
    if (book.synopsis) markdown += `> ${book.synopsis}\n\n`;
    markdown += `* * *\n\n`;

    for (const chapter of book.chapters) {
      markdown += `## ${chapter.title}\n\n`;
      
      for (let i = 0; i < chapter.scenes.length; i++) {
        const scene = chapter.scenes[i];
        let content = scene.content || "";
        content = content
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

    return { success: true, data: markdown };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: 'Failed to compile manuscript' };
  }
}
