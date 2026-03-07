'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  // Use simple h-full because the root layout already manages the header/footer slots
  return (
    <div className="flex flex-grow overflow-hidden bg-base-100 relative transition-all duration-700 h-full w-full">
      {/* ATMOSPHERE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]"></div>
      </div>
      {children}
    </div>
  );
}
