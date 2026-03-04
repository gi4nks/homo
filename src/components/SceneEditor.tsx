'use client';

import React, { useState, useEffect, useRef, startTransition } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { updateSceneContent, getSceneById } from '@/app/actions/scene.actions';
import { 
  Undo2, 
  Redo2, 
  Loader2,
  BookOpen,
  Sparkles,
  Maximize2
} from 'lucide-react';
import Editor, { EditorRef } from './Editor';
import { useAiStream } from '@/hooks/useAiStream';
import AiProposalBox from './editor/AiProposalBox';
import AiProfileSelector from './editor/AiProfileSelector';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface SceneEditorProps {
  bookId: string;
  sceneId: string;
}

export default function SceneEditor({ bookId, sceneId }: SceneEditorProps) {
  const setUnsavedChanges = useWorkspaceStore(state => state.setUnsavedChanges);
  const setSaveStatus = useWorkspaceStore(state => state.setSaveStatus);
  const isFocusMode = useWorkspaceStore(state => state.isFocusMode);
  const toggleFocusMode = useWorkspaceStore(state => state.toggleFocusMode);
  const activeAiProfileId = useWorkspaceStore(state => state.activeAiProfileId);

  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  const editorRef = useRef<EditorRef>(null);
  const contentRef = useRef<string>('');
  const lastSavedRef = useRef<string>('');
  const sceneIdRef = useRef<string | null>(null);

  // --- CUSTOM AI HOOK ---
  const { 
    aiProposal, 
    isAiLoading, 
    aiError, 
    promptBlueprint,
    startStream, 
    clearProposal 
  } = useAiStream();

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Trigger AI Generation: Cmd + Enter or Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isAiLoading && sceneId) {
          startStream(bookId, sceneId);
        }
      }

      // 2. Toggle Focus Mode: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookId, sceneId, isAiLoading, startStream, toggleFocusMode]);

  const handleAcceptProposal = async () => {
    if (!aiProposal) return;
    
    const formattedAppend = `<p></p><p>${aiProposal.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')}</p>`;
    editorRef.current?.insertContent(formattedAppend);
    
    if (sceneId) {
      setSaveStatus(true, "Saving...");
      startTransition(async () => {
        const res = await updateSceneContent(sceneId, contentRef.current);
        if (res.success) {
          lastSavedRef.current = contentRef.current;
          setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setUnsavedChanges(false);
        }
      });
    }
    clearProposal();
  };

  const calculateWords = (html: string) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
  };

  // 1. Initial Load
  useEffect(() => {
    if (sceneId) {
      setIsLoading(true);
      setContent(null);
      sceneIdRef.current = sceneId;
      
      const load = async () => {
        const res = await getSceneById(sceneId);
        if (res.success && res.data) {
          const scene = res.data;
          const initialContent = scene.content || '';
          setContent(initialContent);
          contentRef.current = initialContent;
          lastSavedRef.current = initialContent;
          setWordCount(calculateWords(initialContent));
          setSaveStatus(false, new Date(scene.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        setIsLoading(false);
      };
      load();
    }
  }, [sceneId, setSaveStatus]);

  // 2. UNMOUNT FLUSH LOGIC
  useEffect(() => {
    return () => {
      const idToSave = sceneIdRef.current;
      const finalContent = contentRef.current;
      const lastSaved = lastSavedRef.current;

      if (idToSave && finalContent !== lastSaved) {
        updateSceneContent(idToSave, finalContent);
      }
    };
  }, []); 

  // 3. Debounced Auto-save (PAUSE DURING AI GENERATION)
  const debouncedContent = useDebounce(content || '', 1500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (isAiLoading) return;

    const performSave = async () => {
      if (sceneId && debouncedContent !== lastSavedRef.current && !isLoading) {
        setSaveStatus(true, null);
        
        startTransition(async () => {
          try {
            const res = await updateSceneContent(sceneId, debouncedContent);
            if (res.success) {
              lastSavedRef.current = debouncedContent;
              setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              setUnsavedChanges(false);
            } else {
              setSaveStatus(false, "Sync Error");
            }
          } catch (err) {
            setSaveStatus(false, "Error");
          }
        });
      }
    };

    performSave();
  }, [debouncedContent, sceneId, setUnsavedChanges, isLoading, setSaveStatus, isAiLoading]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    contentRef.current = newContent;
    setUnsavedChanges(true);
    setWordCount(calculateWords(newContent));
  };

  // EARLY RETURN FOR MISSING SCENE ID
  if (!sceneId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-base-100/50 border border-dashed border-base-300 rounded-xl">
        <BookOpen className="w-12 h-12 opacity-10 mb-4 text-primary" />
        <p className="text-xs font-black uppercase tracking-widest opacity-30">Select a scene to begin</p>
      </div>
    );
  }

  if (isLoading || content === null) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-base-100">
        <Loader2 className="w-6 h-6 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden relative">
      <main className="flex-grow overflow-hidden relative bg-base-100 flex flex-col">
        <div className="flex-grow overflow-hidden relative">
          <Editor 
            ref={editorRef} 
            key={sceneId} 
            initialContent={content} 
            bookId={bookId}
            sceneId={sceneId}
            activeAiProfileId={activeAiProfileId}
            onChange={handleContentChange} 
          />
        </div>

        <AiProposalBox 
          proposal={aiProposal}
          isLoading={isAiLoading}
          error={aiError}
          promptBlueprint={promptBlueprint}
          onAccept={handleAcceptProposal}
          onDiscard={clearProposal}
        />
      </main>

      <footer className="bg-base-200 p-3 px-8 flex justify-between items-center border-t border-base-300 shrink-0 z-20 rounded-b-xl">
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-base-content/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_5px_rgba(var(--p))]"></div>
            <span>Scene: <span className="text-base-content font-mono tracking-tighter text-[11px]">{wordCount.toLocaleString()}</span> Words</span>
          </div>
          <div className="divider divider-horizontal mx-0 h-4 opacity-20"></div>
          <span className="opacity-40">Writing Mode: Professional</span>
        </div>

        <div className="hidden lg:block text-[9px] font-bold opacity-20 uppercase tracking-[0.3em]">
          HOMO Engine v2.3 / Drafting Mode
        </div>

        <div className="flex items-center gap-3">
          {/* AI PERSONA SELECTOR */}
          {!isAiLoading && <AiProfileSelector />}

          {/* FOCUS MODE TOGGLE */}
          <button 
            type="button"
            className={`btn btn-xs btn-square transition-all ${isFocusMode ? 'btn-primary shadow-lg shadow-primary/20' : 'btn-ghost text-base-content/30 hover:text-primary'}`}
            onClick={toggleFocusMode}
            title="Focus Mode (Esc)"
          >
            <Maximize2 size={14} />
          </button>

          <button 
            type="button"
            className={`btn btn-xs gap-2 ${isAiLoading ? 'btn-disabled bg-base-300' : 'btn-primary shadow-lg shadow-primary/20 hover:scale-[1.02]'} transition-all px-4`}
            onMouseDown={(e) => { 
              e.preventDefault(); 
              if (!isAiLoading && sceneId) startStream(bookId, sceneId, activeAiProfileId || undefined); 
            }}
            disabled={isAiLoading}
          >
            {isAiLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span className="text-[10px] font-black uppercase tracking-tight">Generate AI ✨</span>
          </button>

          <div className="join bg-base-300/50 p-0.5 rounded-lg border border-base-300">
             <button className="btn btn-ghost btn-xs btn-square join-item hover:bg-base-100 text-base-content/50" title="Undo" onClick={() => editorRef.current?.undo()}><Undo2 size={14} /></button>
             <button className="btn btn-ghost btn-xs btn-square join-item hover:bg-base-100 text-base-content/50" title="Redo" onClick={() => editorRef.current?.redo()}><Redo2 size={14} /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}
