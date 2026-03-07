'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAiProfiles, createAiProfile, updateAiProfile, deleteAiProfile } from '@/app/actions/ai.actions';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Cpu, 
  Save, 
  X,
  Star,
  Download
} from 'lucide-react';

export default function AiProfilesPage() {
  const { openConfirmModal } = useWorkspaceStore();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingConfig] = useState<any>(null);

  const loadProfiles = async () => {
    setIsLoading(true);
    const data = await getAiProfiles();
    setProfiles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    openConfirmModal({
      title: "Delete AI Persona",
      message: `Are you sure you want to delete the "${name}" persona? This action cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        const res = await deleteAiProfile(id);
        if (res.success) loadProfiles();
        else alert(res.error);
      }
    });
  };

  const handleToggleDefault = async (profile: any) => {
    if (profile.isDefault) return;
    const res = await updateAiProfile(profile.id, { isDefault: true });
    if (res.success) loadProfiles();
  };

  const handleExportMarkdown = async () => {
    try {
      const response = await fetch('/api/export-profiles');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homo_personas_export_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export personas');
    }
  };

  return (
    <div className="p-12 w-full space-y-12 h-full flex flex-col overflow-hidden">
      
      <header className="flex justify-between items-center shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase">AI Personas</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Writing Behavior Profiles</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportMarkdown} 
            className="btn btn-outline btn-sm px-6 font-black uppercase tracking-widest rounded-md border-base-300 hover:bg-base-200"
          >
            <Download size={16} className="mr-1" /> Export Markdown
          </button>
          <button onClick={() => { setEditingConfig(null); setIsModalOpen(true); }} className="btn btn-primary btn-sm px-6 font-black uppercase tracking-widest rounded-md shadow-lg shadow-primary/20">
            <Plus size={16} className="mr-1" /> New Persona
          </button>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto custom-scrollbar pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20 animate-pulse"><Cpu size={48} /><p className="text-xs font-black uppercase mt-4">Initializing Neural Link...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {profiles.map((profile) => (
              <div key={profile.id} className={`card bg-base-100 border ${profile.isDefault ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-base-200 shadow-sm'} hover:shadow-md transition-all rounded-xl group overflow-hidden flex flex-col h-full`}>
                {profile.isDefault && (
                  <div className="bg-primary text-primary-content text-[8px] font-black uppercase tracking-widest py-1.5 text-center shrink-0">Active Default</div>
                )}
                <div className="card-body p-8 gap-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start shrink-0">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg uppercase tracking-tight text-base-content group-hover:text-primary transition-colors line-clamp-1">{profile.name}</h3>
                      <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">{profile.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingConfig(profile); setIsModalOpen(true); }} className="btn btn-ghost btn-xs btn-square"><Edit2 size={14} /></button>
                      {!profile.isDefault && (
                        <button onClick={() => handleDelete(profile.id, profile.name)} className="btn btn-ghost btn-xs btn-square text-error"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>

                  <div className="bg-base-200/50 rounded-xl p-5 border border-base-300 h-28 overflow-hidden relative group/inner shrink-0">
                    <p className="text-[11px] leading-relaxed text-base-content/70 font-mono italic">"{profile.systemPrompt}"</p>
                    <div className="absolute inset-0 bg-gradient-to-t from-base-200/80 to-transparent opacity-60"></div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-base-200 mt-auto">
                    <button 
                      onClick={() => handleToggleDefault(profile)}
                      disabled={profile.isDefault}
                      className={`btn btn-xs rounded-md px-4 font-black uppercase tracking-widest transition-all ${profile.isDefault ? 'btn-disabled bg-primary/10 text-primary border-none' : 'btn-ghost hover:bg-primary/10 text-base-content/30 hover:text-primary'}`}
                    >
                      <Star size={10} className={`mr-1.5 ${profile.isDefault ? 'fill-primary' : ''}`} /> {profile.isDefault ? 'Primary' : 'Set as Primary'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProfileModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); loadProfiles(); }} 
          profile={editingProfile} 
        />
      )}
    </div>
  );
}

function ProfileModal({ isOpen, onClose, profile }: { isOpen: boolean, onClose: () => void, profile?: any }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    description: profile?.description || '',
    systemPrompt: profile?.systemPrompt || '',
    isDefault: profile?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.systemPrompt) return;

    startTransition(async () => {
      const res = profile 
        ? await updateAiProfile(profile.id, formData)
        : await createAiProfile(formData);
      
      if (res.success) onClose();
      else alert(res.error);
    });
  };

  return (
    <div className="modal modal-open z-[100]">
      <div className="modal-box max-w-2xl p-0 rounded-xl shadow-2xl border border-base-300 overflow-hidden bg-base-100">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 border-b border-base-300 bg-base-200/50 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Cpu size={16} /> {profile ? 'Refine Persona' : 'Forge New Persona'}
            </h3>
            <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control w-full">
                <label className="label py-1"><span className="label-text font-black text-[10px] uppercase opacity-60 tracking-widest">Persona Name</span></label>
                <input 
                  required autoFocus 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. The Grim Scribe" 
                  className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-md bg-base-100" 
                />
              </div>
              <div className="form-control w-full">
                <label className="label py-1"><span className="label-text font-black text-[10px] uppercase opacity-60 tracking-widest">Tagline / Description</span></label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Quick summary of the style" 
                  className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-md bg-base-100" 
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label py-1"><span className="label-text font-black text-[10px] uppercase opacity-60 tracking-widest">System Instructions (The Soul)</span></label>
              <textarea 
                required
                rows={6}
                value={formData.systemPrompt}
                onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
                placeholder="How should the AI behave? e.g. 'Use dark imagery, short sentences...'" 
                className="textarea textarea-bordered w-full font-mono text-[11px] leading-relaxed focus:textarea-primary rounded-md custom-scrollbar bg-base-100" 
              />
              <label className="label">
                <span className="label-text-alt opacity-40 italic">This prompt will be injected at the absolute top of all AI generations.</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary checkbox-sm rounded-md" 
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                />
                <span className="label-text font-black uppercase text-[10px] tracking-widest">Set as default persona</span>
              </label>
            </div>
          </div>

          <div className="px-8 py-6 bg-base-200/50 flex justify-end gap-4 border-t border-base-300">
            <button type="button" className="btn btn-ghost btn-sm font-black uppercase tracking-widest opacity-50" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn btn-primary btn-sm px-10 font-black uppercase tracking-widest shadow-lg shadow-primary/20 ${isPending ? 'loading' : ''}`} disabled={isPending}>
              <Save size={14} className="mr-2" /> {profile ? 'Update Soul' : 'Ignite Persona'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
}
