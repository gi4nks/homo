'use client';

import React, { useState, useEffect, useRef, startTransition, useCallback } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { updateSceneContent, getSceneById, updateScene } from '@/app/actions/scene.actions';
import { updateAppSettings, getPromptTemplates } from '@/app/actions/ai.actions';
import { createSnapshot } from '@/app/actions/snapshot.actions';
import { 
  Undo2, 
  Redo2, 
  Loader2,
  BookOpen,
  Sparkles,
  Maximize2,
  Cpu,
  Layout,
  Lock
} from 'lucide-react';
import Editor, { EditorRef } from './Editor';
import { useAiStream } from '@/hooks/useAiStream';
import AiProposalBox from './editor/AiProposalBox';
import AiProfileSelector from './editor/AiProfileSelector';
import FooterSelector from './editor/FooterSelector';

const DEFAULT_DRAFTING_TEMPLATE_ID = '6bccda93-3238-43c7-8f58-266d69810962';

const AI_MODELS = [
  { provider: 'Google Gemini', models: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5.flash-lite', name: 'Gemini 2.5 Lite' },
    { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash' }
  ]},
  { provider: 'Anthropic Claude', models: [
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
    { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' }
  ]},
  { provider: 'OpenAI GPT', models: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
  ]}
];

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
  const activePromptTemplateId = useWorkspaceStore(state => state.activePromptTemplateId);
  const setActivePromptTemplateId = useWorkspaceStore(state => state.setActivePromptTemplateId);
  const overrideAiProfileId = useWorkspaceStore(state => state.overrideAiProfileId);
  const overridePromptTemplateId = useWorkspaceStore(state => state.overridePromptTemplateId);
  const updateSceneWordCount = useWorkspaceStore(state => state.updateSceneWordCount);
  const { activeProvider, activeModelName, setAiEngine } = useWorkspaceStore();

  const chapters = useWorkspaceStore(state => state.chapters);
  const storeScene = chapters.flatMap(c => c.scenes).find(s => s.id === sceneId);
  const isLocked = storeScene?.isLocked || false;

  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  
  const editorRef = useRef<EditorRef>(null);
  const lastSavedContentRef = useRef<string>('');
  
  // TRACKS IF AI IS REPLACING SELECTION OR APPENDING
  const aiActionContextRef = useRef<{ mode: 'APPEND' | 'REPLACE', range?: { from: number, to: number } }>({ mode: 'APPEND' });

  const { aiProposal, isAiLoading, aiError, promptBlueprint, startStream, clearProposal } = useAiStream();

  useEffect(() => {
    getPromptTemplates().then(setPromptTemplates);
  }, []);

  const persistToDb = useCallback(async (content: string) => {
    if (!sceneId || content === lastSavedContentRef.current) return;
    setSaveStatus(true, null);
    try {
      const res = await updateSceneContent(sceneId, content);
      if (res.success && res.data) {
        lastSavedContentRef.current = content;
        setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setUnsavedChanges(false);
        updateSceneWordCount(sceneId, res.data.wordCount);
      } else setSaveStatus(false, "Sync Error");
    } catch (err) { setSaveStatus(false, "Error"); }
  }, [sceneId, setSaveStatus, setUnsavedChanges, updateSceneWordCount]);

  // --- UNIFIED AI ACTION TRIGGER ---
  const handleAiAction = useCallback(async (instruction: string, selectedText?: string, range?: { from: number, to: number }) => {
    if (!sceneId || isLocked || isAiLoading) return;

    // 1. Determine Mode and Store Range
    aiActionContextRef.current = { 
      mode: selectedText ? 'REPLACE' : 'APPEND',
      range: range 
    };

    // 2. Force Sync
    const liveContent = await editorRef.current?.forceSave();
    if (liveContent === undefined) return;

    // 3. Snapshot
    createSnapshot(sceneId, liveContent, selectedText ? "Auto: Pre-Rewrite" : "Auto: Pre-AI");

    // 4. Stream
    const targetTemplate = overridePromptTemplateId || activePromptTemplateId || DEFAULT_DRAFTING_TEMPLATE_ID;
    startStream(
      bookId, 
      sceneId, 
      overrideAiProfileId || activeAiProfileId || undefined, 
      targetTemplate, 
      instruction, 
      selectedText ? 'REWRITE' : 'DRAFT',
      undefined, 
      undefined, 
      liveContent,
      selectedText
    );
  }, [sceneId, bookId, isLocked, isAiLoading, overridePromptTemplateId, activePromptTemplateId, overrideAiProfileId, activeAiProfileId, startStream]);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAiAction("Continue writing the scene.");
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAiAction, toggleFocusMode]);

  const handleQuickSwitchModel = async (newModel: string) => {
    if (isLocked) return;
    let provider = 'GOOGLE';
    if (newModel.startsWith('claude')) provider = 'ANTHROPIC';
    else if (newModel.startsWith('gpt') || newModel.startsWith('o1')) provider = 'OPENAI';
    setAiEngine(provider, newModel);
    await updateAppSettings({ activeProvider: provider as any, activeModelName: newModel });
  };

  const handleScenePromptTemplateChange = async (id: string | null) => {
    if (!sceneId || isLocked) return;
    setActivePromptTemplateId(id);
    await updateScene(sceneId, { defaultPromptTemplateId: id });
  };

  const calculateWords = (html: string) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
  };

  useEffect(() => {
    if (sceneId) {
      setIsLoading(true);
      getSceneById(sceneId).then(res => {
        if (res.success && res.data) {
          lastSavedContentRef.current = res.data.content || '';
          const initialWordCount = calculateWords(res.data.content || '');
          setWordCount(initialWordCount);
          if (sceneId) updateSceneWordCount(sceneId, initialWordCount);
          setSaveStatus(false, new Date(res.data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        setIsLoading(false);
      });
    }
  }, [sceneId, setSaveStatus, updateSceneWordCount]);

  const handleContentChange = (newContent: string) => {
    if (isLocked) return;
    setUnsavedChanges(true);
    const newWordCount = calculateWords(newContent);
    setWordCount(newWordCount);
    if (sceneId) updateSceneWordCount(sceneId, newWordCount);
  };

  const getActiveModelDisplayName = () => {
    for (const group of AI_MODELS) {
      const model = group.models.find(m => m.id === activeModelName);
      if (model) return model.name;
    }
    return activeModelName || 'Select Engine';
  };

  const activeTemplate = promptTemplates.find(t => t.id === activePromptTemplateId);

  if (!sceneId) return (
    <div className="h-full flex flex-col items-center justify-center bg-base-100/50 border border-dashed border-base-300 rounded-2xl">
      <BookOpen className="w-12 h-12 opacity-10 mb-4 text-primary" />
      <p className="text-xs font-black uppercase tracking-widest opacity-30">Select a scene to begin</p>
    </div>
  );

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center bg-base-100 rounded-2xl">
      <Loader2 className="w-6 h-6 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden relative">
      <main className="flex-1 overflow-hidden relative bg-base-100 flex flex-col">
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <Editor 
            ref={editorRef} 
            key={sceneId} 
            initialContent={lastSavedContentRef.current} 
            bookId={bookId}
            sceneId={sceneId}
            activeAiProfileId={activeAiProfileId}
            activePromptTemplateId={activePromptTemplateId}
            isLocked={isLocked}
            onChange={handleContentChange} 
            onManualSave={persistToDb}
            onAiAction={handleAiAction} 
          />
        </div>

        <AiProposalBox 
          proposal={aiProposal}
          isLoading={isAiLoading}
          error={aiError}
          promptBlueprint={promptBlueprint}
          onAccept={async () => {
            if (isLocked) return;
            
            if (aiActionContextRef.current.mode === 'REPLACE' && aiActionContextRef.current.range) {
              editorRef.current?.replaceRange(aiProposal, aiActionContextRef.current.range);
            } else {
              const formattedAppend = `<p></p><p>${aiProposal.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')}</p>`;
              editorRef.current?.insertContent(formattedAppend);
            }
            
            await editorRef.current?.forceSave();
            clearProposal();
          }}
          onDiscard={clearProposal}
        />
      </main>

      <footer className="bg-base-200/80 backdrop-blur-md p-2 px-6 flex justify-between items-center border-t border-base-300 shrink-0 z-20 h-14">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-base-content/40">
            <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-error animate-pulse' : 'bg-primary opacity-50'}`}></div>
            <span><span className="text-base-content font-mono tracking-tighter text-[11px]">{wordCount.toLocaleString()}</span> Words</span>
            {isLocked && <span className="ml-2 text-error flex items-center gap-1 font-black"><Lock size={10} /> Locked</span>}
          </div>
          
          {!isLocked && (
            <div className="flex items-center gap-2 bg-base-300/30 p-1 rounded-xl border border-base-300/50">
              <FooterSelector label="Engine" value={getActiveModelDisplayName()} icon={Cpu} dropdownWidth="w-64">
                {AI_MODELS.map(group => (
                  <React.Fragment key={group.provider}>
                    <li className="menu-title px-4 py-2 text-[8px] font-black uppercase opacity-30 tracking-widest">{group.provider}</li>
                    {group.models.map(m => (
                      <li key={m.id}>
                        <button className={`text-xs font-bold py-2 px-4 rounded-xl mx-1 my-0.5 ${activeModelName === m.id ? 'bg-primary/10 text-primary' : ''}`} onClick={() => handleQuickSwitchModel(m.id)}>{m.name}</button>
                      </li>
                    ))}
                    <div className="divider my-1 opacity-5"></div>
                  </React.Fragment>
                ))}
              </FooterSelector>

              <FooterSelector label="Template" value={activeTemplate?.name || 'Default'} icon={Layout} dropdownWidth="w-64">
                <li className="menu-title px-4 py-2 text-[8px] font-black uppercase opacity-30 tracking-widest">Logic Selection</li>
                <li><button className={`text-xs font-bold py-2 px-4 rounded-xl mx-1 my-0.5 ${!activePromptTemplateId ? 'bg-primary/10 text-primary' : ''}`} onClick={() => handleScenePromptTemplateChange(null)}>System Default Logic</button></li>
                <div className="divider my-1 opacity-5"></div>
                {promptTemplates.map(t => (
                  <li key={t.id}><button className={`text-xs font-bold py-2 px-4 rounded-xl mx-1 my-0.5 ${activePromptTemplateId === t.id ? 'bg-primary/10 text-primary' : ''}`} onClick={() => handleScenePromptTemplateChange(t.id)}>{t.name}</button></li>
                ))}
              </FooterSelector>

              {!isAiLoading && <AiProfileSelector />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isLocked && (
            <button 
              type="button"
              className={`btn btn-sm btn-square ${isAiLoading ? 'btn-disabled bg-base-300' : 'btn-primary shadow-lg shadow-primary/20 hover:scale-105'} transition-all`}
              onMouseDown={(e) => { e.preventDefault(); handleAiAction("Draft the next part of the story."); }}
              disabled={isAiLoading}
              title="Generate AI (Cmd+Enter)"
            >
              {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>
          )}
          
          <div className="divider divider-horizontal mx-1 h-4 opacity-10"></div>
          
          <div className="join bg-base-300/30 p-0.5 rounded-lg border border-base-300/50">
            <button className={`btn btn-ghost btn-xs btn-square join-item transition-all ${isFocusMode ? 'text-primary' : 'text-base-content/30 hover:text-primary'}`} onClick={toggleFocusMode} title="Focus Mode (Esc)"><Maximize2 size={14} /></button>
            <button className="btn btn-ghost btn-xs btn-square join-item hover:bg-base-100 text-base-content/30" title="Undo" onClick={() => editorRef.current?.undo()} disabled={isLocked}><Undo2 size={14} /></button>
            <button className="btn btn-ghost btn-xs btn-square join-item hover:bg-base-100 text-base-content/30" title="Redo" onClick={() => editorRef.current?.redo()} disabled={isLocked}><Redo2 size={14} /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}
