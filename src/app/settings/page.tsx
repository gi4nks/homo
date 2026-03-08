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
  Zap,
  FileCode,
  Terminal
} from 'lucide-react';

export default function SettingsHubPage() {
  return (
    <div className="p-12 w-full flex flex-col gap-12">
      
      <header className="space-y-2">
         <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase">System Configuration</h1>
         <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Global control center for your writing environment</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        
        {/* ACTIVE: Prompt CMS */}
        <Link href="/settings/prompts" className="card bg-base-100 rounded-xl shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary group h-full flex flex-col">
          <div className="card-body p-8 gap-6 flex flex-col flex-1">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <FileCode size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors uppercase tracking-tight">Prompt CMS</h3>
              <p className="text-sm text-base-content/70 leading-relaxed mt-2">
                Manage dynamic prompt templates and interpolation variables. Control the core intelligence hierarchy.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 border-t border-base-200 mt-auto">
              Open Editor <ChevronRight size={14} />
            </div>
          </div>
        </Link>

        {/* ACTIVE: Genre Rules */}
        <Link href="/settings/genres" className="card bg-base-100 rounded-xl shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary group h-full flex flex-col">
          <div className="card-body p-8 gap-6 flex flex-col flex-1">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <BookOpen size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors uppercase tracking-tight">Genre Prompt Rules</h3>
              <p className="text-sm text-base-content/70 leading-relaxed mt-2">
                Define specific drafting instructions for different literary genres. Injected automatically into prompts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 border-t border-base-200 mt-auto">
              Configure Rules <ChevronRight size={14} />
            </div>
          </div>
        </Link>

        {/* ACTIVE: AI Personas */}
        <Link href="/settings/profiles" className="card bg-base-100 rounded-xl shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary group h-full flex flex-col">
          <div className="card-body p-8 gap-6 flex flex-col flex-1">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <Cpu size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors uppercase tracking-tight">AI Personas</h3>
              <p className="text-sm text-base-content/70 leading-relaxed mt-2">
                Manage AI writing styles and behaviors. Create custom personas for different narrative requirements.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 border-t border-base-200 mt-auto">
              Manage Personas <ChevronRight size={14} />
            </div>
          </div>
        </Link>

        {/* ACTIVE: AI Models */}
        <Link href="/settings/ai-models" className="card bg-base-100 rounded-xl shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary group h-full flex flex-col">
          <div className="card-body p-8 gap-6 flex flex-col flex-1">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <Cpu size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors uppercase tracking-tight">AI Model Profiles</h3>
              <p className="text-sm text-base-content/70 leading-relaxed mt-2">
                Configure API keys and behavior for Claude, GPT-4, and local LLMs. Switch between providers seamlessly.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 border-t border-base-200 mt-auto">
              Configure Engines <ChevronRight size={14} />
            </div>
          </div>
        </Link>

        {/* ACTIVE: Inspector Bindings */}
        <Link href="/settings/inspector" className="card bg-base-100 rounded-xl shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary group h-full flex flex-col">
          <div className="card-body p-8 gap-6 flex flex-col flex-1">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <Zap size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors uppercase tracking-tight">Inspector Bindings</h3>
              <p className="text-sm text-base-content/70 leading-relaxed mt-2">
                Map specific Inspector fields to specialized AI protocols. Automate your outlining and structural drafting.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 border-t border-base-200 mt-auto">
              Configure Bindings <ChevronRight size={14} />
            </div>
          </div>
        </Link>

        {/* ACTIVE: Data & Exports */}
        <Link href="/settings/exports" className="card bg-base-100 rounded-xl shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary group h-full flex flex-col">
          <div className="card-body p-8 gap-6 flex flex-col flex-1">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <Database size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors uppercase tracking-tight">Data & Exports</h3>
              <p className="text-sm text-base-content/70 leading-relaxed mt-2">
                Manage your SQLite database, system backups, and global manuscript exports. Portability guaranteed.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 border-t border-base-200 mt-auto">
              Manage Data <ChevronRight size={14} />
            </div>
          </div>
        </Link>

        {/* ACTIVE: System Logs */}
        <Link href="/settings/logs" className="card bg-base-100 rounded-xl shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary group h-full flex flex-col">
          <div className="card-body p-8 gap-6 flex flex-col flex-1">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <Terminal size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors uppercase tracking-tight">System Logs</h3>
              <p className="text-sm text-base-content/70 leading-relaxed mt-2">
                Monitor application events, AI generation logs, errors, and performance metrics. Debug with precision.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary pt-4 border-t border-base-200 mt-auto">
              View Logs <ChevronRight size={14} />
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
