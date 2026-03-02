import React from 'react';
import { getBooks } from '@/app/actions/book.actions';
import DashboardClient from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const response = await getBooks();
  const books = response.success ? response.data : [];
  
  // Format dates for hydration safety
  const initialBooks = books.map((book: any) => ({
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  }));

  return <DashboardClient initialBooks={initialBooks} />;
}
