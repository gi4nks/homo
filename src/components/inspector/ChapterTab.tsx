'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams } from 'next/navigation';
import { updateChapter } from '@/app/actions/chapter.actions';
import { compileManuscript } from '@/app/actions/book.actions';
import { 
  Type, 
  Target, 
  RefreshCw, 
  Download, 
  Database,
  ChartBarStacked,
  ChevronRight
} from 'lucide-react';
import InspectorSection from './InspectorSection';

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
  const activeBookId = params.bookId as string;
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);

  const chapter = book.chapters.find((c: any) => c.id === activeChapterId);

  const [localTitle, setLocalTitle] = useState(chapter?.title || '');
  const [localGoal, setLocalGoal] = useState(chapter?.chapterGoal || '');
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    setLocalTitle(chapter?.title || '');
    setLocalGoal(chapter?.chapterGoal || '');
  }, [chapter]);

  const debouncedTitle = useDebounce(localTitle, 1500);
  const debouncedGoal = useDebounce(localGoal, 1500);

  const saveField = async (data: any) => {
    if (!activeChapterId) return;
    
    // Check if data actually changed
    const keys = Object.keys(data);
    const hasChanged = keys.some(key => data[key] !== chapter[key]);
    if (!hasChanged) return;

    setSaveStatus(true, null);
    const res = await updateChapter(activeChapterId, data);
    setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
  };

  useEffect(() => { if (debouncedTitle !== (chapter?.title || '')) saveField({ title: debouncedTitle }); }, [debouncedTitle]);
  useEffect(() => { if (debouncedGoal !== (chapter?.chapterGoal || '')) saveField({ chapterGoal: debouncedGoal }); }, [debouncedGoal]);

  const handleCompileChapter = async () => {
    if (!activeBookId || !activeChapterId) return;
    setIsCompiling(true);
    try {
      const res = await compileManuscript(activeBookId, activeChapterId);
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chapter_${chapter.chapterNumber}_${chapter.title.replace(/\s+/g, '_')}.md`;
        a.click();
      }
    } catch (err) { console.error(err); } finally { setIsCompiling(false); }
  };

  const getChapterWordCount = () => {
    return chapter?.scenes.reduce((acc: number, scene: any) => acc + (scene.wordCount || 0), 0) || 0;
  };

  if (!activeChapterId) return null;

  const inputClass = "bg-slate-50 dark:bg-base-300 border border-base-300/50 dark:border-base-100 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-2 transition-all font-bold text-xs w-full";
  const textareaClass = "textarea bg-slate-50 dark:bg-base-300 border border-base-300/50 dark:border-base-100 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 transition-all text-[11px] leading-relaxed w-full resize-none custom-scrollbar shadow-inner min-h-[200px]";

  return (
    <div className="p-4 space-y-2 animate-in fade-in slide-in-from-right-2 duration-300">
      
      {/* SECTION 1: NARRATIVE ARC */}
      <InspectorSection title="Narrative Arc" icon={ChartBarStacked} defaultOpen={true}>
        <div className="form-control w-full">
          <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Chapter Title</span></label>
          <input 
            type="text" 
            className={inputClass}
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => saveField({ title: localTitle })}
            placeholder="Chapter Title..." 
          />
        </div>

        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2">
              <Target size={10} /> Chapter Objective
            </span>
          </label>
          <textarea 
            className={textareaClass}
            value={localGoal} 
            onChange={(e) => setLocalGoal(e.target.value)} 
            onBlur={() => saveField({ chapterGoal: localGoal })}
            placeholder="What is the main goal or arc of this chapter?"
          />
        </div>
      </InspectorSection>

      {/* SECTION 2: DATA & EXPORTS */}
      <InspectorSection title="Data & Exports" icon={Database}>
        <div className="bg-slate-50 dark:bg-base-300 rounded-xl p-4 flex flex-col gap-4 border border-base-300 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Chapter Volume</span>
            <span className="font-mono text-xs font-black">{getChapterWordCount().toLocaleString()} Words</span>
          </div>
          <button 
            onClick={handleCompileChapter}
            disabled={isCompiling}
            className={`btn btn-primary btn-sm rounded-xl font-black uppercase tracking-widest text-[10px] w-full shadow-lg shadow-primary/20 ${isCompiling ? 'loading' : ''}`}
          >
            <Download size={14} className="mr-2" /> Export Chapter (.md)
          </button>
        </div>
      </InspectorSection>

    </div>
  );
}
