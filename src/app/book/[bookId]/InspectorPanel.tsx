'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { BookOpen, PanelRightClose } from 'lucide-react';

export default function InspectorPanel({ children }: { children: React.ReactNode }) {
  const rightPanelOpen = useWorkspaceStore(state => state.rightPanelOpen);
  const isFocusMode = useWorkspaceStore(state => state.isFocusMode);
  const toggleRightPanel = useWorkspaceStore(state => state.toggleRightPanel);

  return (
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
         {children}
      </div>
    </aside>
  );
}
