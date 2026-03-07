import React from 'react';
import { getBookById } from '@/app/actions/book.actions';
import { notFound } from 'next/navigation';
import WorkspaceSync from './WorkspaceSync';
import WorkspaceShell from './WorkspaceShell';
import SidebarPanel from './SidebarPanel';
import InspectorPanel from './InspectorPanel';
import CanvasSection from './CanvasSection';
import ChapterManager from '@/components/ChapterManager';
import Inspector from '@/components/Inspector';

export const dynamic = 'force-dynamic';

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  
  if (!bookId) notFound();
  
  const response = await getBookById(bookId);

  if (!response.success || !response.data) notFound();

  const book = response.data;

  // Convert dates to strings for safe serialization to Client Component
  const formattedBook = {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };

  return (
    <div className="flex flex-col h-full bg-base-50 overflow-hidden text-base-content selection:bg-primary/20">
      <WorkspaceSync title={book.title} />
      
      <div className="flex-grow flex overflow-hidden">
        <WorkspaceShell>
          {/* 1. LEFT PANEL: NAVIGATOR */}
          <SidebarPanel>
            <ChapterManager bookId={bookId} chapters={formattedBook.chapters} />
          </SidebarPanel>

          {/* 2. CENTER PANEL: THE CANVAS */}
          <CanvasSection>
            {children}
          </CanvasSection>

          {/* 3. RIGHT PANEL: THE INSPECTOR */}
          <InspectorPanel>
            <Inspector book={formattedBook} />
          </InspectorPanel>
        </WorkspaceShell>
      </div>
    </div>
  );
}
