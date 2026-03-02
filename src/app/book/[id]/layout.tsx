import React from 'react';
import { getBookById } from '@/app/actions';
import { notFound } from 'next/navigation';
import LayoutClientInternal from './layout_client_internal';

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) notFound();

  // Convert dates to strings for safe serialization to Client Component
  const formattedBook = {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };

  return (
    <LayoutClientInternal book={formattedBook} params={{ id }}>
      {children}
    </LayoutClientInternal>
  );
}
