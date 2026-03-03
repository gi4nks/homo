'use client';

import React from 'react';
import { Sparkles, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface AiProposalBoxProps {
  proposal: string;
  isLoading: boolean;
  error: string | null;
  promptBlueprint: string | null;
  onAccept: () => void;
  onDiscard: () => void;
}

export default function AiProposalBox({ 
  proposal, 
  isLoading, 
  error, 
  promptBlueprint,
  onAccept, 
  onDiscard 
}: AiProposalBoxProps) {
  const [showBlueprint, setShowBlueprint] = React.useState(false);
  
  if (!proposal && !isLoading) return null;

  return (
    <div className="m-4 mx-8 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-xl animate-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <Sparkles size={16} className="text-indigo-500" />
            </div>
            <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest">
              AI Proposal {isLoading && <span className="animate-pulse opacity-50">(Drafting...)</span>}
            </h3>
          </div>

          {/* BLUEPRINT TOGGLE */}
          {promptBlueprint && (
            <button 
              type="button"
              onClick={() => setShowBlueprint(!showBlueprint)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-black uppercase tracking-tighter transition-all ${showBlueprint ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-500/5 text-indigo-500/60 border-indigo-500/20 hover:bg-indigo-500/10'}`}
            >
              <Terminal size={10} />
              Instruction Blueprint
              {showBlueprint ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
        </div>

        {!isLoading && (
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onDiscard} 
              className="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 border-none transition-all"
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

      {/* BLUEPRINT VIEW */}
      {showBlueprint && promptBlueprint && (
        <div className="mb-6 rounded-xl bg-slate-950 p-4 font-mono text-[10px] leading-relaxed text-slate-400 border border-slate-800 shadow-inner max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-indigo-400/50 mb-3 border-b border-slate-800 pb-2">
             <Terminal size={12} />
             <span className="uppercase tracking-[0.2em]">Source Prompt (Injection-Proof Layer)</span>
          </div>
          <pre className="whitespace-pre-wrap break-words">
            {promptBlueprint.split('\n').map((line, i) => {
              if (line.startsWith('<') || line.startsWith('</')) {
                return <span key={i} className="text-amber-500/80 font-black">{line}{'\n'}</span>;
              }
              if (line.startsWith('[') && line.endsWith(']')) {
                return <span key={i} className="text-indigo-400 font-black">{line}{'\n'}</span>;
              }
              return <span key={i}>{line}{'\n'}</span>;
            })}
          </pre>
        </div>
      )}
      
      <div className="max-h-64 overflow-y-auto custom-scrollbar p-1 text-[13px] leading-relaxed text-base-content/80 font-serif whitespace-pre-wrap italic">
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
