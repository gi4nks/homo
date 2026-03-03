import React from 'react';
import { getBookById } from '@/app/actions/book.actions';
import { notFound } from 'next/navigation';
import LayoutClientInternal from './layout_client_internal';

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
    <LayoutClientInternal book={formattedBook} params={{ id: bookId }}>
      {children}
    </LayoutClientInternal>
  );
}
