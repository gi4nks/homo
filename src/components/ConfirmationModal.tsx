'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal() {
  const { confirmModal, closeConfirmModal } = useWorkspaceStore();

  if (!confirmModal.isOpen) return null;

  return (
    <div className="modal modal-open z-[1000]">
      <div className="modal-box max-w-sm p-0 rounded-3xl shadow-2xl border border-error/20 overflow-hidden bg-white">
        <div className="px-6 py-4 border-b border-error/10 bg-error/5 flex justify-between items-center text-error">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <AlertTriangle size={16} /> {confirmModal.title}
          </h3>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={closeConfirmModal}><X size={18} /></button>
        </div>

        <div className="p-8 text-center space-y-4">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {confirmModal.message}
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 flex justify-center gap-3 border-t border-slate-100">
          <button 
            className="btn btn-ghost btn-sm px-6 font-black uppercase tracking-widest text-[10px] opacity-50"
            onClick={closeConfirmModal}
          >
            Cancel
          </button>
          <button 
            className="btn btn-error btn-sm px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-error/20 rounded-full"
            onClick={() => {
              confirmModal.onConfirm();
              closeConfirmModal();
            }}
          >
            {confirmModal.confirmLabel}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-slate-900/60 backdrop-blur-sm" onClick={closeConfirmModal}></div>
    </div>
  );
}
