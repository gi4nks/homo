'use client';

import React, { useState, useEffect } from 'react';
import { getBooks } from '@/app/actions/book.actions';
import { 
  Download, 
  BookOpen, 
  Database, 
  FileJson, 
  FileText,
  ShieldCheck,
  AlertCircle,
  Clock,
  ChevronRight,
  HardDrive,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function ExportsPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    getBooks().then(res => {
      if (res.success) setBooks(res.data);
      setIsLoading(false);
    });
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/backup');
      if (!response.ok) throw new Error('Backup failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homo_full_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Browser download started successfully.");
    } catch (err) {
      console.error('Backup error:', err);
      showToast("Failed to generate backup.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveBackupToDisk = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/backup-local', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        showToast(`Backup saved to /backups/${result.fileName}`);
      } else {
        throw new Error(result.error || 'Failed to save to disk');
      }
    } catch (err) {
      console.error('Local backup error:', err);
      showToast("Failed to write backup to disk.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCompileManuscript = async () => {
    setIsExporting(true);
    try {
      const url = selectedBookId === 'all' 
        ? '/api/export/manuscript' 
        : `/api/export/manuscript?bookId=${selectedBookId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Compilation failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const fileName = selectedBookId === 'all' 
        ? `all_manuscripts_${new Date().toISOString().split('T')[0]}.md`
        : `manuscript_export_${new Date().toISOString().split('T')[0]}.md`;
        
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      showToast("Manuscript compiled and downloaded.");
    } catch (err) {
      console.error('Manuscript error:', err);
      showToast("Failed to compile manuscript.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-12 w-full flex flex-col h-full space-y-8 overflow-hidden relative">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="toast toast-top toast-end z-[100] animate-in slide-in-from-right duration-300">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl border-none rounded-xl text-white font-black uppercase text-[10px] tracking-widest`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* HARMONIZED PAGE HEADER */}
      <header className="flex justify-between items-center w-full shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase leading-none">Data & Exports</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Portability & Disaster Recovery</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-8 w-full min-h-0">
        
        {/* LEFT: TECHNICAL BACKUP */}
        <section className="flex-1 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <Database size={14} className="text-primary opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Full System Snapshot</span>
            </div>
          </div>

          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 flex-grow">
            <div className="p-6 bg-primary/5 rounded-full text-primary mb-2">
              <HardDrive size={48} className="opacity-20" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="font-black uppercase tracking-tight text-lg">Disaster Recovery</h3>
              <p className="text-[11px] font-medium opacity-50 leading-relaxed uppercase">
                Export every single byte of data: Books, Chapters, Scenes, Personas, and Prompt Templates.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={handleDownloadBackup}
                disabled={isExporting}
                className={`btn btn-primary btn-md rounded-md font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 ${isExporting ? 'loading' : 'hover:scale-[1.02]'} transition-all`}
              >
                <Download size={18} /> Browser Download
              </button>
              
              <button 
                onClick={handleSaveBackupToDisk}
                disabled={isExporting}
                className={`btn btn-outline btn-md rounded-md font-black uppercase tracking-widest text-xs gap-3 border-base-300 hover:bg-base-200 ${isExporting ? 'loading' : 'hover:scale-[1.02]'} transition-all`}
              >
                <Save size={18} /> Save to Local Disk
              </button>
            </div>

            <div className="p-4 rounded-lg bg-warning/5 border border-warning/10 flex gap-3 max-w-sm text-left">
              <AlertCircle size={16} className="text-warning shrink-0" />
              <p className="text-[9px] font-bold text-warning/60 leading-tight uppercase">
                "Save to Disk" writes a timestamped JSON file directly into the <code>/backups</code> folder of your project root.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT: MANUSCRIPT COMPILATION */}
        <section className="flex-1 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <BookOpen size={14} className="text-secondary opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Manuscript Compiler</span>
            </div>
          </div>

          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 flex-grow">
            <div className="p-6 bg-secondary/5 rounded-full text-secondary mb-2">
              <FileText size={48} className="opacity-20" />
            </div>
            <div className="max-w-xs space-y-4 w-full">
              <h3 className="font-black uppercase tracking-tight text-lg">Forge Markdown</h3>
              <p className="text-[11px] font-medium opacity-50 leading-relaxed uppercase mb-4">
                Compile your scenes into a beautifully formatted .md file ready for publication or sharing.
              </p>
              
              <div className="form-control w-full group">
                <label className="label py-1 px-0">
                  <span className="label-text font-black text-[9px] uppercase opacity-40 group-focus-within:opacity-100 transition-opacity">Select Source</span>
                </label>
                <select 
                  className="select select-bordered select-sm w-full font-bold bg-base-100 border-base-300 focus:border-primary rounded-lg text-[10px] uppercase tracking-widest shadow-sm"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="all" className="bg-base-100">📚 Export All Manuscripts</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id} className="bg-base-100">📖 {book.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleCompileManuscript}
              disabled={isExporting || isLoading}
              className={`btn btn-secondary btn-md rounded-md font-black uppercase tracking-widest text-xs gap-3 px-10 shadow-xl shadow-secondary/20 ${isExporting ? 'loading' : 'hover:scale-[1.02]'} transition-all`}
            >
              <BookOpen size={18} /> Compile Manuscript
            </button>

            <div className="p-4 rounded-lg bg-info/5 border border-info/10 flex gap-3 max-w-sm text-left">
              <ShieldCheck size={16} className="text-info shrink-0" />
              <p className="text-[9px] font-bold text-info/60 leading-tight uppercase">
                Generates a clean Markdown file with proper H1/H2 headers and scene thematic breaks.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
