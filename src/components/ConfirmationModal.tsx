'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal() {
  const { confirmModal, closeConfirmModal } = useWorkspaceStore();

  if (!confirmModal.isOpen) return null;

  const handleConfirm = () => {
    confirmModal.onConfirm();
    closeConfirmModal();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={closeConfirmModal}
      ></div>

      {/* MODAL BOX */}
      <div className="relative w-full max-w-md bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-base-200 bg-base-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-xl text-error">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-black uppercase tracking-widest text-sm text-base-content/80">
              {confirmModal.title || 'Attention Required'}
            </h3>
          </div>
          <button 
            className="btn btn-ghost btn-xs btn-circle opacity-40 hover:opacity-100" 
            onClick={closeConfirmModal}
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-10">
          <p className="text-base font-medium leading-relaxed text-base-content/70">
            {confirmModal.message}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="px-8 py-6 bg-base-50/50 flex justify-end gap-3 border-t border-base-200">
          <button 
            className="btn btn-ghost btn-sm font-black uppercase tracking-widest text-[10px] px-6" 
            onClick={closeConfirmModal}
          >
            Cancel
          </button>
          <button 
            className="btn btn-error btn-sm font-black uppercase tracking-widest text-[10px] px-8 text-white shadow-lg shadow-error/20" 
            onClick={handleConfirm}
          >
            {confirmModal.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
