'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams, useRouter } from 'next/navigation';
import { updateScenePromptGoals, toggleCharacterInScene, updateScene } from '@/app/actions/scene.actions';
import { Sparkles, Users, RefreshCw, Target, X, Library, Download, Cpu, Terminal as TerminalIcon, ShieldCheck, Database, PenTool, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { compileManuscript, getPromptTemplates } from '@/app/actions/book.actions';
import { getAiProfiles } from '@/app/actions/ai.actions';
import InspectorSection from './InspectorSection';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SceneTab({ book }: { book: any }) {
  const params = useParams();
  const router = useRouter();
  const activeSceneId = params.sceneId as string;
  const activeBookId = params.bookId as string;
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);
  
  const chapters = useWorkspaceStore(state => state.chapters);
  const updateSceneLock = useWorkspaceStore(state => state.updateSceneLock);
  
  const activeAiProfileId = useWorkspaceStore(state => state.activeAiProfileId);
  const setActiveAiProfileId = useWorkspaceStore(state => state.setActiveAiProfileId);
  const activePromptTemplateId = useWorkspaceStore(state => state.activePromptTemplateId);
  const setActivePromptTemplateId = useWorkspaceStore(state => state.setActivePromptTemplateId);

  const [aiProfiles, setAiProfiles] = useState<any[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    getAiProfiles().then(setAiProfiles);
    getPromptTemplates().then(setPromptTemplates);
  }, []);

  // Get reactive scene from store
  const scene = chapters.flatMap((ch: any) => ch.scenes).find((s: any) => s.id === activeSceneId);
  const isLocked = scene?.isLocked || false;

  useEffect(() => {
    if (scene) {
      const targetProfile = scene.defaultAiProfileId || book.defaultAiProfileId || null;
      const targetTemplate = scene.defaultPromptTemplateId || book.defaultPromptTemplateId || null;
      setActiveAiProfileId(targetProfile);
      setActivePromptTemplateId(targetTemplate);
    }
  }, [scene?.id, book.defaultAiProfileId, book.defaultPromptTemplateId, setActiveAiProfileId, setActivePromptTemplateId]);

  const handleSceneAiProfileChange = async (id: string | null) => {
    if (!activeSceneId || isLocked) return;
    const val = id || null;
    setActiveAiProfileId(val);
    await updateScene(activeSceneId, { defaultAiProfileId: val });
  };

  const handleScenePromptTemplateChange = async (id: string | null) => {
    if (!activeSceneId || isLocked) return;
    const val = id || null;
    setActivePromptTemplateId(val);
    await updateScene(activeSceneId, { defaultPromptTemplateId: val });
  };

  const handleToggleLock = async () => {
    if (!activeSceneId) return;
    
    const nextState = !isLocked;
    
    // 1. Instant UI Update (Zustand)
    updateSceneLock(activeSceneId, nextState);
    
    try {
      // 2. Persist to DB
      const res = await updateScene(activeSceneId, { isLocked: nextState });
      
      if (!res.success) {
        // Revert if DB failed
        updateSceneLock(activeSceneId, !nextState);
        setSaveStatus(false, "Lock Error");
      }
    } catch (err) {
      updateSceneLock(activeSceneId, !nextState);
    }
  };

  const [localGoals, setLocalSceneGoals] = useState(scene?.promptGoals || '');
  const [localNarrativePosition, setLocalNarrativePosition] = useState(scene?.narrativePosition || 'Metà');
  const debouncedGoals = useDebounce(localGoals, 1500);
  
  const isDirtyRef = useRef(false);
  const lastKnownSceneId = useRef(activeSceneId);

  useEffect(() => {
    if (scene?.promptGoals !== localGoals || scene?.narrativePosition !== localNarrativePosition) {
      if (!isDirtyRef.current || lastKnownSceneId.current !== activeSceneId) {
        setLocalSceneGoals(scene?.promptGoals || '');
        setLocalNarrativePosition(scene?.narrativePosition || 'Metà');
        isDirtyRef.current = false;
        lastKnownSceneId.current = activeSceneId;
      }
    }
  }, [activeSceneId, scene?.promptGoals, scene?.narrativePosition]);

  useEffect(() => {
    const hasChanged = debouncedGoals !== (scene?.promptGoals || '');
    if (!debouncedGoals && !isDirtyRef.current) return;

    if (isDirtyRef.current && hasChanged && activeSceneId && !isLocked) {
      setSaveStatus(true, null);
      startTransition(async () => {
        const res = await updateScenePromptGoals(activeSceneId, debouncedGoals);
        if (res.success) {
          setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          isDirtyRef.current = false;
        } else {
          setSaveStatus(false, "Sync Error");
        }
      });
    }
  }, [debouncedGoals, activeSceneId, setSaveStatus, scene?.promptGoals, isLocked]);

  const handleNarrativePositionChange = async (val: string) => {
    if (isLocked) return;
    setLocalNarrativePosition(val);
    if (!activeSceneId) return;
    setSaveStatus(true, null);
    const res = await updateScene(activeSceneId, { narrativePosition: val });
    if (res.success) {
      setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleCompileScene = async () => {
    if (!activeBookId || !activeSceneId) return;
    setIsCompiling(true);
    try {
      const res = await compileManuscript(activeBookId, undefined, activeSceneId);
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Scene_${scene?.sceneNumber || 'X'}_${scene?.title.replace(/\s+/g, '_')}.md`;
        a.click();
      }
    } catch (err) { console.error(err); } finally { setIsCompiling(false); }
  };

  if (!activeSceneId) return null;

  return (
    <div className="p-4 space-y-1 animate-in fade-in slide-in-from-right-2 duration-300 pb-32">
      
      {/* SECTION: SCENE PROTECTION */}
      <div className={`card shadow-md mb-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${isLocked ? 'border-error bg-error/5' : 'border-base-300/50 bg-base-100'}`}>
        <div className="card-body p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-all duration-500 ${isLocked ? 'bg-error text-white' : 'bg-base-200 text-base-content/30'}`}>
                {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Scene Authority</span>
                <span className={`text-[11px] font-black uppercase tracking-tight ${isLocked ? 'text-error' : 'text-base-content/80'}`}>
                  {isLocked ? 'Protected (Read-Only)' : 'Drafting (Editable)'}
                </span>
              </div>
            </div>
            
            {/* POWER TOGGLE - NO MODAL, INSTANT ACTION */}
            <input 
              type="checkbox" 
              className={`toggle toggle-lg ${isLocked ? 'toggle-error' : 'toggle-primary'}`} 
              checked={isLocked}
              onChange={handleToggleLock}
            />
          </div>

          {isLocked && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-error/10 text-error text-[9px] font-black uppercase tracking-tight">
              <AlertTriangle size={12} />
              Editing and AI drafting are disabled.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: AI DIRECTING */}
      <InspectorSection title="AI Directing" icon={ShieldCheck} defaultOpen={false}>
        <div className="form-control w-full">
          <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Tono della scena (Regista)</span></label>
          <select 
            className="select select-bordered select-sm w-full font-bold"
            value={activeAiProfileId || ""}
            onChange={(e) => handleSceneAiProfileChange(e.target.value || null)}
            disabled={isLocked}
          >
            <option value="">Predefinito del Volume</option>
            {aiProfiles.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Posizione Narrativa</span></label>
          <select 
            className="select select-bordered select-sm w-full font-bold"
            value={localNarrativePosition}
            onChange={(e) => handleNarrativePositionChange(e.target.value)}
            disabled={isLocked}
          >
            <option value="Inizio">Inizio (Beginning)</option>
            <option value="Metà">Metà (Middle/Rising Action)</option>
            <option value="Climax">Climax</option>
            <option value="Epilogo">Epilogo (Resolution)</option>
          </select>
        </div>

        <div className="divider my-1 opacity-10"></div>

        <InspectorSection title="Advanced Prompt Engineering" icon={TerminalIcon} collapsible={false}>
          <div className="form-control w-full">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Template Override</span></label>
            <select 
              className="select select-bordered select-xs w-full font-bold"
              value={activePromptTemplateId || ""}
              onChange={(e) => handleScenePromptTemplateChange(e.target.value || null)}
              disabled={isLocked}
            >
              <option value="">Global Pipeline</option>
              {promptTemplates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
        </InspectorSection>
      </InspectorSection>

      {/* SECTION 2: THE STAGE */}
      <InspectorSection title="The Stage" icon={Users} defaultOpen={true}>
        <div className="form-control w-full">
          <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40 text-base-content/60">Chi è presente qui? (Cast)</span></label>
          <div className="flex flex-wrap gap-2 pt-1">
            {book.charactersList?.map((char: any) => {
              const isSelected = scene?.characters?.some((sc: any) => sc.id === char.id);
              return (
                <button
                  key={char.id}
                  onClick={() => !isLocked && toggleCharacterInScene(activeSceneId, char.id)}
                  className={`btn btn-xs rounded-full px-3 border transition-all ${
                    isSelected 
                      ? 'btn-secondary border-secondary shadow-md font-black' 
                      : 'btn-ghost border-base-300 opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                  } ${isLocked ? 'cursor-not-allowed opacity-20 grayscale' : ''}`}
                  disabled={isLocked}
                >
                  {char.name}
                </button>
              );
            })}
          </div>
          {(!book.charactersList || book.charactersList.length === 0) && (
            <p className="text-[10px] opacity-40 italic py-2">No characters defined in Book Tab.</p>
          )}
        </div>
      </InspectorSection>

      {/* SECTION 3: THE ACTION */}
      <InspectorSection title="The Action" icon={PenTool} defaultOpen={true}>
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2">
              <Sparkles size={10} /> Cosa succede in questa scena? (Beats)
            </span>
          </label>
          <textarea 
            className="textarea textarea-bordered w-full min-h-[250px] font-bold text-xs leading-relaxed"
            placeholder="Scrivi in modo sintetico le azioni in ordine cronologico..." 
            value={localGoals} 
            onChange={(e) => {
              if (isLocked) return;
              isDirtyRef.current = true;
              setLocalSceneGoals(e.target.value);
            }} 
            disabled={isLocked}
          />
          {!isLocked && (
            <div className="flex justify-end gap-2 mt-2 opacity-20">
               <RefreshCw size={10} className={isPending ? 'animate-spin' : ''} />
               <span className="text-[8px] font-black uppercase tracking-tighter text-base-content/60">Auto-syncing Context</span>
            </div>
          )}
        </div>
      </InspectorSection>

      {/* SECTION 4: DATA & EXPORTS */}
      <InspectorSection title="Data & Exports" icon={Database} defaultOpen={false}>
        <button 
          onClick={handleCompileScene}
          disabled={isCompiling}
          className={`btn btn-secondary btn-sm rounded-xl font-black uppercase tracking-widest text-[10px] w-full shadow-lg shadow-primary/20 ${isCompiling ? 'loading' : ''}`}
        >
          <Download size={14} className="mr-2" /> Export Scene (.md)
        </button>
      </InspectorSection>

    </div>
  );
}
