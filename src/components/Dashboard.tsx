'use client';

import React, { useState, useTransition, useMemo, useEffect } from 'react';
import { createBook, deleteBook } from '@/app/actions/book.actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Book as BookIcon, 
  Clock, 
  Trash2, 
  ChevronRight,
  Library,
  Search,
  LayoutGrid,
  List as ListIcon,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';

interface Scene { content: string; }
interface Chapter { scenes: Scene[]; }
interface Book { id: string; title: string; genre: string; status: string; updatedAt: string; chapters?: Chapter[]; }

const FormattedDate = ({ dateString }: { dateString: string }) => {
  const [formatted, setFormatted] = useState<string>('');
  useEffect(() => { setFormatted(new Date(dateString).toLocaleDateString()); }, [dateString]);
  return <>{formatted}</>;
};

export default function Dashboard({ initialBooks }: { initialBooks: Book[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const countWords = (html: string = '') => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  };

  const getBookStats = (book: Book) => {
    let totalWords = 0; let totalScenes = 0;
    const totalChapters = book.chapters?.length || 0;
    if (book.chapters) {
      book.chapters.forEach(ch => {
        totalScenes += ch.scenes.length;
        ch.scenes.forEach(s => { totalWords += countWords(s.content); });
      });
    }
    return { totalWords, readingTime: Math.ceil(totalWords / 200), totalChapters, totalScenes };
  };

  const filteredBooks = useMemo(() => {
    return initialBooks.filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialBooks, searchQuery]);

  const handleCreateBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const genre = formData.get('genre') as string;
    const tone = formData.get('tone') as string;
    if (!title) return;
    startTransition(async () => {
      const res = await createBook({ title, genre, tone, status: 'Planning' });
      if (res.success) {
        setShowModal(false);
        router.push(`/book/${res.data.id}`);
      } else {
        alert(res.error);
      }
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Drafting': return 'badge-warning';
      case 'In Review': return 'badge-info';
      case 'Completed': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  return (
    <main className="flex-grow bg-base-200 flex flex-col relative text-base-content overflow-hidden">
      {/* ATMOSPHERE - Semantic Colors */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
         <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[180px]"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-secondary rounded-full blur-[180px]"></div>
      </div>

      {/* TOOLBAR & SEARCH */}
      <div className="px-8 py-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm flex items-center justify-between shrink-0 z-10">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <Library size={16} className="text-secondary" />
               <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">My Library</h2>
               <div className="badge badge-secondary badge-outline badge-sm font-mono text-[10px]">{filteredBooks.length}</div>
            </div>
            <div className="divider divider-horizontal mx-0 h-4 opacity-30"></div>
            <div className="flex bg-base-300 p-1 rounded-lg">
               <button className={`btn btn-xs btn-square rounded ${viewMode === 'grid' ? 'btn-active shadow-sm' : 'btn-ghost opacity-50'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={14} /></button>
               <button className={`btn btn-xs btn-square rounded ${viewMode === 'list' ? 'btn-active shadow-sm' : 'btn-ghost opacity-50'}`} onClick={() => setViewMode('list')}><ListIcon size={14} /></button>
            </div>
         </div>

         {/* Search Bar - Center Integrated */}
         <div className="flex-grow max-w-xl mx-12 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter manuscripts..." 
              className="input input-bordered input-sm w-full pl-10 bg-base-100 border-base-300 focus:input-primary transition-all rounded-md" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
         </div>

         <button className="btn btn-primary btn-sm rounded-md font-bold uppercase tracking-widest text-[10px] px-8 shadow-md" onClick={() => setShowModal(true)}>
            <Plus size={14} className="mr-1" /> New manuscript
         </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-grow overflow-y-auto p-10 z-10 custom-scrollbar pb-32">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-30"><Search size={64} /><p className="text-xl font-black italic tracking-tighter uppercase">No results found</p></div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {filteredBooks.map((book) => {
                const { totalWords, totalChapters, totalScenes } = getBookStats(book);
                return (
                  <div key={book.id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-xl transition-all group overflow-hidden rounded-xl">
                    <div className="card-body p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`badge ${getStatusClass(book.status)} badge-xs font-bold uppercase py-2`}>{book.status}</div>
                        <button className="btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity" onClick={async (e) => { e.preventDefault(); if (confirm('Delete?')) { await deleteBook(book.id); router.refresh(); } }}><Trash2 size={14} /></button>
                      </div>
                      <Link href={`/book/${book.id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-black text-lg uppercase tracking-tight line-clamp-2 leading-tight h-12 mb-1">{book.title}</h3>
                      </Link>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-8 border-b border-base-200 pb-4">{book.genre || 'Uncategorized'}</p>
                      
                      <div className="grid grid-cols-3 gap-3 mb-6">
                         <div className="flex flex-col"><span className="text-[8px] font-black opacity-40 uppercase tracking-widest">Chapters</span><span className="text-xs font-black">{totalChapters}</span></div>
                         <div className="flex flex-col"><span className="text-[8px] font-black opacity-40 uppercase tracking-widest">Scenes</span><span className="text-xs font-black">{totalScenes}</span></div>
                         <div className="flex flex-col text-primary"><span className="text-[8px] font-black opacity-40 uppercase tracking-widest">Words</span><span className="text-xs font-black">{totalWords >= 1000 ? (totalWords/1000).toFixed(1) + 'k' : totalWords}</span></div>
                      </div>
                      <Link href={`/book/${book.id}`} className="btn btn-outline btn-primary btn-xs btn-block rounded-md font-black uppercase tracking-widest text-[9px]">Open Workspace</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-base-100 border border-base-300 rounded-xl shadow-sm overflow-hidden">
               <table className="table table-sm table-zebra w-full">
                  <thead className="bg-base-200 text-base-content/70">
                     <tr className="text-[10px] uppercase tracking-widest font-black">
                        <th className="pl-8 py-5">Title</th>
                        <th className="font-black py-5">Genre</th>
                        <th className="font-black py-5 text-center">Structure</th>
                        <th className="font-black py-5 text-right">Volume</th>
                        <th className="font-black py-5 text-right pr-8">Last Updated</th>
                        <th className="w-10"></th>
                     </tr>
                  </thead>
                  <tbody className="text-xs">
                     {filteredBooks.map((book) => {
                        const { totalWords, totalChapters, totalScenes } = getBookStats(book);
                        return (
                           <tr key={book.id} className="hover:bg-primary/5 group cursor-pointer" onClick={() => router.push(`/book/${book.id}`)}>
                              <td className="pl-8 py-4 font-black text-primary uppercase tracking-tight">{book.title}</td>
                              <td className="font-bold opacity-50 uppercase text-[10px] tracking-tighter">{book.genre || '---'}</td>
                              <td className="text-center opacity-70 font-bold">{totalChapters} ch / {totalScenes} sc</td>
                              <td className="text-right font-mono text-secondary font-bold">{totalWords.toLocaleString()} <span className="text-[9px] opacity-40 uppercase font-sans">w</span></td>
                              <td className="text-right text-[10px] font-bold opacity-40 uppercase pr-8"><div className="flex items-center justify-end gap-2"><Calendar size={12} /><FormattedDate dateString={book.updatedAt} /></div></td>
                              <td className="text-right pr-4"><button className="btn btn-ghost btn-xs btn-square text-error opacity-0 group-hover:opacity-100" onClick={async (e) => { e.preventDefault(); if (confirm('Delete?')) { await deleteBook(book.id); router.refresh(); } }}><Trash2 size={12} /></button></td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
          )
        )}
      </div>

      {showModal && (
        <div className="modal modal-open z-[100]">
          <div className="modal-box max-w-lg p-0 rounded-xl shadow-2xl border border-base-300 overflow-hidden bg-base-100">
            <form onSubmit={handleCreateBook}>
              <div className="px-8 py-6 border-b border-base-300 bg-base-200 flex justify-between items-center text-primary">
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">New Manuscript</h3>
                <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div className="p-10 space-y-8">
                <div className="form-control w-full"><label className="label py-1"><span className="label-text font-black text-[10px] uppercase opacity-60 tracking-widest">Book Title</span></label><input name="title" required autoFocus type="text" placeholder="Title..." className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-md" /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="form-control w-full"><label className="label py-1"><span className="label-text font-black text-[10px] uppercase opacity-60 tracking-widest">Genre</span></label><input name="genre" type="text" placeholder="Fantasy..." className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-md" /></div>
                  <div className="form-control w-full"><label className="label py-1"><span className="label-text font-black text-[10px] uppercase opacity-60 tracking-widest">Writing Tone</span></label><input name="tone" type="text" placeholder="Style..." className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-md" /></div>
                </div>
              </div>
              <div className="px-8 py-6 bg-base-200 flex justify-end gap-4 border-t border-base-300"><button type="button" className="btn btn-ghost btn-sm font-black uppercase tracking-widest opacity-50" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className={`btn btn-primary btn-sm px-10 font-black uppercase tracking-widest shadow-lg shadow-primary/20 ${isPending ? 'loading' : ''}`} disabled={isPending}>Forge Manuscript</button></div>
            </form>
          </div>
          <div className="modal-backdrop bg-black/40" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </main>
  );
}
