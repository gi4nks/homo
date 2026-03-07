'use client';

import React from 'react';
import { Zap } from 'lucide-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-base-100">
      {/* ATMOSPHERE BACKGROUND - Subtle full-screen effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[150px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[150px]"></div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <main className="flex-1 overflow-y-auto w-full z-10 relative custom-scrollbar">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
