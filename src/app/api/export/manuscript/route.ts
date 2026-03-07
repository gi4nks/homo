import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    const books = await prisma.book.findMany({
      where: bookId ? { id: bookId } : undefined,
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

    if (books.length === 0) {
      return NextResponse.json({ error: 'No books found' }, { status: 404 });
    }

    let markdown = "";

    for (const book of books) {
      markdown += `# ${book.title.toUpperCase()}\n\n`;
      if (book.synopsis) {
        markdown += `## Synopsis\n${book.synopsis}\n\n`;
      }
      markdown += `* * *\n\n`;

      for (const chapter of book.chapters) {
        markdown += `## CHAPTER ${chapter.chapterNumber}: ${chapter.title}\n\n`;
        
        for (let i = 0; i < chapter.scenes.length; i++) {
          const scene = chapter.scenes[i];
          
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
            .replace(/<[^>]*>/g, "");

          markdown += content.trim() + "\n\n";
          
          if (i < chapter.scenes.length - 1) {
            markdown += `\n* * *\n\n`;
          }
        }
        markdown += `\n`;
      }
      
      // Separator between books if multiple
      if (books.length > 1) {
        markdown += `\n\n--- BOOK BREAK ---\n\n`;
      }
    }

    const fileName = bookId && books[0] 
      ? `manuscript_${books[0].title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`
      : `all_manuscripts_${new Date().toISOString().split('T')[0]}.md`;

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Manuscript export error:', error);
    return NextResponse.json({ error: 'Failed to compile manuscript' }, { status: 500 });
  }
}
