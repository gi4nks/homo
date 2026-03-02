import { getBookById } from '@/app/actions/book.actions';
import { notFound, redirect } from 'next/navigation';

export default async function BookDashboard({ 
  params 
}: { 
  params: Promise<{ bookId: string }> 
}) {
  const { bookId } = await params;
  
  const response = await getBookById(bookId);
  if (!response.success || !response.data) notFound();

  const book = response.data;

  // Redirect to first scene if it exists
  const firstChapter = book.chapters[0];
  const firstScene = firstChapter?.scenes[0];

  if (firstChapter && firstScene) {
    redirect(`/book/${bookId}/chapter/${firstChapter.id}/scene/${firstScene.id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full opacity-50">
      <h2 className="text-xl font-black uppercase tracking-widest">Workspace Empty</h2>
      <p className="text-xs">Create a chapter and a scene to begin writing.</p>
    </div>
  );
}
