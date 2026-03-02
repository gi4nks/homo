'use client';

import React from 'react';

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
  book: any;
  params: { id: string };
}) {
  return (
    <div className="flex flex-col h-screen bg-base-50 overflow-hidden text-base-content selection:bg-primary/20">
      <div className="flex-grow flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}
