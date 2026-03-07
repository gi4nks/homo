'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export default function SidebarPanel({ children }: { children: React.ReactNode }) {
  const leftPanelOpen = useWorkspaceStore(state => state.leftPanelOpen);
  const isFocusMode = useWorkspaceStore(state => state.isFocusMode);

  return (
    <aside 
      className={`bg-base-100/80 backdrop-blur-md border-r border-base-300 transition-all duration-500 ease-in-out flex flex-col shrink-0 h-full z-20 ${
        leftPanelOpen && !isFocusMode ? 'w-80' : 'w-0 opacity-0 -translate-x-10 invisible overflow-hidden'
      }`}
    >
      {children}
    </aside>
  );
}
