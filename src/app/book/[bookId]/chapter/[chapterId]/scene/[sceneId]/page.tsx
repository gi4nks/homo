import SceneEditor from '@/components/SceneEditor';

export default async function ScenePage({ 
  params 
}: { 
  params: Promise<{ bookId: string; chapterId: string; sceneId: string }> 
}) {
  const { bookId, sceneId } = await params;
  
  return (
    <SceneEditor bookId={bookId} sceneId={sceneId} />
  );
}
