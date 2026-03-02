import React from 'react';
import { getBooks } from '@/app/actions';
import DashboardClient from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const books = await getBooks();
  
  // Format dates for hydration safety
  const initialBooks = books.map(book => ({
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  }));

  return <DashboardClient initialBooks={initialBooks} />;
}
