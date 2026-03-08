'use client';

import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
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
  ChevronRight,
  Loader2,
  Wand2,
  Globe,
  Search,
  Activity
} from 'lucide-react';
import { useAiStream } from '@/hooks/useAiStream';
import InspectorSection from './InspectorSection';
import ReactMarkdown from 'react-markdown';

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
  const inspectorBindings = useWorkspaceStore(state => state.inspectorBindings);

  const chapter = book.chapters.find((c: any) => c.id === activeChapterId);

  const [localTitle, setLocalTitle] = useState(chapter?.title || '');
  const [localGoal, setLocalGoal] = useState(chapter?.chapterGoal || '');
  const [localAuditReport, setLocalAuditReport] = useState(chapter?.auditReport || '');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { aiProposal, isAiLoading, startStream } = useAiStream();
  const [activeAiField, setActiveAiField] = useState<string | null>(null);
  const editorRef = useWorkspaceStore(state => state.editorRef);

  useEffect(() => {
    if (chapter?.title !== undefined && chapter.title !== localTitle) setLocalTitle(chapter.title || '');
  }, [chapter?.title]);

  useEffect(() => {
    if (chapter?.chapterGoal !== undefined && chapter.chapterGoal !== localGoal) setLocalGoal(chapter.chapterGoal || '');
  }, [chapter?.chapterGoal]);

  useEffect(() => {
    if (chapter?.auditReport !== undefined && chapter.auditReport !== localAuditReport) setLocalAuditReport(chapter.auditReport || '');
  }, [chapter?.auditReport]);

  const debouncedTitle = useDebounce(localTitle, 1500);
  const debouncedGoal = useDebounce(localGoal, 1500);
  const debouncedAuditReport = useDebounce(localAuditReport, 1500);

  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (aiProposal && isAiLoading && activeAiField) {
      if (activeAiField === 'chapterGoal') {
        setLocalGoal(aiProposal);
        isDirtyRef.current = true;
      } else if (activeAiField === 'chapterAudit') {
        setLocalAuditReport(aiProposal);
        isDirtyRef.current = true;
      }
    }
    if (!isAiLoading) setActiveAiField(null);
  }, [aiProposal, isAiLoading, activeAiField]);

  const chapterRef = useRef(chapter);
  useEffect(() => { chapterRef.current = chapter; }, [chapter]);

  const saveField = useCallback(async (data: any) => {
    if (!activeChapterId) return;
    const keys = Object.keys(data);
    const hasChanged = keys.some(key => data[key] !== chapterRef.current?.[key]);
    if (!hasChanged) return;

    setSaveStatus(true, null);
    const res = await updateChapter(activeChapterId, data);
    if (res.success) {
      setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      isDirtyRef.current = false;
    } else {
      setSaveStatus(false, "Error");
    }
  }, [activeChapterId, setSaveStatus]);

  useEffect(() => { if (debouncedTitle !== (chapter?.title || '')) saveField({ title: debouncedTitle }); }, [debouncedTitle, chapter?.title, saveField]);
  useEffect(() => { if (isDirtyRef.current && debouncedGoal !== (chapter?.chapterGoal || '') && !isAiLoading) saveField({ chapterGoal: debouncedGoal }); }, [debouncedGoal, chapter?.chapterGoal, isAiLoading, saveField]);
  useEffect(() => { if (isDirtyRef.current && debouncedAuditReport !== (chapter?.auditReport || '') && !isAiLoading) saveField({ auditReport: debouncedAuditReport }); }, [debouncedAuditReport, chapter?.auditReport, isAiLoading, saveField]);

  // --- CHAPTER AUDIT LOGIC ---
  const handleRunChapterAudit = async () => {
    if (isAiLoading || !chapter) return;
    
    const scenesToAudit = chapter.scenes || [];
    if (scenesToAudit.length === 0) return;

    const activeSceneId = params.sceneId as string;
    let concatenatedText = `CHAPTER AUDIT: ${chapter.title} (Chapter ${chapter.chapterNumber})\n\n`;

    scenesToAudit.forEach((s: any) => {
      const text = (s.id === activeSceneId && editorRef) 
        ? editorRef.getText() 
        : s.content.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ');
        
      concatenatedText += `\n--- [SCENE: ${s.title}] ---\n\n${text}\n`;
    });

    setActiveAiField('chapterAudit');

    await startStream(
      activeBookId,
      null,
      undefined, 
      undefined, 
      "Perform a Continuity and Structural Audit for this specific chapter. Identify inconsistencies between its scenes, pacing issues, and plot gaps. Provide a structured feedback report.",
      'ANALYZE',
      undefined,
      undefined,
      concatenatedText,
      "Analyze the chapter's internal continuity."
    );
  };

  const handleMagicAi = async (fieldId: string, currentVal: string) => {
    const binding = inspectorBindings[fieldId];
    if (!binding?.templateId || isAiLoading) return;

    setActiveAiField(fieldId);
    await startStream(
      activeBookId,
      params.sceneId as string || null,
      binding.personaId || undefined,
      binding.templateId,
      "Refine or expand this chapter objective based on the story context.",
      'DRAFT',
      undefined,
      undefined,
      undefined,
      currentVal || "Suggest an objective for this chapter."
    );
  };

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

  const renderMagicButton = (fieldId: string, currentVal: string) => {
    const binding = inspectorBindings[fieldId];
    if (!binding?.templateId) return null;
    const isThisLoading = isAiLoading && activeAiField === fieldId;

    return (
      <button 
        onClick={() => handleMagicAi(fieldId, currentVal)}
        disabled={isAiLoading}
        className={`btn btn-xs btn-outline btn-primary gap-1.5 font-black uppercase tracking-widest text-[8px] transition-all flex-shrink-0 shadow-sm ${
          isThisLoading 
            ? 'loading' 
            : 'hover:scale-105'
        }`}
      >
        {!isThisLoading && <Wand2 size={10} />}
        {isThisLoading ? 'Forging...' : '✨ AI'}
      </button>
    );
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
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <Target size={10} className="flex-shrink-0" /> Chapter Objective
              </span>
            </label>
            {renderMagicButton('chapterGoal', localGoal)}
          </div>
          <textarea 
            className={`${textareaClass} ${isAiLoading && activeAiField === 'chapterGoal' ? 'opacity-50 cursor-wait' : ''}`}
            value={localGoal} 
            onChange={(e) => {
              isDirtyRef.current = true;
              setLocalGoal(e.target.value);
            }} 
            onBlur={() => saveField({ chapterGoal: localGoal })}
            placeholder="What is the main goal or arc of this chapter?"
            disabled={isAiLoading && activeAiField === 'chapterGoal'}
          />
        </div>
      </InspectorSection>

      {/* SECTION: CHAPTER CONTINUITY AUDITOR */}
      <InspectorSection title="Chapter Continuity Audit" icon={Globe} defaultOpen={false}>
        <div className="space-y-4">
          <button 
            onClick={handleRunChapterAudit}
            disabled={isAiLoading}
            className={`btn btn-primary btn-sm rounded-xl font-black uppercase tracking-widest text-[10px] w-full shadow-lg shadow-primary/20 ${isAiLoading && activeAiField === 'chapterAudit' ? 'loading' : ''}`}
          >
            {isAiLoading && activeAiField === 'chapterAudit' ? 'Auditing Chapter...' : '✨ Run Chapter Audit'}
          </button>

          {isAiLoading && activeAiField === 'chapterAudit' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tight animate-pulse">
              <Activity size={12} />
              Analyzing chapter scenes...
            </div>
          )}

          <div className="form-control w-full">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Chapter Audit Report</span></label>
            <textarea 
              className={textareaClass + " min-h-[250px] font-mono text-[10px]"}
              value={localAuditReport} 
              onChange={(e) => {
                isDirtyRef.current = true;
                setLocalAuditReport(e.target.value);
              }} 
              onBlur={() => saveField({ auditReport: localAuditReport })}
              placeholder="Chapter audit results will appear here..."
              disabled={isAiLoading && activeAiField === 'chapterAudit'}
            />
          </div>

          {localAuditReport && (
            <div className="p-4 bg-base-200/50 rounded-xl border border-base-300 prose prose-xs dark:prose-invert max-w-none overflow-y-auto max-h-[300px] custom-scrollbar">
              <ReactMarkdown>{localAuditReport}</ReactMarkdown>
            </div>
          )}
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
