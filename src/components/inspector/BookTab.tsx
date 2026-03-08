'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams } from 'next/navigation';
import { updateBookBible, compileManuscript, getPromptTemplates } from '@/app/actions/book.actions';
import { getAiProfiles } from '@/app/actions/ai.actions';
import { deleteCharacter } from '@/app/actions/character.actions';
import { getGenreConfigs } from '@/app/actions/genreActions';
import { 
  BookOpen, 
  Sparkles, 
  Wand2, 
  Tags, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Type, 
  Library, 
  Download,
  Anchor,
  Compass,
  Scroll,
  Layout,
  Database,
  ShieldCheck,
  FileJson,
  Users,
  Plus,
  X,
  ChevronRight,
  Book as BookIcon,
  Loader2,
  Activity,
  Globe
} from 'lucide-react';
import CharacterModal from '../CharacterModal';
import InspectorSection from './InspectorSection';
import { createCharacter } from '@/app/actions/character.actions';
import { useAiStream } from '@/hooks/useAiStream';
import ReactMarkdown from 'react-markdown';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const MANUSCRIPT_STATUSES = [
  { id: 'Planning', label: 'Planning', color: 'badge-ghost' },
  { id: 'Drafting', label: 'Drafting', color: 'badge-warning' },
  { id: 'In Review', label: 'In Review', color: 'badge-info' },
  { id: 'Completed', label: 'Completed', color: 'badge-success' },
];

export default function BookTab({ book }: { book: any }) {
  const params = useParams();
  const activeBookId = params.bookId as string;
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);
  const openConfirmModal = useWorkspaceStore((state) => state.openConfirmModal);
  const inspectorBindings = useWorkspaceStore(state => state.inspectorBindings);
  
  const [genres, setGenres] = useState<any[]>([]);
  const [aiProfiles, setAiProfiles] = useState<any[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isCompiling, setIsCompiling] = useState(false);

  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [charToEdit, setCharToEdit] = useState<any>(null);

  const [localTitle, setLocalTitle] = useState(book.title || '');
  const [localSynopsis, setLocalSynopsis] = useState(book.synopsis || '');
  const [localStyleReference, setLocalStyleReference] = useState(book.styleReference || '');
  const [localAuthorialIntent, setLocalAuthorialIntent] = useState(book.authorialIntent || '');
  const [localLoreConstraints, setLocalLoreConstraints] = useState(book.loreConstraints || '');
  const [localExistingLoreConstraints, setLocalExistingLoreConstraints] = useState(book.existingLoreConstraints || '');
  const [localTone, setLocalTone] = useState(book.tone || '');
  const [localGlobalAuditReport, setLocalGlobalAuditReport] = useState(book.globalAuditReport || '');
  const [localAiProfileId, setLocalAiProfileId] = useState(book.defaultAiProfileId || "");
  const [localPromptTemplateId, setLocalPromptTemplateId] = useState(book.defaultPromptTemplateId || "");
  const [newCharName, setNewCharName] = useState("");

  const [auditScope, setAuditScope] = useState('entire_book');

  const { aiProposal, isAiLoading, startStream } = useAiStream();
  const [activeAiField, setActiveAiField] = useState<string | null>(null);
  const editorRef = useWorkspaceStore(state => state.editorRef);
  
  useEffect(() => { if (book.title !== undefined && book.title !== localTitle) setLocalTitle(book.title || ''); }, [book.title]);
  useEffect(() => { if (book.synopsis !== undefined && book.synopsis !== localSynopsis) setLocalSynopsis(book.synopsis || ''); }, [book.synopsis]);
  useEffect(() => { if (book.styleReference !== undefined && book.styleReference !== localStyleReference) setLocalStyleReference(book.styleReference || ''); }, [book.styleReference]);
  useEffect(() => { if (book.authorialIntent !== undefined && book.authorialIntent !== localAuthorialIntent) setLocalAuthorialIntent(book.authorialIntent || ''); }, [book.authorialIntent]);
  useEffect(() => { if (book.loreConstraints !== undefined && book.loreConstraints !== localLoreConstraints) setLocalLoreConstraints(book.loreConstraints || ''); }, [book.loreConstraints]);
  useEffect(() => { if (book.existingLoreConstraints !== undefined && book.existingLoreConstraints !== localExistingLoreConstraints) setLocalExistingLoreConstraints(book.existingLoreConstraints || ''); }, [book.existingLoreConstraints]);
  useEffect(() => { if (book.tone !== undefined && book.tone !== localTone) setLocalTone(book.tone || ''); }, [book.tone]);
  useEffect(() => { if (book.globalAuditReport !== undefined && book.globalAuditReport !== localGlobalAuditReport) setLocalGlobalAuditReport(book.globalAuditReport || ''); }, [book.globalAuditReport]);
  useEffect(() => { if (book.defaultAiProfileId !== undefined && book.defaultAiProfileId !== localAiProfileId) setLocalAiProfileId(book.defaultAiProfileId || ""); }, [book.defaultAiProfileId]);
  useEffect(() => { if (book.defaultPromptTemplateId !== undefined && book.defaultPromptTemplateId !== localPromptTemplateId) setLocalPromptTemplateId(book.defaultPromptTemplateId || ""); }, [book.defaultPromptTemplateId]);

  const debouncedTitle = useDebounce(localTitle, 1500);
  const debouncedSynopsis = useDebounce(localSynopsis, 1500);
  const debouncedStyleReference = useDebounce(localStyleReference, 1500);
  const debouncedAuthorialIntent = useDebounce(localAuthorialIntent, 1500);
  const debouncedLoreConstraints = useDebounce(localLoreConstraints, 1500);
  const debouncedExistingLoreConstraints = useDebounce(localExistingLoreConstraints, 1500);
  const debouncedTone = useDebounce(localTone, 1500);
  const debouncedGlobalAuditReport = useDebounce(localGlobalAuditReport, 1500);

  useEffect(() => {
    getGenreConfigs().then(setGenres);
    getAiProfiles().then(setAiProfiles);
    getPromptTemplates().then(setPromptTemplates);
  }, []);

  const saveField = useCallback(async (data: any) => {
    if (!activeBookId) return;
    const keys = Object.keys(data);
    const hasChanged = keys.some(key => data[key] !== book[key]);
    if (!hasChanged) return;

    setSaveStatus(true, null);
    const res = await updateBookBible(activeBookId, data);
    setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
  }, [activeBookId, book, setSaveStatus]);

  useEffect(() => { if (debouncedTitle !== (book.title || '')) saveField({ title: debouncedTitle }); }, [debouncedTitle, book.title, saveField]);
  useEffect(() => { if (debouncedSynopsis !== (book.synopsis || '')) saveField({ synopsis: debouncedSynopsis }); }, [debouncedSynopsis, book.synopsis, saveField]);
  useEffect(() => { if (debouncedStyleReference !== (book.styleReference || '')) saveField({ styleReference: debouncedStyleReference }); }, [debouncedStyleReference, book.styleReference, saveField]);
  useEffect(() => { if (debouncedAuthorialIntent !== (book.authorialIntent || '')) saveField({ authorialIntent: debouncedAuthorialIntent }); }, [debouncedAuthorialIntent, book.authorialIntent, saveField]);
  useEffect(() => { if (debouncedLoreConstraints !== (book.loreConstraints || '')) saveField({ loreConstraints: debouncedLoreConstraints }); }, [debouncedLoreConstraints, book.loreConstraints, saveField]);
  useEffect(() => { if (debouncedExistingLoreConstraints !== (book.existingLoreConstraints || '')) saveField({ existingLoreConstraints: debouncedExistingLoreConstraints }); }, [debouncedExistingLoreConstraints, book.existingLoreConstraints, saveField]);
  useEffect(() => { if (debouncedTone !== (book.tone || '')) saveField({ tone: debouncedTone }); }, [debouncedTone, book.tone, saveField]);
  useEffect(() => { if (debouncedGlobalAuditReport !== (book.globalAuditReport || '')) saveField({ globalAuditReport: debouncedGlobalAuditReport }); }, [debouncedGlobalAuditReport, book.globalAuditReport, saveField]);

  // --- MACRO AUDIT LOGIC ---
  const handleRunMacroAudit = async () => {
    if (isAiLoading) return;
    
    // 1. Gather all scenes based on scope
    let scenesToAudit: any[] = [];
    if (auditScope === 'entire_book') {
      scenesToAudit = book.chapters.flatMap((c: any) => c.scenes);
    } else {
      const targetChapter = book.chapters.find((c: any) => c.id === auditScope);
      if (targetChapter) scenesToAudit = targetChapter.scenes;
    }

    if (scenesToAudit.length === 0) return;

    // 2. Concatenate text with dividers
    const activeSceneId = params.sceneId as string;
    let concatenatedText = `MACRO AUDIT SCOPE: ${auditScope === 'entire_book' ? 'ENTIRE MANUSCRIPT' : 'SINGLE CHAPTER'}\n\n`;

    scenesToAudit.forEach((s: any) => {
      // Use live TipTap text if this is the active scene
      const text = (s.id === activeSceneId && editorRef) 
        ? editorRef.getText() 
        : s.content.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' '); // Basic HTML to Text
        
      concatenatedText += `\n--- [SCENE: ${s.title}] ---\n\n${text}\n`;
    });

    // 3. Trigger Stream with specialized template/persona
    setActiveAiField('macroAudit');

    await startStream(
      activeBookId,
      null,
      undefined, 
      undefined, 
      "Perform a Macro Continuity Audit on the provided text. Identify plot holes, character inconsistencies, and structural issues across multiple scenes. Provide a comprehensive report.",
      'ANALYZE',
      undefined,
      undefined,
      concatenatedText, // Injected as {{sceneText}}
      "Analyze multiple scenes for continuity and structural integrity."
    );
  };

  // --- MAGIC AI HANDLER ---
  const handleMagicAi = async (fieldId: string, currentVal: string) => {
    const binding = inspectorBindings[fieldId];
    if (!binding?.templateId || isAiLoading) return;

    setActiveAiField(fieldId);
    await startStream(
      activeBookId,
      params.sceneId as string || null, 
      binding.personaId || undefined,
      binding.templateId,
      "Refine or expand this content based on the project context.",
      'DRAFT',
      undefined,
      undefined,
      undefined,
      currentVal || "Provide a suggestion based on the context."
    );
  };

  useEffect(() => {
    if (aiProposal && isAiLoading && activeAiField) {
      if (activeAiField === 'globalSynopsis') setLocalSynopsis(aiProposal);
      if (activeAiField === 'tone') setLocalTone(aiProposal);
      if (activeAiField === 'styleReference') setLocalStyleReference(aiProposal);
      if (activeAiField === 'authorialIntent') setLocalAuthorialIntent(aiProposal);
      if (activeAiField === 'loreConstraints') setLocalLoreConstraints(aiProposal);
      if (activeAiField === 'existingLoreConstraints') setLocalExistingLoreConstraints(aiProposal);
      if (activeAiField === 'macroAudit') setLocalGlobalAuditReport(aiProposal);
    }
    if (!isAiLoading) setActiveAiField(null);
  }, [aiProposal, isAiLoading, activeAiField]);

  const handleAddChar = async () => {
    if (!newCharName.trim() || !activeBookId) return;
    setSaveStatus(true, "Saving...");
    const res = await createCharacter(activeBookId, { name: newCharName.trim() });
    if (res.success) {
      setNewCharName("");
      setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setSaveStatus(false, "Error");
    }
  };

  const handleAiProfileChange = (id: string) => {
    const value = id || null;
    setLocalAiProfileId(id || "");
    saveField({ defaultAiProfileId: value });
  };

  const handlePromptTemplateChange = (id: string) => {
    const value = id || null;
    setLocalPromptTemplateId(id || "");
    saveField({ defaultPromptTemplateId: value });
  };

  const handleCompile = async () => {
    if (!activeBookId) return;
    setIsCompiling(true);
    try {
      const res = await compileManuscript(activeBookId);
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.title.replace(/\s+/g, '_')}_Manuscript.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) { console.error(err); } finally { setIsCompiling(false); }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/export/backup');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homo_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) { console.error(err); }
  };

  const handleDeleteChar = async (id: string, name: string) => {
    openConfirmModal({
      title: "Delete Character",
      message: `Delete "${name}"?`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        setSaveStatus(true, null);
        const res = await deleteCharacter(id);
        setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
      }
    });
  };

  const inputClass = "bg-slate-50 dark:bg-base-300 border border-base-300/50 dark:border-base-100 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-2 transition-all font-bold text-xs w-full";
  const textareaClass = "textarea bg-slate-50 dark:bg-base-300 border border-base-300/50 dark:border-base-100 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 transition-all text-[11px] leading-relaxed w-full resize-none custom-scrollbar shadow-inner min-h-[100px]";

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

  const currentStatus = MANUSCRIPT_STATUSES.find(s => s.id === (book.status || 'Planning')) || MANUSCRIPT_STATUSES[0];

  return (
    <div className="p-4 space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 pb-32">
      
      {/* SECTION 1: CORE METADATA */}
      <InspectorSection title="Core Metadata" icon={Type} defaultOpen={true}>
        <div className="form-control w-full relative group/field">
          <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Book Title</span></label>
          <input 
            type="text" 
            className={inputClass}
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => saveField({ title: localTitle })}
            placeholder="Book Title..." 
          />
        </div>

        <div className="form-control w-full">
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <BookOpen size={10} className="flex-shrink-0" /> Global Synopsis
              </span>
            </label>
            {renderMagicButton('globalSynopsis', localSynopsis)}
          </div>
          <textarea 
            className={textareaClass}
            value={localSynopsis} 
            onChange={(e) => setLocalSynopsis(e.target.value)} 
            onBlur={() => saveField({ synopsis: localSynopsis })}
            placeholder="The high-level summary..."
            disabled={isAiLoading && activeAiField === 'globalSynopsis'}
          />
        </div>

        <div className="form-control w-full group">
          <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40 group-hover:opacity-100 transition-opacity">Genre</span></label>
          <select 
            className="select select-bordered select-sm w-full font-bold bg-slate-50 dark:bg-base-300 rounded-lg"
            value={book.genreId || ""}
            onChange={(e) => saveField({ genreId: e.target.value || null })}
          >
            <option value="">None</option>
            {genres.map(g => (<option key={g.id} value={g.id}>{g.genreName}</option>))}
          </select>
        </div>

        <div className="form-control w-full">
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 truncate">Tone & Style Guidelines</span>
            </label>
            {renderMagicButton('tone', localTone)}
          </div>
          <textarea 
            rows={6}
            className={textareaClass + " min-h-[150px]"}
            value={localTone}
            onChange={(e) => setLocalTone(e.target.value)}
            onBlur={() => saveField({ tone: localTone })}
            placeholder="Style rules..."
            disabled={isAiLoading && activeAiField === 'tone'}
          />
        </div>
      </InspectorSection>

      {/* SECTION: MANUSCRIPT STATUS */}
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl mb-4 relative z-20">
        <div className="card-body p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-base-200 text-base-content/40`}>
                <Activity size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Manuscript Status</span>
                <div className={`badge ${currentStatus.color} badge-xs font-black uppercase py-2 px-3 mt-0.5`}>
                  {currentStatus.label}
                </div>
              </div>
            </div>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                <Edit2 size={14} className="opacity-40" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-100 rounded-xl border border-base-200 w-48 mt-2 font-bold uppercase text-[9px] tracking-widest animate-in fade-in zoom-in-95 duration-200">
                <li className="menu-title opacity-30 text-[8px] mb-1">Set Current Phase</li>
                {MANUSCRIPT_STATUSES.map(status => (
                  <li key={status.id}>
                    <button 
                      type="button"
                      className={`py-2 px-4 rounded-lg flex items-center justify-between mb-1 ${book.status === status.id ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}`}
                      onClick={() => {
                        saveField({ status: status.id });
                        // Force close dropdown by blurring active element
                        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                      }}
                    >
                      {status.label}
                      {book.status === status.id && <ShieldCheck size={12} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AI GROUNDING */}
      <InspectorSection title="AI Grounding" icon={ShieldCheck}>
        <div className="form-control w-full">
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <Anchor size={10} className="flex-shrink-0" /> Style Reference Fragment
              </span>
            </label>
            {renderMagicButton('styleReference', localStyleReference)}
          </div>
          <textarea 
            className={textareaClass}
            value={localStyleReference} 
            onChange={(e) => setLocalStyleReference(e.target.value)} 
            onBlur={() => saveField({ styleReference: localStyleReference })}
            placeholder="Paste your best 3-4 lines here..."
            disabled={isAiLoading && activeAiField === 'styleReference'}
          />
        </div>

        <div className="form-control w-full">
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <Compass size={10} className="flex-shrink-0" /> Authorial Intent
              </span>
            </label>
            {renderMagicButton('authorialIntent', localAuthorialIntent)}
          </div>
          <input 
            type="text" 
            className={inputClass}
            value={localAuthorialIntent}
            onChange={(e) => setLocalAuthorialIntent(e.target.value)}
            onBlur={() => saveField({ authorialIntent: localAuthorialIntent })}
            placeholder="Define the emotional goal..." 
            disabled={isAiLoading && activeAiField === 'authorialIntent'}
          />
        </div>

        <div className="form-control w-full">
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <BookIcon size={10} className="flex-shrink-0" /> Existing Lore Constraints
              </span>
            </label>
            {renderMagicButton('existingLoreConstraints', localExistingLoreConstraints)}
          </div>
          <textarea 
            className={textareaClass}
            value={localExistingLoreConstraints} 
            onChange={(e) => setLocalExistingLoreConstraints(e.target.value)} 
            onBlur={() => saveField({ existingLoreConstraints: localExistingLoreConstraints })}
            placeholder="Definisci le regole immutabili del mondo (es. La magia costa sangue, il deserto è tossico)."
            disabled={isAiLoading && activeAiField === 'existingLoreConstraints'}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-control w-full group">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40 group-hover:opacity-100 transition-opacity">Def. Persona</span></label>
            <select 
              className="select select-bordered select-xs w-full font-bold bg-slate-50 dark:bg-base-300 rounded-lg"
              value={localAiProfileId}
              onChange={(e) => handleAiProfileChange(e.target.value)}
            >
              <option value="">System Default</option>
              {aiProfiles.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
          <div className="form-control w-full group">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40 group-hover:opacity-100 transition-opacity">Def. Template</span></label>
            <select 
              className="select select-bordered select-xs w-full font-bold bg-slate-50 dark:bg-base-300 rounded-lg"
              value={localPromptTemplateId}
              onChange={(e) => handlePromptTemplateChange(e.target.value)}
            >
              <option value="">Global Default</option>
              {promptTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </InspectorSection>

      {/* SECTION 3: GLOBAL CAST - REFACTORED AS LIST */}
      <InspectorSection title="Global Cast" icon={Users}>
        <div className="flex flex-col gap-1 mb-4">
          {book.charactersList?.map((char: any) => (
            <div 
              key={char.id} 
              className="group flex items-center justify-between p-2.5 bg-slate-50 dark:bg-base-300 border border-base-300/30 rounded-xl hover:border-primary/30 transition-all shadow-sm"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer flex-grow min-w-0"
                onClick={() => { setCharToEdit(char); setIsCharModalOpen(true); }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{char.name}</span>
                  {char.role && (
                    <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter truncate">{char.role}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button 
                  className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => { setCharToEdit(char); setIsCharModalOpen(true); }}
                >
                  <ChevronRight size={14} className="opacity-40" />
                </button>
                <button 
                  onClick={() => handleDeleteChar(char.id, char.name)}
                  className="btn btn-ghost btn-xs btn-square text-error opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {(!book.charactersList || book.charactersList.length === 0) && (
            <p className="text-[10px] opacity-30 italic py-4 text-center border border-dashed border-base-300 rounded-xl">
              No characters defined yet.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <input 
            type="text"
            className={inputClass + " h-9 !text-[10px] shadow-inner"}
            placeholder="Quick add character name..."
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChar()}
          />
          <button 
            onClick={handleAddChar}
            disabled={!newCharName.trim() || isPending}
            className="btn btn-primary btn-sm h-9 px-4 rounded-xl shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
          </button>
        </div>
      </InspectorSection>

      {/* SECTION 4: WORLDBUILDING */}
      <InspectorSection title="Worldbuilding" icon={Layout}>
        <div className="form-control w-full">
          <div className="flex items-center justify-between w-full mb-1 gap-2">
            <label className="label py-0 flex-1 min-w-0">
              <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2 truncate">
                <Scroll size={10} className="flex-shrink-0" /> Lore Constraints
              </span>
            </label>
            {renderMagicButton('loreConstraints', localLoreConstraints)}
          </div>
          <textarea 
            className={textareaClass}
            value={localLoreConstraints} 
            onChange={(e) => setLocalLoreConstraints(e.target.value)} 
            onBlur={() => saveField({ loreConstraints: localLoreConstraints })}
            placeholder="Established rules..."
            disabled={isAiLoading && activeAiField === 'loreConstraints'}
          />
        </div>
      </InspectorSection>

      {/* SECTION: MACRO CONTINUITY AUDIT */}
      <InspectorSection title="Macro Continuity Audit" icon={Globe} defaultOpen={false}>
        <div className="space-y-4">
          <div className="form-control w-full">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Audit Scope Selection</span></label>
            <select 
              className="select select-bordered select-sm w-full font-bold bg-slate-50 dark:bg-base-300 rounded-lg h-9"
              value={auditScope}
              onChange={(e) => setAuditScope(e.target.value)}
              disabled={isAiLoading}
            >
              <option value="entire_book">Entire Book Manuscript</option>
              <div className="divider my-1 opacity-10"></div>
              {book.chapters.map((c: any) => (
                <option key={c.id} value={c.id}>Chapter {c.chapterNumber}: {c.title}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleRunMacroAudit}
            disabled={isAiLoading}
            className={`btn btn-primary btn-sm rounded-xl font-black uppercase tracking-widest text-[10px] w-full shadow-lg shadow-primary/20 ${isAiLoading && activeAiField === 'macroAudit' ? 'loading' : ''}`}
          >
            {isAiLoading && activeAiField === 'macroAudit' ? 'Analyzing Manuscript...' : '✨ Run Macro Audit'}
          </button>

          {isAiLoading && activeAiField === 'macroAudit' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tight animate-pulse">
              <Activity size={12} />
              Large payload processing... This may take a minute.
            </div>
          )}

          <div className="form-control w-full">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Global Audit Report</span></label>
            <textarea 
              className={textareaClass + " min-h-[300px] font-mono text-[10px]"}
              value={localGlobalAuditReport} 
              onChange={(e) => setLocalGlobalAuditReport(e.target.value)} 
              onBlur={() => saveField({ globalAuditReport: localGlobalAuditReport })}
              placeholder="Audit results will appear here..."
              disabled={isAiLoading && activeAiField === 'macroAudit'}
            />
          </div>

          {localGlobalAuditReport && (
            <div className="p-4 bg-base-200/50 rounded-xl border border-base-300 prose prose-xs dark:prose-invert max-w-none overflow-y-auto max-h-[400px] custom-scrollbar">
              <ReactMarkdown>{localGlobalAuditReport}</ReactMarkdown>
            </div>
          )}
        </div>
      </InspectorSection>

      {/* SECTION 5: DATA & EXPORTS */}
      <InspectorSection title="Data & Exports" icon={Database}>
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleCompile}
            disabled={isCompiling}
            className={`btn btn-primary btn-sm rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 ${isCompiling ? 'loading' : ''}`}
          >
            <Download size={14} className="mr-2" /> Compile Manuscript (.md)
          </button>
          <button 
            onClick={handleBackup}
            className="btn btn-outline btn-sm rounded-xl font-black uppercase tracking-widest text-[10px] border-base-300"
          >
            <FileJson size={14} className="mr-2" /> Download JSON Backup
          </button>
        </div>
      </InspectorSection>

      {activeBookId && (
        <CharacterModal 
          isOpen={isCharModalOpen} 
          onClose={() => setIsCharModalOpen(false)} 
          bookId={activeBookId} 
          characterToEdit={charToEdit} 
        />
      )}
    </div>
  );
}
