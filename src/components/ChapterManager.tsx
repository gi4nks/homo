'use client';

import React, { useState, useEffect, useTransition, useId } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
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
  Edit2, 
  BarChart3,
  PanelLeftClose,
  FileText,
  GripVertical,
  AlertTriangle
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
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Scene { id: string; title: string; content: string; orderIndex: number; sceneNumber: number; }
interface Chapter { id: string; title: string; orderIndex: number; chapterNumber: number; scenes: Scene[]; }

const FormattedNumber = ({ value }: { value: number }) => {
  const [formatted, setFormatted] = useState<string>(value.toString());
  useEffect(() => { setFormatted(value.toLocaleString()); }, [value]);
  return <>{formatted}</>;
};

// --- SORTABLE ITEM COMPONENTS ---

const SortableScene = ({ scene, chapterId, bookId }: { scene: Scene, chapterId: string, bookId: string }) => {
  const activeSceneId = useWorkspaceStore(state => state.activeSceneId);
  const setActiveScene = useWorkspaceStore(state => state.setActiveScene);
  const openMetadataModal = useWorkspaceStore(state => state.openMetadataModal);
  
  const [isPending, startTransition] = useTransition();
  const isSelected = activeSceneId === scene.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: scene.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : 'auto' };

  const countWords = (html: string = '') => {
    const text = html.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
  };

  return (
    <li ref={setNodeRef} style={style} className={`w-full ${isDragging ? 'opacity-50' : ''}`}>
      <div className={`flex items-start gap-2 w-full p-2 rounded-md group/scene transition-all border ${isSelected ? 'bg-primary/5 border-primary/20 text-primary shadow-sm' : 'hover:bg-base-100 border-transparent opacity-70'}`}>
        <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover/scene:opacity-30">
          <GripVertical size={12} />
        </div>
        <div className="flex flex-col flex-grow min-w-0 cursor-pointer" onClick={() => setActiveScene(scene.id, chapterId)}>
           <span className={`text-[11px] leading-snug text-left truncate w-full ${isSelected ? 'font-bold' : 'font-medium'}`}>
              <span className="opacity-30 mr-1">({scene.sceneNumber})</span> {scene.title}
           </span>
           <div className="badge badge-ghost text-[8px] h-3.5 font-black uppercase tracking-tighter border-base-300 opacity-50 mt-1 self-start">
             <FormattedNumber value={countWords(scene.content)} /> words
           </div>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover/scene:opacity-100 transition-opacity shrink-0">
          <button className="btn btn-ghost btn-xs btn-square" onClick={(e) => { e.stopPropagation(); openMetadataModal('rename_scene', bookId, scene.id, scene.title, scene.sceneNumber); }}><Edit2 size={10} /></button>
          <button className="btn btn-ghost btn-xs btn-square text-error" onClick={(e) => { e.stopPropagation(); if(confirm(`Delete Scene "${scene.title}"?`)) startTransition(async () => { await deleteScene(scene.id); }); }}><Trash2 size={10} /></button>
        </div>
      </div>
    </li>
  );
};

const SortableChapter = ({ chapter, bookId, expandedChapters, setExpandedChapters }: { chapter: Chapter, bookId: string, expandedChapters: Set<string>, setExpandedChapters: any }) => {
  const activeChapterId = useWorkspaceStore(state => state.activeChapterId);
  const activeSceneId = useWorkspaceStore(state => state.activeSceneId);
  const setActiveChapter = useWorkspaceStore(state => state.setActiveChapter);
  const openMetadataModal = useWorkspaceStore(state => state.openMetadataModal);

  const [isPending, startTransition] = useTransition();
  const isExpanded = expandedChapters.has(chapter.id);
  const isChapterActive = activeChapterId === chapter.id && !activeSceneId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : 'auto' };

  const getChapterWordCount = () => {
    return chapter.scenes.reduce((acc, scene) => {
      const text = scene.content.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      return acc + (text ? text.split(/\s+/).length : 0);
    }, 0);
  };

  const sortedScenes = [...chapter.scenes].sort((a,b) => a.orderIndex - b.orderIndex);

  return (
    <li ref={setNodeRef} style={style} className={`w-full ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex flex-col w-full p-0">
        <div className={`flex items-start gap-2 w-full p-2 rounded-lg group/chapter cursor-pointer border transition-all ${isChapterActive ? 'bg-primary/5 border-primary/20' : 'border-transparent hover:bg-base-200'}`}>
          <div {...attributes} {...listeners} className="mt-1.5 cursor-grab active:cursor-grabbing opacity-0 group-hover/chapter:opacity-30">
            <GripVertical size={14} />
          </div>
          <Folder 
            className={`w-4 h-4 shrink-0 mt-1 ${isExpanded ? 'text-primary' : 'text-base-content/30'}`}
            onClick={() => setExpandedChapters((prev: any) => { const n = new Set(prev); n.has(chapter.id) ? n.delete(chapter.id) : n.add(chapter.id); return n; })}
          />
          <div className="flex flex-col flex-grow min-w-0" onClick={() => setActiveChapter(chapter.id)}>
             <span className={`text-[10px] font-black uppercase tracking-widest text-left truncate w-full ${isChapterActive ? 'text-primary' : ''}`}>
                <span className="opacity-40 mr-1">[{chapter.chapterNumber}]</span> {chapter.title}
             </span>
             <div className="badge badge-primary badge-outline text-[8px] h-3.5 font-black uppercase tracking-tighter opacity-50 mt-1 self-start">
               <FormattedNumber value={getChapterWordCount()} /> words
             </div>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover/chapter:opacity-100 transition-opacity shrink-0">
             <button className="btn btn-ghost btn-xs btn-square text-primary" onClick={(e) => { e.stopPropagation(); openMetadataModal('create_scene', bookId, chapter.id); }}><Plus size={14} /></button>
             <button className="btn btn-ghost btn-xs btn-square" onClick={(e) => { e.stopPropagation(); openMetadataModal('rename_chapter', bookId, chapter.id, chapter.title, chapter.chapterNumber); }}><Edit2 size={12} /></button>
             <button className="btn btn-ghost btn-xs btn-square text-error" onClick={(e) => { e.stopPropagation(); if(confirm(`Delete Chapter "${chapter.title}"?`)) startTransition(async () => { await deleteChapter(chapter.id); }); }}><Trash2 size={12} /></button>
          </div>
        </div>

        {isExpanded && (
          <ul className="ml-6 mt-1 border-l border-base-200 pl-2 flex flex-col gap-1 w-[calc(100%-1.5rem)]">
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

const ChapterManager: React.FC<{ bookId: string; chapters: Chapter[]; onClose?: () => void }> = ({ bookId, chapters, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [localChapters, setLocalChapters] = useState<Chapter[]>(chapters);
  const openMetadataModal = useWorkspaceStore(state => state.openMetadataModal);
  const id = useId();

  useEffect(() => { 
    setMounted(true);
    setLocalChapters([...chapters].sort((a,b) => a.orderIndex - b.orderIndex)); 
  }, [chapters]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Check if we are dragging a chapter
    const activeChapterIndex = localChapters.findIndex(c => c.id === active.id);
    const overChapterIndex = localChapters.findIndex(c => c.id === over.id);

    if (activeChapterIndex !== -1 && overChapterIndex !== -1) {
      // Reordering CHAPTERS
      const oldOrder = [...localChapters];
      const newOrder = arrayMove(localChapters, activeChapterIndex, overChapterIndex);
      setLocalChapters(newOrder); // Optimistic Update
      const updates = newOrder.map((c, i) => ({ id: c.id, orderIndex: i + 1 }));
      const res = await reorderChapters(bookId, updates);
      if (!res.success) {
        setLocalChapters(oldOrder);
        alert("Failed to reorder chapters: " + res.error);
      }
      return;
    }

    // Check if we are dragging a scene
    for (const chapter of localChapters) {
      const activeSceneIndex = chapter.scenes.findIndex(s => s.id === active.id);
      const overSceneIndex = chapter.scenes.findIndex(s => s.id === over.id);

      if (activeSceneIndex !== -1 && overSceneIndex !== -1) {
        // Reordering SCENES within the same chapter
        const oldScenes = [...chapter.scenes];
        const newScenes = arrayMove(chapter.scenes, activeSceneIndex, overSceneIndex);
        const updatedChapters = localChapters.map(c => c.id === chapter.id ? { ...c, scenes: newScenes } : c);
        setLocalChapters(updatedChapters); // Optimistic Update
        const updates = newScenes.map((s, i) => ({ id: s.id, orderIndex: i + 1 }));
        const res = await reorderScenes(chapter.id, updates);
        if (!res.success) {
          setLocalChapters(localChapters);
          alert("Failed to reorder scenes: " + res.error);
        }
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-base-100">
      <div className="p-4 border-b border-base-200 bg-base-50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-primary font-black">
           <BarChart3 size={14} />
           <span className="text-[10px] uppercase tracking-[0.2em]">Manuscript</span>
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

      <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar bg-base-100">
        {!mounted ? (
          <div className="p-4 text-center">
             <div className="loading loading-spinner loading-sm text-primary opacity-20"></div>
          </div>
        ) : (
          <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <ul className="menu menu-sm p-2 w-full gap-1 pb-32">
              <SortableContext items={localChapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {localChapters.map((chapter) => (
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
