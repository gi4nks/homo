'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export default function CanvasSection({ children }: { children: React.ReactNode }) {
  const isFocusMode = useWorkspaceStore(state => state.isFocusMode);

  return (
    <section className="flex-grow flex flex-col relative overflow-hidden h-full z-10 transition-all duration-500">
      {/* Container is now fixed height, absolutely no external scroll */}
      <div className={`flex-grow h-full bg-base-200/20 transition-all duration-500 flex flex-col overflow-hidden ${
        isFocusMode ? 'p-2 md:p-4' : 'p-4 md:p-8'
      }`}>
         <div className={`h-full mx-auto transition-all duration-500 flex flex-col overflow-hidden w-full ${
           isFocusMode ? 'max-w-[98vw]' : 'max-w-none'
         }`}>
            {children}
         </div>
      </div>
    </section>
  );
}
