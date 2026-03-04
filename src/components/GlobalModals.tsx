'use client';

import React, { useTransition } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams } from 'next/navigation';
import { createChapter, updateChapter } from '@/app/actions/chapter.actions';
import { createScene, updateScene } from '@/app/actions/scene.actions';
import { X, Hash } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function GlobalModals() {
  const params = useParams();
  const { modal, closeMetadataModal, updateModalData } = useWorkspaceStore();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!modal.title.trim()) return;
    
    startTransition(async () => {
      const { mode, bookId, targetId, title, num } = modal;
      let res;
      
      const resolvedTargetId = targetId || (mode === 'create_scene' ? params.chapterId as string : null);

      if (mode === 'create_chapter') {
        res = await createChapter(bookId, title);
      } else if (mode === 'create_scene') {
        if (!resolvedTargetId) {
          alert("Error: No chapter selected to add scene to.");
          return;
        }
        res = await createScene(resolvedTargetId, title);
      } else if (mode === 'rename_chapter' && targetId) {
        res = await updateChapter(targetId, { title, chapterNumber: num });
      } else if (mode === 'rename_scene' && targetId) {
        res = await updateScene(targetId, { title, sceneNumber: num });
      }
      
      if (res?.success) {
        closeMetadataModal();
      } else {
        alert(res?.error || "Operation failed");
      }
    });
  };

  return (
    <>
      {modal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeMetadataModal}></div>
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                 {modal.mode.includes('rename') ? 'Metadata Editor' : 'New Entry'}
               </h3>
               <button className="btn btn-ghost btn-xs btn-circle" onClick={closeMetadataModal}><X size={16} /></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="form-control w-full">
                  <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Title</span></label>
                  <input 
                    autoFocus 
                    type="text" 
                    className="input input-bordered input-sm w-full font-bold focus:border-slate-900 rounded-md bg-slate-50" 
                    value={modal.title} 
                    onChange={(e) => updateModalData({ title: e.target.value })} 
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()} 
                  />
               </div>
               {modal.mode.includes('rename') && (
                 <div className="form-control w-24">
                    <label className="label py-1"><span className="label-text font-black text-[9px] uppercase opacity-40">Position #</span></label>
                    <div className="flex items-center gap-2">
                       <input 
                        type="number" 
                        className="input input-bordered input-sm w-full font-bold focus:border-slate-900 rounded-md bg-slate-50" 
                        value={modal.num} 
                        onChange={(e) => updateModalData({ num: parseInt(e.target.value) })} 
                       />
                    </div>
                 </div>
               )}
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
               <button className="btn btn-ghost btn-xs font-black uppercase tracking-widest text-slate-400" onClick={closeMetadataModal}>Cancel</button>
               <button className={`btn btn-neutral btn-sm px-8 font-black uppercase tracking-widest ${isPending ? 'loading' : ''}`} onClick={handleConfirm} disabled={!modal.title.trim() || isPending}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal />
    </>
  );
}
