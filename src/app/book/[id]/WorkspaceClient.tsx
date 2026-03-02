'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import ChapterManager from '@/components/ChapterManager';
import SceneEditor from '@/components/SceneEditor';
import Inspector from '@/components/Inspector';
import { 
  BookOpen, 
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';

export default function WorkspaceClient({ book }: { book: any }) {
  const leftPanelOpen = useWorkspaceStore(state => state.leftPanelOpen);
  const rightPanelOpen = useWorkspaceStore(state => state.rightPanelOpen);
  const toggleLeftPanel = useWorkspaceStore(state => state.toggleLeftPanel);
  const toggleRightPanel = useWorkspaceStore(state => state.toggleRightPanel);
  const setActiveBook = useWorkspaceStore(state => state.setActiveBook);

  // Sync book title & ID to global store
  React.useEffect(() => {
    setActiveBook(book.id, book.title);
  }, [book.id, book.title, setActiveBook]);

  return (
    <div className="flex flex-grow overflow-hidden bg-base-100 relative">
      
      {/* ATMOSPHERE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]"></div>
      </div>

      {/* 1. LEFT PANEL: NAVIGATOR */}
      <aside 
        className={`bg-base-100/80 backdrop-blur-md border-r border-base-300 transition-all duration-300 ease-in-out flex flex-col shrink-0 h-[calc(100vh-3.5rem)] z-20 ${
          leftPanelOpen ? 'w-80' : 'w-0 opacity-0 -translate-x-10 invisible overflow-hidden'
        }`}
      >
        <ChapterManager bookId={book.id} chapters={book.chapters} onClose={toggleLeftPanel} />
      </aside>

      {/* 2. CENTER PANEL: THE CANVAS */}
      <section className="flex-grow flex flex-col relative overflow-hidden h-[calc(100vh-3.5rem)] z-10">
        <div className="flex-grow overflow-hidden h-full bg-base-200/20 p-4 md:p-8">
           <SceneEditor bookId={book.id} />
        </div>
      </section>

      {/* 3. RIGHT PANEL: THE INSPECTOR */}
      <aside 
        className={`bg-base-50/80 backdrop-blur-md border-l border-base-300 transition-all duration-300 ease-in-out flex flex-col shrink-0 h-[calc(100vh-3.5rem)] z-20 ${
          rightPanelOpen ? 'w-80' : 'w-0 opacity-0 translate-x-10 invisible overflow-hidden'
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
