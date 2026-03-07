'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getGenreConfigs, deleteGenreConfig } from '@/app/actions/genreActions';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Settings as SettingsIcon,
  Search,
  Wand2,
  AlertCircle
} from 'lucide-react';
import GenreModal from '@/components/GenreModal';

export default function GenreManagerPage() {
  const { openConfirmModal } = useWorkspaceStore();
  const [configs, setConfigs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const data = await getGenreConfigs();
    setConfigs(data);
  };

  const handleDelete = async (id: string, name: string) => {
    openConfirmModal({
      title: "Delete Genre Rules",
      message: `Are you sure you want to delete the "${name}" configuration? This will affect all books assigned to this genre.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        await deleteGenreConfig(id);
        loadConfigs();
      }
    });
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const filteredConfigs = configs.filter(c => 
    c.genreName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-12 w-full space-y-12">
      
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase">Genre Prompt Rules</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Global Drafting Directives</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter genres..." 
              className="input input-bordered input-sm w-full pl-10 bg-base-100 border-base-300 focus:input-primary transition-all rounded-md text-[11px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-primary btn-sm rounded-md font-black uppercase tracking-widest text-[10px] px-8 shadow-md"
            onClick={() => { setEditingConfig(null); setIsModalOpen(true); }}
          >
            <Plus size={14} className="mr-1" /> Add Genre
          </button>
        </div>
      </header>

      <div className="space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4 shadow-sm">
           <AlertCircle className="text-primary shrink-0" size={20} />
           <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Intelligence Mapping</h4>
              <p className="text-xs text-base-content/70 font-medium leading-relaxed mt-1">
                 Ensure the **Genre Name** matches exactly the genre you type in your Book Bible. These rules are injected automatically into the AI Prompt Engine.
              </p>
           </div>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-xl shadow-sm overflow-hidden w-full">
          <table className="table table-sm w-full table-fixed">
            <thead className="bg-base-200/50 border-b border-base-300 text-base-content/50">
              <tr className="text-[10px] uppercase tracking-widest font-black">
                <th className="pl-8 py-5 w-[20%]">Target Genre</th>
                <th className="py-5 w-[65%]">Custom Drafting Rules</th>
                <th className="text-right pr-8 py-5 w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {filteredConfigs.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-24 opacity-30 italic font-bold uppercase text-[10px] tracking-widest">
                     No custom genre rules found
                  </td>
                </tr>
              )}
              {filteredConfigs.map((config) => (
                <tr key={config.id} className="hover:bg-primary/5 group transition-colors">
                  <td className="pl-8 py-6 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-black text-[10px] shadow-lg shadow-primary/20 shrink-0">
                         {config.genreName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-black text-xs uppercase tracking-tight text-base-content truncate">{config.genreName}</span>
                    </div>
                  </td>
                  <td className="py-6 align-top">
                    <div className="bg-base-200/50 border border-base-300 rounded-lg p-5 font-mono text-[10px] leading-relaxed text-base-content/70 shadow-inner group-hover:bg-base-100 transition-colors whitespace-pre-wrap break-words">
                      {config.customPromptRules}
                    </div>
                  </td>
                  <td className="text-right pr-8 py-6 align-top">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="btn btn-ghost btn-xs btn-square hover:bg-primary hover:text-primary-content transition-all shadow-sm border border-base-300"
                        onClick={() => handleEdit(config)}
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error hover:text-error-content transition-all shadow-sm border border-base-300"
                        onClick={() => handleDelete(config.id, config.genreName)}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GenreModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); loadConfigs(); }} 
        editingConfig={editingConfig} 
      />
    </div>
  );
}
