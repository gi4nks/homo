'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { createCharacter, updateCharacter } from '@/app/actions/character.actions';
import { X } from 'lucide-react';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  characterToEdit?: any;
}

export default function CharacterModal({ isOpen, onClose, bookId, characterToEdit }: CharacterModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ name: '', role: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (characterToEdit) {
        setFormData({
          name: characterToEdit.name,
          role: characterToEdit.role || '',
          description: characterToEdit.description || '',
        });
      } else {
        setFormData({ name: '', role: '', description: '' });
      }
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, characterToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    startTransition(async () => {
      setError(null);
      const res = characterToEdit 
        ? await updateCharacter(characterToEdit.id, formData)
        : await createCharacter(bookId, formData);

      if (res.success) {
        onClose();
      } else {
        setError(res.error || "An error occurred");
      }
    });
  };

  return (
    <dialog ref={modalRef} className="modal z-[1000]" onClose={onClose}>
      <div className="modal-box max-w-sm p-0 rounded-xl shadow-2xl border border-base-300 overflow-hidden bg-base-100 text-slate-900">
        <div className="px-6 py-4 bg-base-200 border-b border-base-300 flex justify-between items-center text-primary">
          <h3 className="font-black text-xs uppercase tracking-widest leading-none">
            {characterToEdit ? 'Edit Character' : 'Add Character'}
          </h3>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="alert alert-error text-[10px] font-bold uppercase py-2 rounded-md">
              {error}
            </div>
          )}
          
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Name</span></label>
            <input 
              type="text" 
              className="input input-bordered input-sm w-full font-bold focus:border-primary" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required
            />
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Role</span></label>
            <input 
              type="text" 
              placeholder="Protagonist, Villain..." 
              className="input input-bordered input-sm w-full font-bold focus:border-primary" 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})} 
            />
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Description</span></label>
            <textarea 
              className="textarea textarea-bordered w-full h-32 text-xs leading-relaxed font-medium resize-none border-base-300" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-ghost btn-sm font-black uppercase tracking-widest text-[10px]" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm px-8 font-black uppercase tracking-widest text-[10px]" 
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save Character'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop bg-slate-900/60 backdrop-blur-sm">
        <button>close</button>
      </form>
    </dialog>
  );
}
