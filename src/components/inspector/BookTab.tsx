'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams } from 'next/navigation';
import { updateBookBible } from '@/app/actions/book.actions';
import { deleteCharacter } from '@/app/actions/character.actions';
import { getGenreConfigs } from '@/app/actions/genreActions';
import { BookOpen, Sparkles, Wand2, Tags, UserPlus, Edit2, Trash2, Type } from 'lucide-react';
import CharacterModal from '../CharacterModal';

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
  const [isPending, startTransition] = useTransition();

  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [charToEdit, setCharToEdit] = useState<any>(null);

  const [localTitle, setLocalTitle] = useState(book.title || '');
  const [localSynopsis, setLocalSynopsis] = useState(book.synopsis || '');
  const [localTone, setLocalTone] = useState(book.tone || '');
  
  // Sync local state when book prop changes (e.g. after revalidation)
  useEffect(() => {
    setLocalTitle(book.title || '');
  }, [book.title]);

  useEffect(() => {
    setLocalSynopsis(book.synopsis || '');
  }, [book.synopsis]);

  useEffect(() => {
    setLocalTone(book.tone || '');
  }, [book.tone]);

  const debouncedTitle = useDebounce(localTitle, 1500);
  const debouncedSynopsis = useDebounce(localSynopsis, 1500);
  const debouncedTone = useDebounce(localTone, 1500);

  useEffect(() => {
    getGenreConfigs().then(setGenres);
  }, []);

  const saveField = async (data: any) => {
    if (!activeBookId) return;
    setSaveStatus(true, null);
    const res = await updateBookBible(activeBookId, data);
    setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
  };

  useEffect(() => {
    if (debouncedTitle !== (book.title || '')) saveField({ title: debouncedTitle });
  }, [debouncedTitle]);

  useEffect(() => {
    if (debouncedSynopsis !== (book.synopsis || '')) saveField({ synopsis: debouncedSynopsis });
  }, [debouncedSynopsis]);

  useEffect(() => {
    if (debouncedTone !== (book.tone || '')) saveField({ tone: debouncedTone });
  }, [debouncedTone]);

  const handleDeleteChar = async (id: string, name: string) => {
    openConfirmModal({
      title: "Delete Character",
      message: `Are you sure you want to delete "${name}"? This will remove them from all scenes.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        setSaveStatus(true, null);
        const res = await deleteCharacter(id);
        setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
      }
    });
  };

  return (
    <div className="p-4 space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
      
      {/* MANUSCRIPT IDENTITY */}
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm" open>
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
          <Type size={12} /> Manuscript Identity
        </summary>
        <div className="collapse-content pt-2">
          <div className="form-control w-full">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Book Title</span></label>
            <input 
              type="text" 
              className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-xl bg-base-100"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="The Name of your Work..." 
            />
          </div>
        </div>
      </details>

      {/* GENRE SELECTION */}
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm" open>
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
          <Tags size={12} /> Literary Genre
        </summary>
        <div className="collapse-content pt-2">
          <select 
            className="select select-bordered select-sm w-full font-bold bg-base-100"
            value={book.genreId || ""}
            onChange={(e) => saveField({ genreId: e.target.value || null })}
          >
            <option value="">None / Manual</option>
            {genres.map(g => (<option key={g.id} value={g.id}>{g.genreName}</option>))}
          </select>
        </div>
      </details>

      {/* SYNOPSIS */}
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm" open>
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-base-content">
          <BookOpen size={12} /> Synopsis
        </summary>
        <div className="collapse-content pt-2">
          <textarea 
            className="textarea textarea-ghost w-full min-h-[150px] text-[11px] leading-relaxed bg-base-100 p-4 border-none focus:ring-0 resize-none custom-scrollbar" 
            value={localSynopsis} 
            onChange={(e) => setLocalSynopsis(e.target.value)} 
          />
        </div>
      </details>

      {/* TONE & STYLE */}
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm">
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
          <Sparkles size={12} /> Tone & Style
        </summary>
        <div className="collapse-content pt-2">
          <textarea 
            className="textarea textarea-ghost w-full min-h-[350px] text-[11px] leading-relaxed bg-base-100 p-4 border-none focus:ring-0 resize-none custom-scrollbar" 
            value={localTone} 
            onChange={(e) => setLocalTone(e.target.value)} 
            placeholder="Noir, academic, poetic..." 
          />
        </div>
      </details>

      {/* MASTER CHARACTERS */}
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm">
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-secondary">
          <Wand2 size={12} /> Master Characters
        </summary>
        <div className="collapse-content space-y-4 pt-2"> 
          <button 
            onClick={() => { setCharToEdit(null); setIsCharModalOpen(true); }} 
            className="btn btn-outline btn-sm btn-block border-dashed border-base-300 text-[9px] font-black tracking-widest"
          >
            <UserPlus size={12} className="mr-2" /> Create Character
          </button>
          <div className="flex flex-col gap-2">
            {book.charactersList?.map((char: any) => (
              <div key={char.id} className="p-3 bg-base-100 rounded-md border border-base-300 shadow-sm flex items-center justify-between group">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-tight truncate">{char.name}</span>
                  {char.role && <span className="text-[8px] font-bold uppercase opacity-40 truncate">{char.role}</span>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn btn-ghost btn-xs btn-square" onClick={() => { setCharToEdit(char); setIsCharModalOpen(true); }}>
                    <Edit2 size={10} />
                  </button>
                  <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDeleteChar(char.id, char.name)}>
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>

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
