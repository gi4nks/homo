'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { createGenreConfig, updateGenreConfig } from '@/app/actions/genreActions';
import { X, Save, Check, Wand2 } from 'lucide-react';

interface GenreConfig {
  id: string;
  genreName: string;
  customPromptRules: string;
}

interface GenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingConfig: GenreConfig | null;
}

export default function GenreModal({ isOpen, onClose, editingConfig }: GenreModalProps) {
  const [genreName, setGenreName] = useState('');
  const [customPromptRules, setCustomPromptRules] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (editingConfig) {
      setGenreName(editingConfig.genreName);
      setCustomPromptRules(editingConfig.customPromptRules);
    } else {
      setGenreName('');
      setCustomPromptRules('');
    }
  }, [editingConfig, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName || !customPromptRules) return;

    startTransition(async () => {
      try {
        if (editingConfig) {
          await updateGenreConfig(editingConfig.id, { genreName, customPromptRules });
        } else {
          await createGenreConfig({ genreName, customPromptRules });
        }
        onClose();
      } catch (error) {
        console.error(error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open z-[100]">
      <div className="modal-box max-w-2xl p-0 rounded-xl shadow-2xl border border-slate-300 overflow-hidden bg-white text-slate-900">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg">
                  <Wand2 size={18} />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                    {editingConfig ? 'Edit Genre Config' : 'New Genre Config'}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Instruction Pipeline Settings</p>
               </div>
            </div>
            <button 
              type="button" 
              className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-slate-900" 
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6 bg-white">
            <div className="flex flex-col gap-2">
              <label className="font-black text-[10px] uppercase text-slate-500 tracking-widest px-1">
                Target Genre Name
              </label>
              <input 
                required 
                autoFocus 
                type="text" 
                placeholder="e.g. Fantasy, Noir, Poetry..." 
                className="input input-bordered input-sm w-full font-bold focus:border-slate-900 rounded-md bg-slate-50 focus:bg-white transition-all h-10" 
                value={genreName}
                onChange={(e) => setGenreName(e.target.value)}
              />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight px-1">
                Match exactly your Book Bible's genre field
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-black text-[10px] uppercase text-slate-500 tracking-widest px-1">
                Custom Prompt Rules
              </label>
              <textarea 
                required 
                rows={12}
                placeholder="Describe specific rules (e.g. 'Use 1st person POV', 'Focus on sensory details', 'No dialogue tags')..." 
                className="textarea textarea-bordered w-full text-[11px] leading-relaxed p-5 font-mono text-slate-600 focus:border-slate-900 rounded-md bg-slate-50 focus:bg-white transition-all resize-none custom-scrollbar shadow-inner"
                value={customPromptRules}
                onChange={(e) => setCustomPromptRules(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-slate-50 flex justify-end gap-4 border-t border-slate-100">
            <button 
              type="button" 
              className="btn btn-ghost btn-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900" 
              onClick={onClose}
            >
              Discard
            </button>
            <button 
              type="submit" 
              className={`btn btn-neutral btn-sm px-10 font-black uppercase tracking-widest shadow-lg transition-all ${isPending ? 'loading' : ''}`}
              disabled={isPending}
            >
              {!isPending && <Check size={16} className="mr-2" />}
              {isPending ? 'Saving...' : 'Forge Rules'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
    </dialog>
  );
}
