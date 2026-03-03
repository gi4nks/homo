'use client';

import React from 'react';
import { Sparkles, Terminal, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (!proposal && !isLoading) return null;

  return (
    <div className={`m-4 mx-8 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-2xl transition-all duration-500 ease-in-out relative overflow-hidden flex flex-col ${
      isExpanded ? 'flex-grow min-h-[60vh] mb-8' : 'h-auto'
    }`}>
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32"></div>

      <div className="flex items-center justify-between mb-4 shrink-0 relative z-10">
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
              Blueprint
              {showBlueprint ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* EXPAND TOGGLE */}
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-ghost btn-xs btn-square text-indigo-500/50 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
            title={isExpanded ? "Collapse" : "Full Preview"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {!isLoading && (
            <div className="flex items-center gap-2 border-l border-indigo-500/20 pl-3 ml-1">
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
      </div>

      {/* BLUEPRINT VIEW (SCROLLABLE INDEPENDENTLY) */}
      {showBlueprint && promptBlueprint && (
        <div className="mb-6 rounded-xl bg-slate-950 p-4 font-mono text-[10px] leading-relaxed text-slate-400 border border-slate-800 shadow-inner max-h-48 overflow-y-auto custom-scrollbar shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <pre className="whitespace-pre-wrap break-words">
            {promptBlueprint.split('\n').map((line, i) => {
              if (line.startsWith('<') || line.startsWith('</')) return <span key={i} className="text-amber-500/80 font-black">{line}{'\n'}</span>;
              if (line.startsWith('[') && line.endsWith(']')) return <span key={i} className="text-indigo-400 font-black">{line}{'\n'}</span>;
              return <span key={i}>{line}{'\n'}</span>;
            })}
          </pre>
        </div>
      )}
      
      {/* MAIN TEXT AREA (DYNAMIC HEIGHT) */}
      <div className={`overflow-y-auto custom-scrollbar p-1 text-[15px] leading-[1.8] text-base-content/90 font-serif whitespace-pre-wrap italic transition-all duration-500 ${
        isExpanded ? 'flex-grow' : 'max-h-64'
      }`}>
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
