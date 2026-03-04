'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Settings as SettingsIcon,
  ChevronRight,
  Database,
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function SettingsHubPage() {
  return (
    <main className="flex-grow bg-slate-50 flex flex-col relative overflow-hidden text-slate-900">
      {/* ATMOSPHERE BACKGROUND - CONSISTENT WITH DASHBOARD */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.06]">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[150px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-400 rounded-full blur-[150px]"></div>
      </div>

      {/* HUB CONTENT - FULL WIDTH */}
      <div className="p-8 lg:p-12 flex-grow z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full flex flex-col gap-12">
          
          <header className="px-2">
             <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">System Configuration</h2>
             <p className="text-slate-500 font-medium mt-2 tracking-tight">Global control center for your writing environment and AI generation pipelines.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-20">
            
            {/* ACTIVE: Genre Rules */}
            <Link href="/settings/genres" className="card bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:border-blue-500 group relative overflow-hidden rounded-xl h-full">
              <div className="absolute top-0 right-0 p-4">
                 <div className="badge badge-primary badge-xs font-black uppercase tracking-widest text-[8px] py-2 px-3 shadow-md">Active</div>
              </div>
              <div className="card-body p-8 gap-6 flex flex-col h-full">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <BookOpen size={28} />
                </div>
                <div className="flex-grow">
                  <h3 className="font-black text-xl leading-tight mb-2 text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">Genre Prompt Rules</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Define specific drafting instructions for different literary genres. Injected automatically into every AI prompt assembly.
                  </p>
                </div>
                <div className="card-actions justify-end mt-6 border-t border-slate-50 pt-4">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                      Configure Module <ChevronRight size={14} />
                   </div>
                </div>
              </div>
            </Link>

            {/* UPCOMING: AI Models */}
            <div className="card bg-slate-100 border border-slate-200 opacity-60 grayscale group cursor-not-allowed rounded-xl">
              <div className="card-body p-8 gap-6">
                <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                  <Cpu size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl leading-tight mb-2 text-slate-400 uppercase tracking-tight">AI Model Profiles</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                    Configure API keys and behavior for Claude, GPT-4, and local LLMs.
                  </p>
                </div>
                <div className="mt-auto pt-6">
                   <div className="badge badge-ghost badge-sm font-bold uppercase tracking-widest text-[9px] opacity-50">Coming Soon</div>
                </div>
              </div>
            </div>

            {/* UPCOMING: Database */}
            <div className="card bg-slate-100 border border-slate-200 opacity-60 grayscale group cursor-not-allowed rounded-xl">
              <div className="card-body p-8 gap-6">
                <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                  <Database size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl leading-tight mb-2 text-slate-400 uppercase tracking-tight">Data & Exports</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                    Manage your SQLite database, cloud backups, and global manuscript exports (PDF/ePub).
                  </p>
                </div>
                <div className="mt-auto pt-6">
                   <div className="badge badge-ghost badge-sm font-bold uppercase tracking-widest text-[9px] opacity-50">Coming Soon</div>
                </div>
              </div>
            </div>

            {/* UPCOMING: Security */}
            <div className="card bg-slate-100 border border-slate-200 opacity-60 grayscale group cursor-not-allowed rounded-xl">
              <div className="card-body p-8 gap-6">
                <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl leading-tight mb-2 text-slate-400 uppercase tracking-tight">Privacy & Keys</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                    Manage encryption keys and privacy settings for your local storage.
                  </p>
                </div>
                <div className="mt-auto pt-6">
                   <div className="badge badge-ghost badge-sm font-bold uppercase tracking-widest text-[9px] opacity-50">Coming Soon</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <footer className="mt-auto p-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm flex justify-center items-center z-20">
        <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full shadow-lg">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">HOMO Engine v2.3</span>
        </div>
      </footer>
    </main>
  );
}
