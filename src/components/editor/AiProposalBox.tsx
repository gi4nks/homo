'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AiProposalBoxProps {
  proposal: string;
  isLoading: boolean;
  error: string | null;
  onAccept: () => void;
  onDiscard: () => void;
}

export default function AiProposalBox({ 
  proposal, 
  isLoading, 
  error, 
  onAccept, 
  onDiscard 
}: AiProposalBoxProps) {
  if (!proposal && !isLoading) return null;

  return (
    <div className="m-4 mx-8 p-6 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-xl animate-in slide-in-from-bottom-4 duration-300 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Sparkles size={16} className="text-indigo-600" />
          </div>
          <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">
            AI Proposal {isLoading && <span className="animate-pulse opacity-50">(Drafting...)</span>}
          </h3>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onDiscard} 
              className="btn btn-ghost btn-xs text-slate-400 hover:text-error hover:bg-error/10 border-none transition-all"
            >
              Discard
            </button>
            <button 
              type="button"
              onClick={onAccept} 
              className="btn btn-primary btn-xs px-4 rounded-full shadow-md shadow-primary/30"
            >
              Accept & Append
            </button>
          </div>
        )}
      </div>
      
      <div className="max-h-64 overflow-y-auto custom-scrollbar p-1 text-[13px] leading-relaxed text-slate-700 font-serif whitespace-pre-wrap italic opacity-80">
        {proposal || (isLoading ? <span className="opacity-30 italic">Connecting to engine...</span> : null)}
        {error && <div className="text-error mt-2 font-sans text-xs">Error: {error}</div>}
      </div>

      {isLoading && (
        <div className="absolute bottom-0 left-0 h-1 bg-indigo-400/20 w-full overflow-hidden rounded-b-2xl">
          <div className="h-full bg-indigo-500 animate-[progress_1.5s_infinite_linear] w-1/3 origin-left"></div>
        </div>
      )}
    </div>
  );
}
