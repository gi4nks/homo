'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import ChapterManager from '@/components/ChapterManager';
import Inspector from '@/components/Inspector';
import { 
  BookOpen, 
  PanelRightClose
} from 'lucide-react';

interface WorkspaceClientProps {
  book: any;
  bookId: string;
  children: React.ReactNode;
}

export default function WorkspaceClient({ book, bookId, children }: WorkspaceClientProps) {
  const leftPanelOpen = useWorkspaceStore(state => state.leftPanelOpen);
  const rightPanelOpen = useWorkspaceStore(state => state.rightPanelOpen);
  const isFocusMode = useWorkspaceStore(state => state.isFocusMode);
  const toggleLeftPanel = useWorkspaceStore(state => state.toggleLeftPanel);
  const toggleRightPanel = useWorkspaceStore(state => state.toggleRightPanel);
  const setActiveBookTitle = useWorkspaceStore(state => state.setActiveBookTitle);

  // Sync book title to global store for the Header
  React.useEffect(() => {
    setActiveBookTitle(book.title);
  }, [book.title, setActiveBookTitle]);

  return (
    <div className={`flex flex-grow overflow-hidden bg-base-100 relative transition-all duration-700 ${isFocusMode ? 'h-screen' : 'h-[calc(100vh-4rem)]'}`}>
      
      {/* ATMOSPHERE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]"></div>
      </div>

      {/* 1. LEFT PANEL: NAVIGATOR */}
      <aside 
        className={`bg-base-100/80 backdrop-blur-md border-r border-base-300 transition-all duration-500 ease-in-out flex flex-col shrink-0 h-full z-20 ${
          leftPanelOpen && !isFocusMode ? 'w-80' : 'w-0 opacity-0 -translate-x-10 invisible overflow-hidden'
        }`}
      >
        <ChapterManager bookId={bookId} chapters={book.chapters} onClose={toggleLeftPanel} />
      </aside>

      {/* 2. CENTER PANEL: THE CANVAS */}
      <section className="flex-grow flex flex-col relative overflow-hidden h-full z-10 transition-all duration-500">
        <div className={`flex-grow overflow-hidden h-full bg-base-200/20 transition-all duration-500 ${
          isFocusMode ? 'p-0' : 'p-4 md:p-8'
        }`}>
           <div className={`h-full mx-auto transition-all duration-500 ${
             isFocusMode ? 'max-w-4xl py-12 md:py-20' : 'max-w-none'
           }`}>
              {children}
           </div>
        </div>
      </section>

      {/* 3. RIGHT PANEL: THE INSPECTOR */}
      <aside 
        className={`bg-base-50/80 backdrop-blur-md border-l border-base-300 transition-all duration-500 ease-in-out flex flex-col shrink-0 h-full z-20 ${
          rightPanelOpen && !isFocusMode ? 'w-80' : 'w-0 opacity-0 translate-x-10 invisible overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100/50 shrink-0">
           <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Inspector</span>
           </div>
           <button className="btn btn-ghost btn-xs btn-square" onClick={toggleRightPanel}>
              <PanelRightClose size={14} />
           </button>
        </div>
        <div className="flex-grow overflow-hidden h-full">
           <Inspector book={book} />
        </div>
      </aside>
    </div>
  );
}
