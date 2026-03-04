'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getGenreConfigs, deleteGenreConfig } from '@/app/actions/genreActions';
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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this configuration? This will affect all books assigned to this genre.')) {
      await deleteGenreConfig(id);
      loadConfigs();
    }
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const filteredConfigs = configs.filter(c => 
    c.genreName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-grow bg-slate-50 flex flex-col relative overflow-hidden text-slate-900">
      {/* ATMOSPHERE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[150px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-400 rounded-full blur-[150px]"></div>
      </div>

      {/* TOOLBAR & SEARCH */}
      <div className="px-8 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between shrink-0 z-10">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Filter by genre name..." 
            className="input input-bordered input-sm w-full pl-10 bg-slate-100 border-slate-200 focus:bg-white focus:border-slate-900 transition-all rounded-md text-slate-900 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-100 shadow-sm mr-4">
             <Wand2 size={12} />
             <span className="text-[9px] font-black uppercase tracking-widest">Active Pipeline</span>
          </div>
          <button 
            className="btn btn-primary btn-sm rounded-md font-bold uppercase tracking-widest text-[10px] px-8 shadow-md"
            onClick={() => { setEditingConfig(null); setIsModalOpen(true); }}
          >
            <Plus size={14} className="mr-1" /> Add New Genre
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - EDGE TO EDGE */}
      <div className="p-6 flex-grow overflow-y-auto z-10 custom-scrollbar pb-32">
        <div className="w-full flex flex-col gap-6">
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-4 shadow-sm">
             <AlertCircle className="text-amber-500 shrink-0" size={20} />
             <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-800">Pro Tip</h4>
                <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
                   Ensure the **Genre Name** matches exactly the genre you type in your Book Bible. These rules are injected automatically into the AI Prompt Engine.
                </p>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden w-full">
            <table className="table table-sm w-full table-fixed text-slate-900">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr className="text-[10px] uppercase tracking-widest">
                  <th className="pl-8 font-black py-5 w-[20%]">Target Genre</th>
                  <th className="font-black py-5 w-[65%]">Custom Drafting Rules</th>
                  <th className="font-black py-5 text-right pr-8 w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConfigs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-24 text-slate-300 italic font-medium">
                       No custom genre rules found. Create one to enhance your AI prompts.
                    </td>
                  </tr>
                )}
                {filteredConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="pl-8 py-6 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shadow-md shrink-0">
                           {config.genreName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-black text-xs uppercase tracking-tight text-slate-900 truncate">{config.genreName}</span>
                      </div>
                    </td>
                    <td className="py-6 align-top">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-[10px] leading-relaxed text-slate-600 shadow-inner group-hover:bg-white transition-colors whitespace-pre-wrap break-words">
                        {config.customPromptRules}
                      </div>
                    </td>
                    <td className="text-right pr-8 py-6 align-top">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="btn btn-ghost btn-xs btn-square text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-200"
                          onClick={() => handleEdit(config)}
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          className={`btn btn-ghost btn-xs btn-square text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-200`}
                          onClick={() => handleDelete(config.id)}
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
      </div>

      <GenreModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); loadConfigs(); }} 
        editingConfig={editingConfig} 
      />

      <footer className="p-4 bg-white border-t border-slate-200 text-center z-20">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">HOMO Rule Engine v2.3</p>
      </footer>
    </main>
  );
}
