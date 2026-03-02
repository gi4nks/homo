import React from 'react';
import { getBookById } from '@/app/actions';
import { notFound } from 'next/navigation';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export default async function BookWorkspace({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) notFound();

  // Convert schema objects for the client
  const formattedBook = {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    chapters: book.chapters.map(ch => ({
      ...ch,
      scenes: ch.scenes.map(s => ({
        ...s,
        content: s.content,
        promptGoals: s.promptGoals,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }))
    }))
  };

  return <WorkspaceClient book={formattedBook} />;
}
