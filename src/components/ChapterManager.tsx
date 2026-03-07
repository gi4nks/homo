'use client';

import React, { useState, useEffect, useTransition, useId, useMemo } from 'react';
import { useWorkspaceStore, Chapter, Scene } from '@/store/useWorkspaceStore';
import { 
  deleteChapter, 
  reorderChapters 
} from '@/app/actions/chapter.actions';
import { 
  deleteScene, 
  reorderScenes 
} from '@/app/actions/scene.actions';
import { 
  Plus, 
  Trash2, 
  Folder, 
  FolderOpen,
  Edit2, 
  BarChart3,
  PanelLeftClose,
  GripVertical,
} from 'lucide-react';

// DND Kit Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const FormattedNumber = ({ value }: { value: number }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <>{value}</>;
  return <>{value.toLocaleString()}</>;
};

// --- SORTABLE SCENE ---
const SortableScene = ({ scene, chapterId, bookId }: { scene: Scene, chapterId: string, bookId: string }) => {
  const params = useParams();
  const router = useRouter();
  const openMetadataModal = useWorkspaceStore(state => state.openMetadataModal);
  const openConfirmModal = useWorkspaceStore(state => state.openConfirmModal);
  const [isPending, startTransition] = useTransition();
  
  const isSelected = params.sceneId === scene.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: scene.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : 'auto' };

  return (
    <li ref={setNodeRef} style={style} className={`w-full list-none ${isDragging ? 'opacity-50' : ''}`}>
      <div 
        onClick={() => router.push(`/book/${bookId}/chapter/${chapterId}/scene/${scene.id}`)}
        className={`flex items-start gap-2 w-full p-2.5 rounded-lg group/scene transition-all border-l-4 cursor-pointer ${
          isSelected 
            ? 'bg-primary/10 border-l-primary text-primary shadow-sm font-black' 
            : 'hover:bg-base-200 border-l-transparent text-base-content/60'
        }`}
      >
        <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover/scene:opacity-30" onClick={(e) => e.stopPropagation()}>
          <GripVertical size={12} />
        </div>
        <div className="flex flex-col flex-grow min-w-0">
           <span className="text-[11px] leading-tight truncate">
              <span className="opacity-40 font-mono mr-1">{scene.sceneNumber}.</span> {scene.title}
           </span>
           <span className="text-[9px] opacity-40 font-bold mt-1 uppercase tracking-tighter">
             <FormattedNumber value={scene.wordCount || 0} /> words
           </span>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover/scene:opacity-100 transition-opacity shrink-0">
          <button className="btn btn-ghost btn-xs btn-square" onClick={(e) => { e.stopPropagation(); openMetadataModal('rename_scene', bookId, scene.id, scene.title, scene.sceneNumber); }}><Edit2 size={10} /></button>
          <button className="btn btn-ghost btn-xs btn-square text-error" onClick={(e) => { 
            e.stopPropagation(); 
            openConfirmModal({
              title: "Delete Scene",
              message: `Are you sure you want to delete "${scene.title}"? This action cannot be undone.`,
              confirmLabel: "Delete",
              onConfirm: () => startTransition(async () => { await deleteScene(scene.id); })
            });
          }}><Trash2 size={10} /></button>
        </div>
      </div>
    </li>
  );
};

// --- SORTABLE CHAPTER ---
const SortableChapter = ({ chapter, bookId, expandedChapters, setExpandedChapters }: { chapter: Chapter, bookId: string, expandedChapters: Set<string>, setExpandedChapters: any }) => {
  const params = useParams();
  const router = useRouter();
  const openMetadataModal = useWorkspaceStore(state => state.openMetadataModal);
  const openConfirmModal = useWorkspaceStore(state => state.openConfirmModal);
  const [isPending, startTransition] = useTransition();
  
  const isExpanded = expandedChapters.has(chapter.id);
  const isChapterActive = params.chapterId === chapter.id && !params.sceneId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : 'auto' };

  const getChapterWordCount = () => {
    return chapter.scenes.reduce((acc, scene) => acc + (scene.wordCount || 0), 0);
  };

  const sortedScenes = useMemo(() => 
    [...chapter.scenes].sort((a,b) => a.orderIndex - b.orderIndex),
    [chapter.scenes]
  );

  return (
    <li ref={setNodeRef} style={style} className={`w-full list-none ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex flex-col w-full p-0">
        <div 
          className={`flex items-start gap-2 w-full p-2.5 rounded-xl group/chapter cursor-pointer border transition-all ${
            isChapterActive 
              ? 'bg-base-200 border-base-300 text-primary font-black shadow-inner' 
              : 'border-transparent hover:bg-base-200 text-base-content/80 font-bold'
          }`}
          onClick={() => router.push(`/book/${bookId}/chapter/${chapter.id}`)}
        >
          <div {...attributes} {...listeners} className="mt-1.5 cursor-grab active:cursor-grabbing opacity-0 group-hover/chapter:opacity-30" onClick={(e) => e.stopPropagation()}>
            <GripVertical size={14} />
          </div>
          
          <div 
            className="mt-1 transition-transform duration-200 hover:scale-110"
            onClick={(e) => { 
              e.stopPropagation(); 
              setExpandedChapters((prev: Set<string>) => {
                const n = new Set(prev);
                if (n.has(chapter.id)) n.delete(chapter.id);
                else {
                  n.clear();
                  n.add(chapter.id);
                }
                return n;
              });
            }}
          >
            {isExpanded ? <FolderOpen size={16} className="text-primary" /> : <Folder size={16} className="opacity-30" />}
          </div>

          <div className="flex flex-col flex-grow min-w-0">
             <span className="text-[10px] uppercase tracking-widest truncate">
                <span className="opacity-40 font-mono mr-1">CH{chapter.chapterNumber}.</span> {chapter.title}
             </span>
             <span className="text-[8px] font-black opacity-30 mt-1 uppercase tracking-tighter">
               <FormattedNumber value={getChapterWordCount()} /> words total
             </span>
          </div>

          <div className="flex gap-0.5 opacity-0 group-hover/chapter:opacity-100 transition-opacity shrink-0">
             <button className="btn btn-ghost btn-xs btn-square text-primary" onClick={(e) => { e.stopPropagation(); openMetadataModal('create_scene', bookId, chapter.id); }}><Plus size={14} /></button>
             <button className="btn btn-ghost btn-xs btn-square" onClick={(e) => { e.stopPropagation(); openMetadataModal('rename_chapter', bookId, chapter.id, chapter.title, chapter.chapterNumber); }}><Edit2 size={12} /></button>
             <button className="btn btn-ghost btn-xs btn-square text-error" onClick={(e) => { 
               e.stopPropagation(); 
               openConfirmModal({
                 title: "Delete Chapter",
                 message: `Are you sure you want to delete "${chapter.title}"? All scenes within will also be removed.`,
                 confirmLabel: "Delete",
                 onConfirm: () => startTransition(async () => { await deleteChapter(chapter.id); })
               });
             }}><Trash2 size={12} /></button>
          </div>
        </div>

        {isExpanded && (
          <ul className="ml-6 mt-1 border-l border-base-300/50 pl-2 flex flex-col gap-1 w-[calc(100%-1.5rem)] animate-in slide-in-from-left-1 duration-200">
            <SortableContext items={sortedScenes.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {sortedScenes.map((scene) => (
                <SortableScene key={scene.id} scene={scene} chapterId={chapter.id} bookId={bookId} />
              ))}
            </SortableContext>
          </ul>
        )}
      </div>
    </li>
  );
};

// --- MAIN COMPONENT ---
const ChapterManager: React.FC<{ bookId: string; chapters: Chapter[]; onClose?: () => void }> = ({ bookId, chapters: initialChapters, onClose }) => {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  const chapters = useWorkspaceStore(state => state.chapters);
  const setChapters = useWorkspaceStore(state => state.setChapters);
  const openMetadataModal = useWorkspaceStore(state => state.openMetadataModal);
  const id = useId();

  const isDashboardActive = !params.chapterId && !params.sceneId;

  // Sync initial chapters to store
  useEffect(() => { 
    setMounted(true);
    // Initialize store with initial data from server
    if (initialChapters) {
      setChapters([...initialChapters].sort((a,b) => a.orderIndex - b.orderIndex)); 
    }
  }, [initialChapters, setChapters]);

  useEffect(() => {
    if (params.chapterId) {
      setExpandedChapters(new Set([params.chapterId as string]));
    }
  }, [params.chapterId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeChapterIndex = chapters.findIndex(c => c.id === active.id);
    const overChapterIndex = chapters.findIndex(c => c.id === over.id);

    if (activeChapterIndex !== -1 && overChapterIndex !== -1) {
      const oldOrder = [...chapters];
      const newOrder = arrayMove(chapters, activeChapterIndex, overChapterIndex);
      setChapters(newOrder); 
      const updates = newOrder.map((c, i) => ({ id: c.id, orderIndex: i + 1 }));
      const res = await reorderChapters(bookId, updates);
      if (!res.success) {
        setChapters(oldOrder);
        alert("Failed to reorder: " + res.error);
      }
      return;
    }

    for (const chapter of chapters) {
      const activeSceneIndex = chapter.scenes.findIndex(s => s.id === active.id);
      const overSceneIndex = chapter.scenes.findIndex(s => s.id === over.id);

      if (activeSceneIndex !== -1 && overSceneIndex !== -1) {
        const oldScenes = [...chapter.scenes];
        const newScenes = arrayMove(chapter.scenes, activeSceneIndex, overSceneIndex);
        const updatedChapters = chapters.map(c => c.id === chapter.id ? { ...c, scenes: newScenes } : c);
        setChapters(updatedChapters); 
        const updates = newScenes.map((s, i) => ({ id: s.id, orderIndex: i + 1 }));
        const res = await reorderScenes(chapter.id, updates);
        if (!res.success) {
          setChapters(chapters);
          alert("Failed to reorder: " + res.error);
        }
        break;
      }
    }
  };

  const sortedChapters = useMemo(() => 
    [...chapters].sort((a,b) => a.orderIndex - b.orderIndex),
    [chapters]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-base-100">
      <div className="p-4 border-b border-base-200 bg-base-100/50 flex justify-between items-center shrink-0">
        <div 
          className={`flex items-center gap-2 cursor-pointer transition-all hover:text-primary ${isDashboardActive ? 'text-primary' : 'text-base-content font-black opacity-70 hover:opacity-100'}`}
          onClick={() => router.push(`/book/${bookId}`)}
        >
           <BarChart3 size={14} />
           <span className="text-[10px] uppercase tracking-[0.2em]">Project Central</span>
        </div>
        <div className="flex gap-1">
           <button className="btn btn-ghost btn-xs btn-square opacity-50 hover:opacity-100" onClick={onClose} title="Close Navigator">
              <PanelLeftClose size={14} />
           </button>
           <button className="btn btn-primary btn-xs btn-square shadow-sm" onClick={() => openMetadataModal('create_chapter', bookId, null)} title="Add Chapter">
              <Plus size={14} />
           </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar bg-base-100 p-2">
        {!mounted ? (
          <div className="p-4 text-center">
             <div className="loading loading-spinner loading-sm text-primary opacity-20"></div>
          </div>
        ) : (
          <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <ul className="flex flex-col gap-1.5 w-full pb-32">
              <SortableContext items={sortedChapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {sortedChapters.map((chapter) => (
                  <SortableChapter 
                    key={chapter.id} 
                    chapter={chapter} 
                    bookId={bookId} 
                    expandedChapters={expandedChapters} 
                    setExpandedChapters={setExpandedChapters} 
                  />
                ))}
              </SortableContext>
            </ul>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ChapterManager;
