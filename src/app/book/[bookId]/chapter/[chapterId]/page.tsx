import { getBookById } from '@/app/actions';
import { notFound, redirect } from 'next/navigation';

export default async function ChapterPage({ 
  params 
}: { 
  params: Promise<{ bookId: string; chapterId: string }> 
}) {
  const { bookId, chapterId } = await params;
  
  const book = await getBookById(bookId);
  if (!book) notFound();

  // Optionally, redirect to the first scene of this chapter if it exists
  const chapter = book.chapters.find(c => c.id === chapterId);
  const firstScene = chapter?.scenes[0];

  if (firstScene) {
    redirect(`/book/${bookId}/chapter/${chapterId}/scene/${firstScene.id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full opacity-50">
      <h2 className="text-xl font-black uppercase tracking-widest">Chapter Empty</h2>
      <p className="text-xs">Create a scene in this chapter to begin writing.</p>
    </div>
  );
}
