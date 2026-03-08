'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { 
  Home, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut,
  RefreshCw,
  CheckCircle2,
  Cpu,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Zap
} from 'lucide-react';
import ScenePromptGeneratorWrapper from './ScenePromptGeneratorWrapper';

export default function GlobalHeader() {
  const pathname = usePathname();
  const { 
    activeBookTitle, saveStatus, 
    leftPanelOpen, toggleLeftPanel,
    rightPanelOpen, toggleRightPanel,
    isCacheActive
  } = useWorkspaceStore();
  
  const [theme, setTheme] = useState('fantasy');

  // Theme Logic with Migration
  useEffect(() => {
    let savedTheme = localStorage.getItem('theme') || 'fantasy';
    
    // FORCE MIGRATION: If the user was on emerald or corporate, move them to fantasy
    if (savedTheme === 'emerald' || savedTheme === 'corporate') {
      savedTheme = 'fantasy';
      localStorage.setItem('theme', 'fantasy');
    }

    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'fantasy' ? 'dark' : 'fantasy';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isBookWorkspace = pathname.startsWith('/book/');
  const pathParts = pathname.split('/').filter(Boolean);
  const derivedBookId = isBookWorkspace ? pathParts[1] : null;

  const breadcrumbItems = [];
  if (isBookWorkspace) {
    breadcrumbItems.push({ label: 'Workspace', path: '/book' });
    breadcrumbItems.push({ label: activeBookTitle || 'Current Book', path: `/book/${derivedBookId}` });
  } else {
    let currentPath = '';
    pathParts.forEach((part) => {
      currentPath += `/${part}`;
      let label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      if (part === 'prompts') label = 'Prompt CMS';
      if (part === 'profiles') label = 'AI Personas';
      if (part === 'genres') label = 'Genre Rules';
      if (part === 'ai-models') label = 'AI Models';
      breadcrumbItems.push({ label, path: currentPath });
    });
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-50 px-6 min-h-16 shrink-0 shadow-sm font-sans">
      <div className="navbar-start gap-4 flex-grow-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center font-black shadow-lg text-lg">H</div>
        </div>

        {isBookWorkspace && (
          <div className="flex gap-1 ml-2">
            <button className={`btn btn-xs btn-square ${leftPanelOpen ? 'btn-primary' : 'btn-ghost opacity-40'}`} onClick={toggleLeftPanel}>
              {leftPanelOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
            <button className={`btn btn-xs btn-square ${rightPanelOpen ? 'btn-primary' : 'btn-ghost opacity-40'}`} onClick={toggleRightPanel}>
              {rightPanelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            </button>
          </div>
        )}

        <div className="text-[10px] breadcrumbs font-black uppercase tracking-widest text-base-content/40 ml-2 overflow-visible">
          <ul>
            <li><Link href="/" className="flex items-center gap-1.5 hover:text-primary"><Home size={12} /> Home</Link></li>
            {breadcrumbItems.map((item, i) => (
              <li key={item.path}>
                {i === breadcrumbItems.length - 1 ? (
                  <span className="text-base-content/80 whitespace-nowrap">{item.label}</span>
                ) : (
                  <Link href={item.path} className="hover:text-primary whitespace-nowrap">{item.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="navbar-end gap-3 flex-grow">
        {isBookWorkspace && (
          <div className="flex items-center gap-4">
            {/* CACHE STATUS INDICATOR */}
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${isCacheActive ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-base-200/50 border-base-300 text-base-content/40'}`}
              title={isCacheActive ? "AI Cache Active: Reduced Latency & Cost" : "AI Cache Cold: Preparing static context..."}
            >
              <div className="relative flex h-2 w-2">
                {isCacheActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isCacheActive ? 'bg-emerald-500' : 'bg-base-300'}`}></span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                {isCacheActive ? 'Cache Hit' : 'Cold Start'}
              </span>
            </div>

            <div className="flex items-center gap-3 px-4 py-1.5 bg-base-200/50 rounded-full border border-base-300 animate-in fade-in duration-300 shrink-0">
              {saveStatus.isSaving ? (
                <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest">
                  <RefreshCw size={12} className="animate-spin" /> Syncing...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success font-black text-[9px] uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Synchronized
                </div>
              )}
              {saveStatus.lastSynced && <span className="text-[9px] font-bold opacity-30 uppercase tracking-tighter border-l border-base-300 pl-3 ml-1 hidden sm:inline">{saveStatus.lastSynced}</span>}
            </div>
          </div>
        )}

        {isBookWorkspace && derivedBookId && <ScenePromptGeneratorWrapper bookId={derivedBookId} />}

        <div className="divider divider-horizontal mx-0 h-6 opacity-10"></div>

        <button className="btn btn-ghost btn-sm btn-circle shrink-0" onClick={toggleTheme}>
          {theme === 'fantasy' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="dropdown dropdown-end shrink-0">
          <label tabIndex={0} className="btn btn-ghost btn-sm p-0 h-auto min-h-0 hover:bg-transparent">
            <div className="avatar placeholder"><div className="bg-neutral text-neutral-content rounded-lg w-8 shadow-sm"><User size={16} /></div></div>
          </label>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-xl border border-base-200 w-52 font-bold uppercase text-[10px] tracking-widest text-base-content">
            <li><Link href="/settings" className="py-3 px-4 flex items-center gap-3"><Settings size={14} /> System Settings</Link></li>
            <li><Link href="/settings/ai-models" className="py-3 px-4 flex items-center gap-3"><Cpu size={14} /> AI Engines</Link></li>
            <div className="divider my-0 opacity-10"></div>
            <li><Link href="/" className="py-3 px-4 flex items-center gap-3 text-error"><LogOut size={14} /> Sign Out</Link></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
