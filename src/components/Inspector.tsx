'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Sparkles, BookOpen, Layers } from 'lucide-react';

// Tab Components
import BookTab from './inspector/BookTab';
import ChapterTab from './inspector/ChapterTab';
import SceneTab from './inspector/SceneTab';

export default function Inspector({ book }: { book: any }) {
  const activeTab = useWorkspaceStore((state) => state.activeTab);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);

  return (
    <div className="flex flex-col h-full bg-base-100 border-l border-base-200">
      {/* TABS NAVIGATION */}
      <div className="tabs tabs-bordered grid grid-cols-3 shrink-0">
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
          <Layers size={14} className="mr-2" /> Chapter
        </button>
        <button 
          className={`tab h-12 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'scene' ? 'tab-active text-primary border-primary' : 'opacity-50'}`}
          onClick={() => setActiveTab('scene')}
        >
          <Sparkles size={14} className="mr-2" /> Scene
        </button>
      </div>

      {/* DYNAMIC TAB CONTENT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {activeTab === 'book' && <BookTab book={book} />}
        {activeTab === 'chapter' && <ChapterTab book={book} />}
        {activeTab === 'scene' && <SceneTab book={book} />}
      </div>
    </div>
  );
}
