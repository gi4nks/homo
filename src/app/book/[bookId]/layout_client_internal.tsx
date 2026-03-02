'use client';

import React from 'react';
import WorkspaceClient from './WorkspaceClient';

export default function LayoutClientInternal({
  children,
  book,
  params
}: {
  children: React.ReactNode;
  book: any;
  params: { id: string };
}) {
  return (
    <div className="flex flex-col h-screen bg-base-50 overflow-hidden text-base-content selection:bg-primary/20">
      <div className="flex-grow flex overflow-hidden">
        <WorkspaceClient book={book} bookId={params.id}>
          {children}
        </WorkspaceClient>
      </div>
    </div>
  );
}
