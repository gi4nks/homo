'use client';

import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { X, Sparkles, Loader2, Check, ChevronRight } from 'lucide-react';
import { useAiStream } from '@/hooks/useAiStream';
import ReactMarkdown from 'react-markdown';

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTitle: string;
  revisedTitle: string;
  originalContent: string;
  revisedContent: string;
  bookId: string;
  sceneId: string;
}

export default function DiffModal({
  isOpen,
  onClose,
  originalTitle,
  revisedTitle,
  originalContent,
  revisedContent,
  bookId,
  sceneId
}: DiffModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { aiProposal, isAiLoading, aiError, startStream, clearProposal } = useAiStream();

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setShowAnalysis(true);
    await startStream(
      bookId,
      sceneId,
      undefined,
      undefined,
      undefined,
      'ANALYZE',
      originalContent,
      revisedContent
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className={`relative w-full h-[90vh] bg-base-100 rounded-3xl shadow-2xl border border-base-300 flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden transition-all duration-500 ${showAnalysis ? 'max-w-7xl' : 'max-w-5xl'}`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-base-200 p-6 bg-base-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-widest text-primary">Version Comparison</h3>
              <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Compare and Analyze changes</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!showAnalysis && (
              <button 
                onClick={handleAnalyze}
                className="btn btn-primary px-8 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs"
              >
                <Sparkles size={16} className="mr-2" /> Analyze Changes with AI
              </button>
            )}
            <button 
              onClick={onClose} 
              className="btn btn-circle btn-ghost btn-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-grow flex overflow-hidden">
          {/* DIFF VIEWER */}
          <div className={`flex-grow overflow-y-auto custom-scrollbar p-4 bg-base-100 ${showAnalysis ? 'w-1/2' : 'w-full'}`}>
            <ReactDiffViewer
              oldValue={originalContent}
              newValue={revisedContent}
              splitView={true}
              leftTitle={originalTitle}
              rightTitle={revisedTitle}
              useDarkTheme={false} // Adjust based on app theme if needed
              styles={{
                variables: {
                  light: {
                    diffViewerBackground: '#ffffff',
                    addedBackground: '#e6ffec',
                    addedColor: '#24292e',
                    removedBackground: '#ffeef0',
                    removedColor: '#24292e',
                    wordAddedBackground: '#acf2bd',
                    wordRemovedBackground: '#fdb8c0',
                  }
                },
                contentText: {
                  fontFamily: 'serif',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }
              }}
            />
          </div>

          {/* AI ANALYSIS PANEL */}
          {showAnalysis && (
            <div className="w-1/2 border-l border-base-200 bg-base-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
              <div className="p-4 border-b border-base-200 bg-base-100 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Critical Analysis</span>
                <button onClick={() => { setShowAnalysis(false); clearProposal(); }} className="btn btn-ghost btn-xs btn-square"><X size={14} /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {isAiLoading && !aiProposal ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 animate-pulse">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-center">Consulting the Scribe...</p>
                    </div>
                  ) : (
                    <>
                      <ReactMarkdown>{aiProposal}</ReactMarkdown>
                      {isAiLoading && <Loader2 size={16} className="animate-spin opacity-20 mt-4" />}
                    </>
                  )}
                  {aiError && <div className="alert alert-error text-xs font-bold">{aiError}</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t border-base-200 bg-base-50/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 opacity-30 text-[9px] font-black uppercase tracking-widest">
            <Check size={12} />
            <span>Side-by-side view enabled</span>
          </div>
          <span className="opacity-30 text-[9px] font-black uppercase tracking-widest italic">Review carefully before merging</span>
        </div>
      </div>
    </div>
  );
}
