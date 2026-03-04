'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams } from 'next/navigation';
import { updateChapter } from '@/app/actions/chapter.actions';
import { Layers, RefreshCw, Target } from 'lucide-react';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ChapterTab({ book }: { book: any }) {
  const params = useParams();
  const activeChapterId = params.chapterId as string;
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);

  const chapter = book.chapters.find((c: any) => c.id === activeChapterId);
  const [localGoal, setLocalGoal] = useState(chapter?.chapterGoal || '');
  const debouncedGoal = useDebounce(localGoal, 1500);

  useEffect(() => {
    if (debouncedGoal !== (chapter?.chapterGoal || '')) {
      if (!activeChapterId) return;
      setSaveStatus(true, null);
      updateChapter(activeChapterId, { chapterGoal: debouncedGoal }).then(() => {
        setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      });
    }
  }, [debouncedGoal, activeChapterId, setSaveStatus, chapter?.chapterGoal]);

  if (!activeChapterId) return null;

  return (
    <div className="p-4 space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
      
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm" open>
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
          <Target size={12} /> Overarching Chapter Goal
        </summary>
        <div className="collapse-content pt-2">
          <textarea 
            className="textarea textarea-ghost w-full min-h-[200px] text-[11px] leading-relaxed bg-base-100 p-4 border-none focus:ring-0 resize-none custom-scrollbar" 
            placeholder="What is the main objective or arc of this chapter?" 
            value={localGoal} 
            onChange={(e) => setLocalGoal(e.target.value)} 
          />
          <div className="flex justify-end gap-2 mt-2 opacity-20">
             <RefreshCw size={10} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Syncing Chapter Context</span>
          </div>
        </div>
      </details>

    </div>
  );
}
