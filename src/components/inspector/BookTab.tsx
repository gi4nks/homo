'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
  ChevronRight
} from 'lucide-react';
import CharacterModal from '../CharacterModal';
import InspectorSection from './InspectorSection';
import { createCharacter } from '@/app/actions/character.actions';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function BookTab({ book }: { book: any }) {
  const params = useParams();
  const activeBookId = params.bookId as string;
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);
  const openConfirmModal = useWorkspaceStore((state) => state.openConfirmModal);
  
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
  const [localTone, setLocalTone] = useState(book.tone || '');
  const [localAiProfileId, setLocalAiProfileId] = useState(book.defaultAiProfileId || "");
  const [localPromptTemplateId, setLocalPromptTemplateId] = useState(book.defaultPromptTemplateId || "");
  const [newCharName, setNewCharName] = useState("");
  
  useEffect(() => { setLocalTitle(book.title || ''); }, [book.title]);
  useEffect(() => { setLocalSynopsis(book.synopsis || ''); }, [book.synopsis]);
  useEffect(() => { setLocalStyleReference(book.styleReference || ''); }, [book.styleReference]);
  useEffect(() => { setLocalAuthorialIntent(book.authorialIntent || ''); }, [book.authorialIntent]);
  useEffect(() => { setLocalLoreConstraints(book.loreConstraints || ''); }, [book.loreConstraints]);
  useEffect(() => { setLocalTone(book.tone || ''); }, [book.tone]);
  useEffect(() => { setLocalAiProfileId(book.defaultAiProfileId || ""); }, [book.defaultAiProfileId]);
  useEffect(() => { setLocalPromptTemplateId(book.defaultPromptTemplateId || ""); }, [book.defaultPromptTemplateId]);

  const debouncedTitle = useDebounce(localTitle, 1500);
  const debouncedSynopsis = useDebounce(localSynopsis, 1500);
  const debouncedStyleReference = useDebounce(localStyleReference, 1500);
  const debouncedAuthorialIntent = useDebounce(localAuthorialIntent, 1500);
  const debouncedLoreConstraints = useDebounce(localLoreConstraints, 1500);
  const debouncedTone = useDebounce(localTone, 1500);

  useEffect(() => {
    getGenreConfigs().then(setGenres);
    getAiProfiles().then(setAiProfiles);
    getPromptTemplates().then(setPromptTemplates);
  }, []);

  const saveField = async (data: any) => {
    if (!activeBookId) return;
    
    // Check if data actually changed to avoid redundant saves
    const keys = Object.keys(data);
    const hasChanged = keys.some(key => data[key] !== book[key]);
    if (!hasChanged) return;

    setSaveStatus(true, null);
    const res = await updateBookBible(activeBookId, data);
    setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
  };

  useEffect(() => { if (debouncedTitle !== (book.title || '')) saveField({ title: debouncedTitle }); }, [debouncedTitle]);
  useEffect(() => { if (debouncedSynopsis !== (book.synopsis || '')) saveField({ synopsis: debouncedSynopsis }); }, [debouncedSynopsis]);
  useEffect(() => { if (debouncedStyleReference !== (book.styleReference || '')) saveField({ styleReference: debouncedStyleReference }); }, [debouncedStyleReference]);
  useEffect(() => { if (debouncedAuthorialIntent !== (book.authorialIntent || '')) saveField({ authorialIntent: debouncedAuthorialIntent }); }, [debouncedAuthorialIntent]);
  useEffect(() => { if (debouncedLoreConstraints !== (book.loreConstraints || '')) saveField({ loreConstraints: debouncedLoreConstraints }); }, [debouncedLoreConstraints]);
  useEffect(() => { if (debouncedTone !== (book.tone || '')) saveField({ tone: debouncedTone }); }, [debouncedTone]);

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

  return (
    <div className="p-4 space-y-2 animate-in fade-in slide-in-from-left-2 duration-300 pb-32">
      
      {/* SECTION 1: CORE METADATA */}
      <InspectorSection title="Core Metadata" icon={Type} defaultOpen={true}>
        <div className="form-control w-full">
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
          <label className="label py-1">
            <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2">
              <BookOpen size={10} /> Global Synopsis
            </span>
          </label>
          <textarea 
            className={textareaClass}
            value={localSynopsis} 
            onChange={(e) => setLocalSynopsis(e.target.value)} 
            onBlur={() => saveField({ synopsis: localSynopsis })}
            placeholder="The high-level summary..."
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

        <div className="form-control w-full group">
          <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40 group-hover:opacity-100 transition-opacity">Tone & Style Guidelines</span></label>
          <textarea 
            rows={6}
            className={textareaClass + " min-h-[150px]"}
            value={localTone}
            onChange={(e) => setLocalTone(e.target.value)}
            onBlur={() => saveField({ tone: localTone })}
            placeholder="Style rules..."
          />
        </div>
      </InspectorSection>

      {/* SECTION 2: AI GROUNDING */}
      <InspectorSection title="AI Grounding" icon={ShieldCheck}>
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2">
              <Anchor size={10} /> Style Reference Fragment
            </span>
          </label>
          <textarea 
            className={textareaClass}
            value={localStyleReference} 
            onChange={(e) => setLocalStyleReference(e.target.value)} 
            onBlur={() => saveField({ styleReference: localStyleReference })}
            placeholder="Paste your best 3-4 lines here..."
          />
        </div>

        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2">
              <Compass size={10} /> Authorial Intent
            </span>
          </label>
          <input 
            type="text" 
            className={inputClass}
            value={localAuthorialIntent}
            onChange={(e) => setLocalAuthorialIntent(e.target.value)}
            onBlur={() => saveField({ authorialIntent: localAuthorialIntent })}
            placeholder="Define the emotional goal..." 
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
              {promptTemplates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
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
          <label className="label py-1">
            <span className="label-text font-black text-[9px] uppercase opacity-40 flex items-center gap-2">
              <Scroll size={10} /> Lore Constraints
            </span>
          </label>
          <textarea 
            className={textareaClass}
            value={localLoreConstraints} 
            onChange={(e) => setLocalLoreConstraints(e.target.value)} 
            onBlur={() => saveField({ loreConstraints: localLoreConstraints })}
            placeholder="Established rules..."
          />
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
