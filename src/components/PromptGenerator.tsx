'use client';

import React, { useState, useTransition, useRef } from 'react';
import { generatePromptData } from '@/app/actions/ai.actions';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Terminal, Copy, Check, X, RefreshCw, AlertCircle, Zap } from 'lucide-react';

interface PromptGeneratorProps {
  bookId: string;
  currentSceneId: string;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ bookId, currentSceneId }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const activeAiProfileId = useWorkspaceStore(state => state.activeAiProfileId);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenAndGenerate = () => {
    modalRef.current?.showModal();
    setPrompt(null);
    setError(null);
    
    startTransition(async () => {
      try {
        const generatedPrompt = await generatePromptData(bookId, currentSceneId, activeAiProfileId || undefined);
        setPrompt(generatedPrompt);
      } catch (err) {
        setError('Failed to generate prompt. Please try again.');
      }
    });
  };

  const handleCopy = async () => {
    if (prompt) {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    modalRef.current?.close();
    setPrompt(null);
  };

  return (
    <>
      {/* Demoted Action Button (Technical Utility) */}
      <button 
        className="btn btn-ghost btn-sm rounded-md font-black uppercase tracking-widest text-[9px] gap-2 opacity-40 hover:opacity-100 hover:bg-base-200 transition-all border border-base-300/50"
        onClick={handleOpenAndGenerate}
      >
        <Terminal className="w-3.5 h-3.5" /> 
        Prompt Preview
      </button>

      {/* Global Modal using Native Dialog for correct Z-Index/Stacking Context */}
      <dialog ref={modalRef} className="modal z-[999]">
        <div className="modal-box max-w-2xl p-0 rounded-md shadow-2xl border border-base-300 overflow-hidden bg-white text-slate-900">
          
          <div className="px-6 py-4 bg-slate-100 border-b border-base-300 flex justify-between items-center text-primary">
             <h3 className="font-black text-xs uppercase tracking-widest leading-none">Your Generated Prompt</h3>
             <button className="btn btn-ghost btn-xs btn-circle text-slate-400" onClick={closeModal}>
               <X size={18} />
             </button>
          </div>

          <div className="p-6 bg-white min-h-[300px] flex flex-col">
            {isPending ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-4 animate-pulse">
                 <RefreshCw className="w-10 h-10 text-primary animate-spin opacity-20" />
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Assembling logic...</p>
              </div>
            ) : error ? (
              <div className="flex-grow flex flex-col items-center justify-center text-error gap-2">
                <AlertCircle size={32} />
                <span className="text-xs font-bold">{error}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <textarea 
                  readOnly
                  className="textarea textarea-bordered w-full h-[350px] text-[10px] leading-relaxed font-mono p-4 bg-slate-50 border-base-300 resize-none shadow-inner text-slate-700"
                  value={prompt || ''}
                />
                <div className="flex justify-end gap-3">
                  <button className="btn btn-ghost btn-sm font-black uppercase tracking-widest text-[10px] px-6" onClick={closeModal}>
                    Close
                  </button>
                  <button 
                    className={`btn btn-primary btn-sm flex-grow rounded-md font-black uppercase tracking-widest text-[10px] shadow-lg transition-all ${copied ? 'btn-success text-white border-success' : ''}`}
                    onClick={handleCopy}
                  >
                    {copied ? <><Check size={14} className="mr-2" /> Copied!</> : <><Copy size={14} className="mr-2" /> Copy Full Prompt</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-slate-900/60 backdrop-blur-sm">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default PromptGenerator;
