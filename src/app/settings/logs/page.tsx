'use client';

import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Download, Trash2, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function LogsSettings() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (!filter) return true;
    return log.toLowerCase().includes(filter.toLowerCase());
  });

  const parsedLogs = filteredLogs.map(log => {
    try {
      return JSON.parse(log);
    } catch {
      return { raw: log };
    }
  });

  return (
    <div className="p-12 w-full flex flex-col h-full space-y-8 overflow-hidden">

      {/* HEADER */}
      <header className="flex justify-between items-center w-full shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase leading-none">System Logs</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Application Event Monitoring</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6 w-full min-h-0">

        {/* CONTROLS */}
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="text"
              placeholder="Filter logs..."
              className="input input-bordered input-sm flex-1 max-w-md font-mono text-xs bg-base-100 rounded-md border-base-300 focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="text-xs font-bold opacity-40 uppercase">
              {filteredLogs.length} / {logs.length} entries
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost gap-2 font-bold uppercase tracking-widest text-[9px]"
              onClick={fetchLogs}
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="flex-1 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex items-center gap-3 shrink-0">
            <Terminal size={14} className="text-primary opacity-40" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Event Stream</span>
          </div>

          <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            {parsedLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full opacity-40">
                <div className="text-center space-y-2">
                  <FileText size={32} className="mx-auto opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No logs available</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-[10px]">
                {parsedLogs.map((entry, index) => (
                  <div
                    key={index}
                    className="p-3 bg-base-200/30 rounded-lg border border-base-300/50 hover:border-primary/30 transition-colors"
                  >
                    {entry.raw ? (
                      <pre className="whitespace-pre-wrap break-words text-[9px] opacity-60">{entry.raw}</pre>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                entry.level === 'error' || entry.level >= 50
                                  ? 'bg-error text-error-content'
                                  : entry.level === 'warn' || entry.level >= 40
                                  ? 'bg-warning text-warning-content'
                                  : entry.level === 'info' || entry.level >= 30
                                  ? 'bg-info text-info-content'
                                  : 'bg-base-300 opacity-60'
                              }`}
                            >
                              {entry.level >= 50 ? 'ERROR' : entry.level >= 40 ? 'WARN' : entry.level >= 30 ? 'INFO' : 'DEBUG'}
                            </span>
                            <span className="text-[9px] font-bold opacity-40">
                              {entry.time ? new Date(entry.time).toLocaleString() : '---'}
                            </span>
                          </div>
                          {entry.event && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[8px] font-bold uppercase">
                              {entry.event}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium mt-2">{entry.msg || entry.message || '---'}</p>
                        {(entry.sceneId || entry.bookId || entry.duration) && (
                          <div className="flex items-center gap-4 mt-2 text-[9px] opacity-40">
                            {entry.sceneId && <span>Scene: {entry.sceneId.slice(0, 8)}</span>}
                            {entry.bookId && <span>Book: {entry.bookId.slice(0, 8)}</span>}
                            {entry.duration && <span>Duration: {entry.duration}ms</span>}
                          </div>
                        )}
                        {entry.error && (
                          <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-[9px] text-error">
                            <p className="font-bold">Error: {entry.error.message}</p>
                            {entry.error.stack && (
                              <pre className="mt-1 text-[8px] opacity-60 whitespace-pre-wrap break-words">
                                {entry.error.stack}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
