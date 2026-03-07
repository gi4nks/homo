'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Sparkles, BookOpen, Layers, History } from 'lucide-react';

// Tab Components
import BookTab from './inspector/BookTab';
import ChapterTab from './inspector/ChapterTab';
import SceneTab from './inspector/SceneTab';
import HistoryTab from './inspector/HistoryTab';

export default function Inspector({ book }: { book: any }) {
  const activeTab = useWorkspaceStore((state) => state.activeTab);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);

  return (
    <div className="flex flex-col h-full bg-base-200 border-l border-base-300 shadow-inner">
      {/* TABS NAVIGATION */}
      <div className="tabs tabs-bordered grid grid-cols-4 shrink-0 bg-base-100">
        <button 
          className={`tab h-12 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'book' ? 'tab-active text-primary border-primary' : 'opacity-50'}`}
          onClick={() => setActiveTab('book')}
        >
          <BookOpen size={14} className="mr-2" /> Book
        </button>
        <button 
          className={`tab h-12 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chapter' ? 'tab-active text-primary border-primary' : 'opacity-50'}`}
          onClick={() => setActiveTab('chapter')}
        >
          <Layers size={14} className="mr-2" /> Chap
        </button>
        <button 
          className={`tab h-12 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'scene' ? 'tab-active text-primary border-primary' : 'opacity-50'}`}
          onClick={() => setActiveTab('scene')}
        >
          <Sparkles size={14} className="mr-2" /> Scene
        </button>
        <button 
          className={`tab h-12 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'tab-active text-primary border-primary' : 'opacity-50'}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={14} className="mr-2" /> Hist
        </button>
      </div>

      {/* DYNAMIC TAB CONTENT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {activeTab === 'book' && <BookTab book={book} />}
        {activeTab === 'chapter' && <ChapterTab book={book} />}
        {activeTab === 'scene' && <SceneTab book={book} />}
        {activeTab === 'history' && <HistoryTab book={book} />}
      </div>
    </div>
  );
}
