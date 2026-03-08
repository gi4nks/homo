'use client';

import React, { useState, useEffect, useTransition, useRef, useCallback } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams, useRouter } from 'next/navigation';
import { updateScenePromptGoals, toggleCharacterInScene, updateScene } from '@/app/actions/scene.actions';
import { 
  Sparkles, 
  Users, 
  RefreshCw, 
  Target, 
  X, 
  Library, 
  Download, 
  Cpu, 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  Database, 
  PenTool, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Loader2,
  Wand2,
  Search
} from 'lucide-react';
import { compileManuscript, getPromptTemplates } from '@/app/actions/book.actions';
import { getAiProfiles } from '@/app/actions/ai.actions';
import { useAiStream } from '@/hooks/useAiStream';
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
  const inspectorBindings = useWorkspaceStore(state => state.inspectorBindings);
  
  const chapters = useWorkspaceStore(state => state.chapters);
  const updateSceneLock = useWorkspaceStore(state => state.updateSceneLock);
  
  const activeAiProfileId = useWorkspaceStore(state => state.activeAiProfileId);
  const setActiveAiProfileId = useWorkspaceStore(state => state.setActiveAiProfileId);
  const activePromptTemplateId = useWorkspaceStore(state => state.activePromptTemplateId);
  const setActivePromptTemplateId = useWorkspaceStore(state => state.setActivePromptTemplateId);
  const editorRef = useWorkspaceStore(state => state.editorRef);

  const [aiProfiles, setAiProfiles] = useState<any[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isCompiling, setIsCompiling] = useState(false);

  // Separate instance for Inspector AI generation
  const { aiProposal, isAiLoading, startStream } = useAiStream();
  const [activeAiField, setActiveAiField] = useState<string | null>(null);

  useEffect(() => {
    getAiProfiles().then(setAiProfiles);
    getPromptTemplates().then(setPromptTemplates);
  }, []);

  // Get reactive scene from store
  const scene = chapters.flatMap((ch: any) => ch.scenes).find((s: any) => s.id === activeSceneId);
  const isLocked = scene?.isLocked || false;

  const sceneDefaultAiProfileId = scene?.defaultAiProfileId;
  const sceneDefaultPromptTemplateId = scene?.defaultPromptTemplateId;

  useEffect(() => {
    if (scene) {
      const targetProfile = sceneDefaultAiProfileId || book.defaultAiProfileId || null;
      const targetTemplate = sceneDefaultPromptTemplateId || book.defaultPromptTemplateId || null;
      setActiveAiProfileId(targetProfile);
      setActivePromptTemplateId(targetTemplate);
    }
  }, [
    sceneDefaultAiProfileId,
    sceneDefaultPromptTemplateId,
    book.defaultAiProfileId,
    book.defaultPromptTemplateId,
    setActiveAiProfileId,
    setActivePromptTemplateId
  ]);

  const handleSceneAiProfileChange = async (id: string | null) => {
    if (!activeSceneId || isLocked) return;
    const val = id || null;
    setActiveAiProfileId(val);
    
    setSaveStatus(true, null);
    startTransition(async () => {
      try {
        const res = await updateScene(activeSceneId, { defaultAiProfileId: val });
        if (res.success) {
          setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setSaveStatus(false, "Error");
        }
      } catch (err) {
        setSaveStatus(false, "Error");
      }
    });
  };

  const handleScenePromptTemplateChange = async (id: string | null) => {
    if (!activeSceneId || isLocked) return;
    const val = id || null;
    setActivePromptTemplateId(val);

    setSaveStatus(true, null);
    startTransition(async () => {
      try {
        const res = await updateScene(activeSceneId, { defaultPromptTemplateId: val });
        if (res.success) {
          setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setSaveStatus(false, "Error");
        }
      } catch (err) {
        setSaveStatus(false, "Error");
      }
    });
  };

  const handleToggleLock = async () => {
    if (!activeSceneId) return;
    const nextState = !isLocked;
    updateSceneLock(activeSceneId, nextState);
    try {
      const res = await updateScene(activeSceneId, { isLocked: nextState });
      if (!res.success) {
        updateSceneLock(activeSceneId, !nextState);
        setSaveStatus(false, "Lock Error");
      }
    } catch (err) {
      updateSceneLock(activeSceneId, !nextState);
    }
  };

  const [localGoals, setLocalSceneGoals] = useState(scene?.promptGoals || '');
  const [localAuditReport, setLocalAuditReport] = useState(scene?.auditReport || '');
  const [localNarrativePosition, setLocalNarrativePosition] = useState(scene?.narrativePosition || 'MIDPOINT');
  const debouncedGoals = useDebounce(localGoals, 1500);
  const debouncedAuditReport = useDebounce(localAuditReport, 1500);
  
  const isDirtyRef = useRef(false);
  const lastKnownSceneId = useRef(activeSceneId);

  // Sync AI Stream results into local goals
  useEffect(() => {
    if (aiProposal && isAiLoading) {
      if (activeAiField === 'promptGoals') {
        setLocalSceneGoals(aiProposal);
        isDirtyRef.current = true;
      } else if (activeAiField === 'auditReport') {
        setLocalAuditReport(aiProposal);
        isDirtyRef.current = true;
      }
    }
    if (!isAiLoading) setActiveAiField(null);
  }, [aiProposal, isAiLoading, activeAiField]);

  // --- SYNC STORE -> LOCAL ---
  useEffect(() => {
    // 1. If scene ID changed, force reset local state
    if (lastKnownSceneId.current !== activeSceneId) {
      setLocalSceneGoals(scene?.promptGoals || '');
      setLocalAuditReport(scene?.auditReport || '');
      setLocalNarrativePosition(scene?.narrativePosition || 'MIDPOINT');
      isDirtyRef.current = false;
      lastKnownSceneId.current = activeSceneId;
      return;
    }

    // 2. Sync updates from store ONLY if we are not in the middle of an operation
    // and the store value actually changed from what we have locally.
    if (!isAiLoading) {
      if (!isDirtyRef.current && scene?.promptGoals !== undefined && scene.promptGoals !== localGoals) {
        setLocalSceneGoals(scene.promptGoals);
      }
      if (!isDirtyRef.current && scene?.auditReport !== undefined && scene.auditReport !== localAuditReport) {
        setLocalAuditReport(scene.auditReport);
      }
      if (scene?.narrativePosition !== undefined && scene.narrativePosition !== localNarrativePosition) {
        setLocalNarrativePosition(scene.narrativePosition);
      }
    }
  }, [activeSceneId, scene?.promptGoals, scene?.auditReport, scene?.narrativePosition, isAiLoading]);

  // --- AUTO-SAVE LOGIC ---
  const savePromptGoals = useCallback(async (val: string) => {
    if (!activeSceneId || isLocked || val === scene?.promptGoals) {
      isDirtyRef.current = false;
      return;
    }
    
    setSaveStatus(true, null);
    try {
      const res = await updateScenePromptGoals(activeSceneId, val);
      if (res.success) {
        setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (localGoals === val) isDirtyRef.current = false;
      } else {
        setSaveStatus(false, "Error");
      }
    } catch (err) {
      setSaveStatus(false, "Error");
    }
  }, [activeSceneId, isLocked, scene?.promptGoals, localGoals, setSaveStatus]);

  const saveAuditReport = useCallback(async (val: string) => {
    if (!activeSceneId || isLocked || val === scene?.auditReport) {
      isDirtyRef.current = false;
      return;
    }
    
    setSaveStatus(true, null);
    try {
      const res = await updateScene(activeSceneId, { auditReport: val });
      if (res.success) {
        setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (localAuditReport === val) isDirtyRef.current = false;
      } else {
        setSaveStatus(false, "Error");
      }
    } catch (err) {
      setSaveStatus(false, "Error");
    }
  }, [activeSceneId, isLocked, scene?.auditReport, localAuditReport, setSaveStatus]);

  useEffect(() => {
    if (isDirtyRef.current && !isLocked && !isAiLoading) {
      if (debouncedGoals !== (scene?.promptGoals || '')) {
        savePromptGoals(debouncedGoals);
      }
      if (debouncedAuditReport !== (scene?.auditReport || '')) {
        saveAuditReport(debouncedAuditReport);
      }
    }
  }, [debouncedGoals, debouncedAuditReport, activeSceneId, isLocked, isAiLoading, savePromptGoals, saveAuditReport, scene?.promptGoals, scene?.auditReport]);

  const handleNarrativePositionChange = async (val: string) => {
    if (isLocked || !activeSceneId) return;
    setLocalNarrativePosition(val);
    setSaveStatus(true, null);
    try {
      const res = await updateScene(activeSceneId, { narrativePosition: val });
      if (res.success) {
        setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaveStatus(false, "Error");
      }
    } catch (err) {
      setSaveStatus(false, "Error");
    }
  };

  const handleMagicAi = async (fieldId: string, currentVal: string) => {
    const binding = inspectorBindings[fieldId];
    if (!binding?.templateId || isAiLoading) return;

    setActiveAiField(fieldId);

    // Task 1: Flexible Context Extraction (TipTap live content)
    // We get the current text from the editor via the shared editorRef
    const liveText = editorRef?.getText?.() || "";

    // Task 2: Field-Specific Input Handling
    // If we're auditing, we switch taskType to ANALYZE so prompt-builder 
    // focuses on the sceneText (the live content we just pulled).
    let instruction = "Generate detailed content based on the provided rough idea.";
    let taskType: 'DRAFT' | 'REWRITE' | 'ANALYZE' = 'DRAFT';

    if (fieldId === 'auditReport') {
      instruction = "Audit the following scene for continuity errors, plot holes, and structural weaknesses. Focus on the provided text.";
      taskType = 'ANALYZE';
    }

    await startStream(
      activeBookId,
      activeSceneId,
      binding.personaId || undefined,
      binding.templateId,
      instruction,
      taskType,
      undefined,
      undefined,
      liveText, // Passes editor content -> {{sceneText}} in prompt-builder
      currentVal || "Analyze current context."
    );
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
            <option value="OPENING">Inizio</option>
            <option value="RISING_ACTION">Sviluppo (Rising Action)</option>
            <option value="MIDPOINT">Metà (Midpoint)</option>
            <option value="CLIMAX">Climax</option>
            <option value="FALLING_ACTION">Discesa (Falling Action)</option>
            <option value="RESOLUTION">Risoluzione</option>
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
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <Sparkles size={10} className="flex-shrink-0" /> Cosa succede in questa scena? (Beats)
              </span>
            </label>
            {!isLocked && renderMagicButton('promptGoals', localGoals)}
          </div>

          <textarea 
            className={`textarea textarea-bordered w-full min-h-[250px] font-bold text-xs leading-relaxed shadow-inner focus:bg-base-50 transition-colors ${isAiLoading && activeAiField === 'promptGoals' ? 'opacity-50 cursor-wait' : ''}`}
            placeholder="Scrivi in modo sintetico le azioni in ordine cronologico..." 
            value={localGoals} 
            onChange={(e) => {
              if (isLocked) return;
              isDirtyRef.current = true;
              setLocalSceneGoals(e.target.value);
            }} 
            onBlur={() => savePromptGoals(localGoals)}
            disabled={isLocked || (isAiLoading && activeAiField === 'promptGoals')}
          />
          
          {!isLocked && (
            <div className="flex justify-end gap-2 mt-2 opacity-20">
               <RefreshCw size={10} className={(isPending || isAiLoading) ? 'animate-spin' : ''} />
               <span className="text-[8px] font-black uppercase tracking-tighter text-base-content/60">Auto-syncing Context</span>
            </div>
          )}
        </div>
      </InspectorSection>

      {/* SECTION: CONTINUITY AUDITOR */}
      <InspectorSection title="Continuity Auditor" icon={Search} defaultOpen={false}>
        <div className="form-control w-full">
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <Search size={10} className="flex-shrink-0" /> AUDIT & CONTINUITY REPORT
              </span>
            </label>
            {!isLocked && renderMagicButton('auditReport', localAuditReport)}
          </div>

          <textarea 
            className={`textarea textarea-bordered w-full min-h-[200px] font-mono text-[10px] leading-relaxed shadow-inner focus:bg-base-50 transition-colors ${isAiLoading && activeAiField === 'auditReport' ? 'opacity-50 cursor-wait' : ''}`}
            placeholder="No audit report generated yet. Use the Magic AI button to audit this scene's continuity." 
            value={localAuditReport} 
            onChange={(e) => {
              if (isLocked) return;
              isDirtyRef.current = true;
              setLocalAuditReport(e.target.value);
            }} 
            onBlur={() => saveAuditReport(localAuditReport)}
            disabled={isLocked || (isAiLoading && activeAiField === 'auditReport')}
          />
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
