import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import React from 'react';

export default async function ChapterPage({ 
  params 
}: { 
  params: Promise<{ bookId: string; chapterId: string }> 
}) {
  const { bookId, chapterId } = await params;
  
  // Fetch chapter with scenes ordered by orderIndex
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      scenes: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!chapter || chapter.bookId !== bookId) notFound();

  return (
    <div className="h-full overflow-y-auto bg-base-100 custom-scrollbar animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto py-20 px-8">
        
        {/* CHAPTER HEADER */}
        <header className="mb-16 text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-4">
            Chapter {chapter.chapterNumber}
          </div>
          <h1 className="text-5xl font-serif font-black text-base-content tracking-tight">
            {chapter.title}
          </h1>
        </header>

        {/* INTEGRATED SCENES */}
        <div className="space-y-16">
          {chapter.scenes.length === 0 ? (
            <div className="text-center opacity-30 py-20 border-2 border-dashed border-base-300 rounded-3xl">
              <p className="font-black uppercase tracking-widest text-xs">No scenes in this chapter yet</p>
            </div>
          ) : (
            chapter.scenes.map((scene, index) => (
              <article key={scene.id} className="relative group">
                {/* SCENE INDICATOR */}
                <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-20 transition-opacity font-mono text-[10px] hidden lg:block">
                  SC {scene.sceneNumber}
                </div>

                <div 
                  className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none font-serif leading-[2.2] selection:bg-primary/20"
                  dangerouslySetInnerHTML={{ __html: scene.content || '<p className="italic opacity-30">Empty scene...</p>' }}
                />

                {/* SCENE DIVIDER */}
                {index < chapter.scenes.length - 1 && (
                  <div className="flex justify-center items-center py-16 opacity-20">
                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-base-content"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-base-content"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-base-content"></div>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* FOOTER FOOTNOTE */}
        <footer className="mt-32 pt-8 border-t border-base-300 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">
            End of Chapter {chapter.chapterNumber}
          </p>
        </footer>
      </div>
    </div>
  );
}
