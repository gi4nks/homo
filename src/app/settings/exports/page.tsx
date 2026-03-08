'use client';

import React, { useState, useEffect } from 'react';
import { getBooks } from '@/app/actions/book.actions';
import {
  getBackupsList,
  createManualBackup,
  restoreFromBackup,
  deleteBackup,
  getBackupStats
} from '@/app/actions/backup.actions';
import {
  getSnapshotStats,
  cleanupAllSnapshots,
  updateSnapshotRetentionLimit
} from '@/app/actions/snapshot.actions';
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
  CheckCircle2,
  Trash2,
  RotateCcw,
  Plus,
  Shield,
  History,
  Sparkles
} from 'lucide-react';

interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  sizeFormatted: string;
  timestamp: string;
  checksum: string;
  createdAt: number;
}

export default function ExportsPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Backup State
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [backupStats, setBackupStats] = useState<any>(null);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ action: string; filename?: string } | null>(null);

  // Snapshot State
  const [snapshotStats, setSnapshotStats] = useState<any>(null);
  const [retentionInput, setRetentionInput] = useState<number>(50);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    getBooks().then(res => {
      if (res.success && res.data) setBooks(res.data);
      setIsLoading(false);
    });
    loadBackups();
    loadSnapshotStats();
  }, []);

  const loadBackups = async () => {
    setIsBackupLoading(true);
    const [backupsRes, statsRes] = await Promise.all([
      getBackupsList(),
      getBackupStats()
    ]);

    if (backupsRes.success && backupsRes.data) {
      setBackups(backupsRes.data);
    }
    if (statsRes.success && statsRes.data) {
      setBackupStats(statsRes.data);
    }
    setIsBackupLoading(false);
  };

  const loadSnapshotStats = async () => {
    const result = await getSnapshotStats();
    if (result.success && result.data) {
      setSnapshotStats(result.data);
      setRetentionInput(result.data.retentionLimit);
    }
  };

  const handleCleanupAllSnapshots = async () => {
    setIsSnapshotLoading(true);
    try {
      const result = await cleanupAllSnapshots();
      if (result.success && result.data) {
        showToast(`Cleanup complete: ${result.data.totalDeleted} snapshots deleted across ${result.data.scenesProcessed} scenes.`);
        await loadSnapshotStats();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showToast("Failed to cleanup snapshots.", 'error');
    } finally {
      setIsSnapshotLoading(false);
    }
  };

  const handleUpdateRetention = async () => {
    setIsSnapshotLoading(true);
    try {
      const result = await updateSnapshotRetentionLimit(retentionInput);
      if (result.success) {
        showToast(`Retention limit updated to ${retentionInput === 0 ? 'unlimited' : retentionInput}.`);
        await loadSnapshotStats();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showToast("Failed to update retention limit.", 'error');
    } finally {
      setIsSnapshotLoading(false);
    }
  };

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

  const handleCreateBackup = async () => {
    setIsBackupLoading(true);
    try {
      const result = await createManualBackup();
      if (result.success) {
        showToast("Manual backup created successfully.");
        await loadBackups();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Backup error:', err);
      showToast("Failed to create backup.", 'error');
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    setIsBackupLoading(true);
    setConfirmModal(null);
    try {
      const result = await restoreFromBackup(filename);
      if (result.success) {
        showToast("Database restored successfully. Reload the page.");
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Restore error:', err);
      showToast("Failed to restore backup.", 'error');
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    setIsBackupLoading(true);
    setConfirmModal(null);
    try {
      const result = await deleteBackup(filename);
      if (result.success) {
        showToast("Backup deleted successfully.");
        await loadBackups();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast("Failed to delete backup.", 'error');
    } finally {
      setIsBackupLoading(false);
    }
  };

  return (
    <div className="p-12 w-full flex flex-col h-full space-y-8 overflow-auto relative">

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="toast toast-top toast-end z-[100] animate-in slide-in-from-right duration-300">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl border-none rounded-xl text-white font-black uppercase text-[10px] tracking-widest`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg uppercase tracking-tight">
              {confirmModal.action === 'restore' ? '⚠️ Restore Database?' : '🗑️ Delete Backup?'}
            </h3>
            <p className="py-4 text-sm opacity-70">
              {confirmModal.action === 'restore'
                ? `This will replace your current database with the backup. A safety backup will be created automatically. Are you sure?`
                : `This will permanently delete the backup file. This action cannot be undone.`}
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className={`btn btn-sm ${confirmModal.action === 'restore' ? 'btn-warning' : 'btn-error'}`}
                onClick={() => {
                  if (confirmModal.action === 'restore' && confirmModal.filename) {
                    handleRestoreBackup(confirmModal.filename);
                  } else if (confirmModal.action === 'delete' && confirmModal.filename) {
                    handleDeleteBackup(confirmModal.filename);
                  }
                }}
              >
                {confirmModal.action === 'restore' ? 'Restore' : 'Delete'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmModal(null)}></div>
        </div>
      )}

      {/* HARMONIZED PAGE HEADER */}
      <header className="flex justify-between items-center w-full shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase leading-none">Data & Exports</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Portability & Disaster Recovery</p>
        </div>
      </header>

      {/* DATABASE BACKUP SECTION (NEW - FULL WIDTH) */}
      <section className="bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Shield size={14} className="text-success opacity-40" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">SQLite Database Backups</span>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={isBackupLoading}
            className="btn btn-success btn-xs rounded-md font-black uppercase tracking-widest gap-2"
          >
            <Plus size={14} /> Create Backup
          </button>
        </div>

        <div className="p-6">
          {/* BACKUP STATS */}
          {backupStats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-base-200/50 p-4 rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-40 mb-1">Total Backups</div>
                <div className="text-2xl font-bold">{backupStats.totalBackups}</div>
              </div>
              <div className="bg-base-200/50 p-4 rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-40 mb-1">Total Size</div>
                <div className="text-2xl font-bold">{backupStats.totalSizeFormatted}</div>
              </div>
              <div className="bg-base-200/50 p-4 rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-40 mb-1">Newest</div>
                <div className="text-xs font-bold truncate">{backupStats.newestBackup || 'N/A'}</div>
              </div>
              <div className="bg-base-200/50 p-4 rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-40 mb-1">Oldest</div>
                <div className="text-xs font-bold truncate">{backupStats.oldestBackup || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* BACKUP LIST */}
          {isBackupLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase">No backups found</p>
              <p className="text-xs opacity-60">Create your first backup to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-200">
                    <th className="text-[9px] font-black uppercase opacity-40">Timestamp</th>
                    <th className="text-[9px] font-black uppercase opacity-40">Size</th>
                    <th className="text-[9px] font-black uppercase opacity-40">Checksum</th>
                    <th className="text-[9px] font-black uppercase opacity-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.filename} className="hover:bg-base-200/50 transition-colors">
                      <td className="font-mono text-[10px]">{backup.timestamp}</td>
                      <td className="text-[10px] font-bold">{backup.sizeFormatted}</td>
                      <td className="font-mono text-[9px] opacity-60">{backup.checksum.slice(0, 12)}...</td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setConfirmModal({ action: 'restore', filename: backup.filename })}
                            className="btn btn-ghost btn-xs gap-1"
                            title="Restore this backup"
                          >
                            <RotateCcw size={12} /> Restore
                          </button>
                          <button
                            onClick={() => setConfirmModal({ action: 'delete', filename: backup.filename })}
                            className="btn btn-ghost btn-xs gap-1 text-error"
                            title="Delete this backup"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INFO BOX */}
          <div className="mt-6 p-4 rounded-lg bg-info/5 border border-info/10 flex gap-3">
            <AlertCircle size={16} className="text-info shrink-0" />
            <div className="text-[9px] font-bold text-info/60 leading-relaxed uppercase">
              <p className="mb-2">🔒 <strong>Automatic Backups:</strong> A backup is created automatically before every <code>npm run dev</code> and <code>npm run build</code>.</p>
              <p><strong>Retention:</strong> Last 30 backups are kept. Older backups are automatically deleted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SNAPSHOT MANAGEMENT SECTION */}
      <section className="bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <History size={14} className="text-warning opacity-40" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Version History Management</span>
          </div>
          <button
            onClick={handleCleanupAllSnapshots}
            disabled={isSnapshotLoading}
            className="btn btn-warning btn-xs rounded-md font-black uppercase tracking-widest gap-2"
          >
            <Sparkles size={14} /> Cleanup All
          </button>
        </div>

        <div className="p-6">
          {snapshotStats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-base-200/50 p-4 rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-40 mb-1">Total Snapshots</div>
                <div className="text-2xl font-bold">{snapshotStats.totalSnapshots}</div>
              </div>
              <div className="bg-base-200/50 p-4 rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-40 mb-1">Scenes with History</div>
                <div className="text-2xl font-bold">{snapshotStats.scenesWithSnapshots}</div>
              </div>
              <div className="bg-base-200/50 p-4 rounded-lg">
                <div className="text-[9px] font-black uppercase opacity-40 mb-1">Retention Limit</div>
                <div className="text-2xl font-bold">{snapshotStats.retentionLimit === 0 ? 'Unlimited' : snapshotStats.retentionLimit}</div>
              </div>
            </div>
          )}

          <div className="flex items-end gap-4">
            <div className="form-control flex-1 max-w-xs">
              <label className="label py-1 px-0">
                <span className="label-text font-black text-[9px] uppercase opacity-40">Max Snapshots Per Scene</span>
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={retentionInput}
                onChange={(e) => setRetentionInput(parseInt(e.target.value) || 0)}
                className="input input-bordered input-sm w-full font-bold bg-base-100 border-base-300 rounded-lg text-sm"
                placeholder="50"
              />
              <label className="label py-1 px-0">
                <span className="label-text-alt text-[8px] uppercase opacity-40">Set to 0 for unlimited retention</span>
              </label>
            </div>
            <button
              onClick={handleUpdateRetention}
              disabled={isSnapshotLoading}
              className="btn btn-outline btn-sm rounded-md font-black uppercase tracking-widest text-xs gap-2 mb-6"
            >
              Save Limit
            </button>
          </div>

          <div className="p-4 rounded-lg bg-warning/5 border border-warning/10 flex gap-3">
            <AlertCircle size={16} className="text-warning shrink-0" />
            <div className="text-[9px] font-bold text-warning/60 leading-relaxed uppercase">
              <p className="mb-2"><strong>Auto-Cleanup:</strong> Snapshots beyond the retention limit are automatically deleted when new ones are created.</p>
              <p><strong>Manual Cleanup:</strong> Click "Cleanup All" to enforce the retention limit across all scenes immediately.</p>
            </div>
          </div>
        </div>
      </section>

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
