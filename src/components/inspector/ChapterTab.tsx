'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { updateChapter } from '@/app/actions/chapter.actions';
import { Layers, RefreshCw } from 'lucide-react';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ChapterTab({ book }: { book: any }) {
  const activeChapterId = useWorkspaceStore((state) => state.activeChapterId);
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);

  // Find chapter from book prop
  const chapter = book.chapters.find((c: any) => c.id === activeChapterId);
  const [localGoal, setLocalGoal] = useState(chapter?.chapterGoal || '');
  const debouncedGoal = useDebounce(localGoal, 1500);

  useEffect(() => {
    if (chapter) setLocalGoal(chapter.chapterGoal || '');
  }, [activeChapterId, chapter?.chapterGoal]);

  useEffect(() => {
    if (!activeChapterId || debouncedGoal === (chapter?.chapterGoal || '')) return;

    const save = async () => {
      setSaveStatus(true, null);
      const res = await updateChapter(activeChapterId, { chapterGoal: debouncedGoal });
      if (res.success) {
        setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaveStatus(false, "Error");
      }
    };
    save();
  }, [debouncedGoal]);

  if (!activeChapterId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
        <Layers size={40} />
        <p className="text-xs font-bold uppercase tracking-widest">Select a chapter to view its goals</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <section className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Chapter Arc / Goals</h4>
        <textarea 
          className="textarea textarea-bordered w-full h-[500px] text-[11px] leading-relaxed p-6 font-medium focus:border-primary bg-base-50 shadow-inner resize-none border-base-300" 
          placeholder="What is the overarching goal of this chapter?" 
          value={localGoal} 
          onChange={(e) => setLocalGoal(e.target.value)} 
        />
      </section>
    </div>
  );
}
