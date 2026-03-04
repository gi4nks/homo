'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { compileManuscript } from '@/app/actions/book.actions';
import { 
  Home, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut,
  RefreshCw,
  CheckCircle2,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  FileDown,
  Loader2
} from 'lucide-react';
import ScenePromptGeneratorWrapper from './ScenePromptGeneratorWrapper';

export default function GlobalHeader() {
  const pathname = usePathname();
  const { 
    activeBookTitle, saveStatus, 
    leftPanelOpen, toggleLeftPanel,
    rightPanelOpen, toggleRightPanel
  } = useWorkspaceStore();
  
  const [theme, setTheme] = useState('corporate');
  const [isExporting, setIsExporting] = useState(false);

  // Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'corporate';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'corporate' ? 'dark' : 'corporate';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Safe Extraction of Book ID from URL
  const isBookWorkspace = pathname.startsWith('/book/');
  const pathParts = pathname.split('/');
  const derivedBookId = isBookWorkspace ? pathParts[2] : null;

  const handleExport = async () => {
    const targetId = derivedBookId;
    
    if (!targetId) {
      alert("Error: Missing manuscript ID");
      return;
    }

    setIsExporting(true);
    try {
      const result = await compileManuscript(targetId);
      
      if (!result.success) {
        throw new Error(result.error || 'Server reported failure');
      }

      const blob = new Blob([result.data || ""], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeBookTitle?.replace(/\s+/g, '_') || 'manuscript'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const isSettings = pathname.startsWith('/settings');

  return (
    <header className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-50 px-6 min-h-16 shrink-0 shadow-sm">
      {/* LEFT */}
      <div className="navbar-start gap-4 flex-grow-0">
        <Link href="/" className="btn btn-ghost p-0 hover:bg-transparent flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center font-black shadow-lg">H</div>
        </Link>

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
            {isBookWorkspace && <li><span className="text-base-content/80 whitespace-nowrap">{activeBookTitle || 'Book'}</span></li>}
            {isSettings && <li><Link href="/settings" className="hover:text-primary">Settings</Link></li>}
          </ul>
        </div>
      </div>

      <div className="navbar-center hidden lg:flex"></div>

      {/* RIGHT */}
      <div className="navbar-end gap-3 flex-grow">
        {isBookWorkspace && (
          <>
            <button 
              className={`btn btn-outline btn-sm font-black uppercase tracking-widest text-[9px] gap-2 rounded-md transition-all ${isExporting ? 'bg-base-300 pointer-events-none' : 'hover:bg-primary hover:text-primary-content'}`}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <><RefreshCw size={14} className="animate-spin" /> Exporting...</>
              ) : (
                <><FileDown size={14} /> Export .md</>
              )}
            </button>

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
          </>
        )}

        {isBookWorkspace && derivedBookId && (
          <ScenePromptGeneratorWrapper bookId={derivedBookId} />
        )}

        <div className="divider divider-horizontal mx-0 h-6 opacity-10"></div>

        <button className="btn btn-ghost btn-sm btn-circle shrink-0" onClick={toggleTheme}>
          {theme === 'corporate' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="dropdown dropdown-end shrink-0">
          <label tabIndex={0} className="btn btn-ghost btn-sm p-0 h-auto min-h-0 hover:bg-transparent">
            <div className="avatar placeholder"><div className="bg-neutral text-neutral-content rounded-lg w-8 shadow-sm"><User size={16} /></div></div>
          </label>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-xl border border-base-200 w-52 font-bold uppercase text-[10px] tracking-widest text-slate-900">
            <li><Link href="/settings" className="py-3 px-4 flex items-center gap-3"><Settings size={14} /> System Settings</Link></li>
            <div className="divider my-0 opacity-10"></div>
            <li><Link href="/" className="py-3 px-4 flex items-center gap-3 text-error"><LogOut size={14} /> Sign Out</Link></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
