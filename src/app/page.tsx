import React from 'react';
import { getBooks } from '@/app/actions/book.actions';
import DashboardClient from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1') || 1;
  const search = params.search || '';

  const response = await getBooks({ page, pageSize: 20, search });
  const books = (response.success && response.data) ? response.data : [];
  const pagination = response.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 1 };

  // Format dates for hydration safety
  const initialBooks = books.map((book: any) => ({
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  }));

  return (
    <DashboardClient
      initialBooks={initialBooks}
      pagination={pagination}
      initialSearch={search}
    />
  );
}
