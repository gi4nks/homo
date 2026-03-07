import { getBookById, getBookStats, updateBookTarget } from '@/app/actions/book.actions';
import { notFound } from 'next/navigation';
import React from 'react';
import { Layout, Target, BookOpen, PenTool, TrendingUp, Trophy } from 'lucide-react';

export default async function BookDashboard({ 
  params 
}: { 
  params: Promise<{ bookId: string }> 
}) {
  const { bookId } = await params;
  
  const [bookRes, statsRes] = await Promise.all([
    getBookById(bookId),
    getBookStats(bookId)
  ]);

  if (!bookRes.success || !bookRes.data || !statsRes.success || !statsRes.data) notFound();

  const book = bookRes.data;
  const stats = statsRes.data;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HERO HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Layout size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Project Central</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">{book.title}</h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest">{book.genre || 'Unspecified Genre'} / {book.status || 'Drafting'}</p>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-black uppercase opacity-30 tracking-widest">Global Progress</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary">{Math.round(stats.progressPercentage)}%</span>
            <span className="text-sm font-bold opacity-30 uppercase">Complete</span>
          </div>
        </div>
      </header>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Words */}
        <div className="bg-base-100 border border-base-300 rounded-3xl p-8 shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
            <PenTool size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Total Words</h3>
          </div>
          <p className="text-4xl font-black tracking-tighter mb-1">{stats.totalWords.toLocaleString()}</p>
          <p className="text-[10px] font-bold opacity-30 uppercase">Manuscript Current</p>
        </div>

        {/* Goal */}
        <div className="bg-base-100 border border-base-300 rounded-3xl p-8 shadow-sm group hover:border-secondary/30 transition-all">
          <div className="flex items-center gap-3 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
            <Target size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Word Goal</h3>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-4xl font-black tracking-tighter mb-1">{stats.targetWords.toLocaleString()}</p>
            
            {/* INLINE UPDATE FORM (Simplified for Dashboard) */}
            <form action={async (formData: FormData) => {
              'use server';
              const newTarget = parseInt(formData.get('target') as string);
              if (!isNaN(newTarget)) await updateBookTarget(bookId, newTarget);
            }} className="flex items-center gap-2">
              <input 
                name="target"
                type="number" 
                placeholder="Adjust goal..."
                className="input input-xs input-bordered w-24 font-bold rounded-lg bg-base-200/50" 
              />
              <button type="submit" className="btn btn-xs btn-primary rounded-lg font-black uppercase tracking-widest text-[8px]">Set</button>
            </form>
          </div>
        </div>

        {/* Chapters/Scenes */}
        <div className="bg-base-100 border border-base-300 rounded-3xl p-8 shadow-sm group hover:border-accent/30 transition-all">
          <div className="flex items-center gap-3 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
            <BookOpen size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Structure</h3>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-4xl font-black tracking-tighter mb-1">{book.chapters.length}</p>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">Chapters</p>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tighter mb-1">{book.chapters.reduce((acc: number, ch: any) => acc + ch.scenes.length, 0)}</p>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">Scenes</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. BIG PROGRESS SECTION */}
      <div className="bg-base-100 border border-base-300 rounded-[40px] p-12 shadow-xl shadow-base-300/20 space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Writing Milestone</h2>
              <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Path to publication</p>
            </div>
          </div>
          <Trophy size={32} className={stats.progressPercentage >= 100 ? 'text-warning fill-warning' : 'opacity-10'} />
        </div>

        <div className="space-y-4">
          <progress 
            className="progress progress-primary w-full h-6 rounded-full shadow-inner" 
            value={stats.totalWords} 
            max={stats.targetWords}
          ></progress>
          <div className="flex justify-between px-2">
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Start: 0 words</span>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Finish: {stats.targetWords.toLocaleString()} words</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="p-6 rounded-3xl bg-base-200/50 border border-base-300/50">
            <h4 className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.2em]">Latest Sync</h4>
            <p className="text-xs font-bold">{new Date().toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col justify-center">
            <p className="text-xs font-medium leading-relaxed italic opacity-60 text-primary">
              &quot;The secret of getting ahead is getting started.&quot; — Mark Twain
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
