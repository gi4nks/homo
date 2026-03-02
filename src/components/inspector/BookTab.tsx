'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { updateBookBible } from '@/app/actions/book.actions';
import { deleteCharacter } from '@/app/actions/character.actions';
import { getGenreConfigs } from '@/app/actions/genreActions';
import { BookOpen, Sparkles, Wand2, Tags, UserPlus, Edit2, Trash2 } from 'lucide-react';
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
  const activeBookId = useWorkspaceStore((state) => state.activeBookId);
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);
  const [genres, setGenres] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // Character Modal State
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [charToEdit, setCharToEdit] = useState<any>(null);

  const [localSynopsis, setLocalSynopsis] = useState(book.synopsis || '');
  const [localTone, setLocalTone] = useState(book.tone || '');
  
  const debouncedSynopsis = useDebounce(localSynopsis, 1500);
  const debouncedTone = useDebounce(localTone, 1500);

  useEffect(() => {
    const load = async () => {
      const data = await getGenreConfigs();
      setGenres(data);
    };
    load();
  }, []);

  const saveField = async (data: any) => {
    if (!activeBookId) return;
    setSaveStatus(true, null);
    const res = await updateBookBible(activeBookId, data);
    setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
  };

  useEffect(() => {
    if (debouncedSynopsis !== (book.synopsis || '')) saveField({ synopsis: debouncedSynopsis });
  }, [debouncedSynopsis]);

  useEffect(() => {
    if (debouncedTone !== (book.tone || '')) saveField({ tone: debouncedTone });
  }, [debouncedTone]);

  const handleDeleteChar = async (id: string) => {
    if (!confirm("Delete this character?")) return;
    setSaveStatus(true, null);
    const res = await deleteCharacter(id);
    setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* GENRE SELECTION */}
      <div className="bg-base-200/50 p-4 rounded-lg border border-base-300 space-y-3 shadow-inner">
        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2 text-primary">
          <Tags size={12} /> Literary Genre
        </label>
        <select 
          className="select select-bordered select-sm w-full font-bold bg-base-100"
          defaultValue={book.genreId || ""}
          onChange={(e) => saveField({ genreId: e.target.value || null })}
        >
          <option value="">None / Manual</option>
          {genres.map(g => (<option key={g.id} value={g.id}>{g.genreName}</option>))}
        </select>
      </div>

      {/* SYNOPSIS ACCORDION */}
      <div className="collapse collapse-arrow bg-base-200/50 border border-base-300 rounded-lg">
        <input type="radio" name="book-accordion" defaultChecked /> 
        <div className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={12} /> Synopsis
        </div>
        <div className="collapse-content"> 
          <textarea 
            className="textarea textarea-ghost w-full h-48 text-[11px] leading-relaxed bg-base-100 p-4 border-none focus:ring-0" 
            value={localSynopsis} 
            onChange={(e) => setLocalSynopsis(e.target.value)} 
          />
        </div>
      </div>

      {/* TONE ACCORDION */}
      <div className="collapse collapse-arrow bg-base-200/50 border border-base-300 rounded-lg">
        <input type="radio" name="book-accordion" /> 
        <div className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
          <Sparkles size={12} /> Tone & Style
        </div>
        <div className="collapse-content"> 
          <textarea 
            className="textarea textarea-ghost w-full h-32 text-[11px] leading-relaxed bg-base-100 p-4 border-none focus:ring-0" 
            value={localTone} 
            onChange={(e) => setLocalTone(e.target.value)} 
            placeholder="Noir, academic, poetic..." 
          />
        </div>
      </div>

      {/* CHARACTERS ACCORDION */}
      <div className="collapse collapse-arrow bg-base-200/50 border border-base-300 rounded-lg">
        <input type="radio" name="book-accordion" /> 
        <div className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-secondary">
          <Wand2 size={12} /> Master Characters
        </div>
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
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 truncate">{char.name}</span>
                  {char.role && <span className="text-[8px] font-bold uppercase opacity-40 truncate">{char.role}</span>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn btn-ghost btn-xs btn-square" onClick={() => { setCharToEdit(char); setIsCharModalOpen(true); }}>
                    <Edit2 size={10} />
                  </button>
                  <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDeleteChar(char.id)}>
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARACTER MODAL INTEGRATION */}
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
