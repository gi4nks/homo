'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAiProfiles, createAiProfile, updateAiProfile, deleteAiProfile } from '@/app/actions/ai.actions';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  Cpu, 
  ShieldCheck, 
  Wand2, 
  Save, 
  X,
  Star
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

  return (
    <main className="h-screen bg-slate-50 flex flex-col relative text-slate-900 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.06]">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[150px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-400 rounded-full blur-[150px]"></div>
      </div>

      <header className="px-8 py-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/settings" className="btn btn-ghost btn-sm btn-circle"><ChevronLeft size={20} /></Link>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
              <Cpu className="text-blue-600" /> AI Personas
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Writing Behavior Profiles</p>
          </div>
        </div>
        <button onClick={() => { setEditingConfig(null); setIsModalOpen(true); }} className="btn btn-primary btn-sm px-6 font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">
          <Plus size={16} className="mr-1" /> New Persona
        </button>
      </header>

      <div className="p-8 lg:p-12 flex-grow z-10 overflow-y-auto custom-scrollbar pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20 animate-pulse"><Cpu size={48} /><p className="text-xs font-black uppercase mt-4">Initializing Neural Link...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className={`card bg-white border ${profile.isDefault ? 'border-blue-500 shadow-xl' : 'border-slate-200 shadow-sm'} hover:shadow-md transition-all rounded-2xl group overflow-hidden`}>
                {profile.isDefault && (
                  <div className="bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center">Active Default</div>
                )}
                <div className="card-body p-6 gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="font-black text-lg uppercase tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{profile.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingConfig(profile); setIsModalOpen(true); }} className="btn btn-ghost btn-xs btn-square"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(profile.id, profile.name)} className="btn btn-ghost btn-xs btn-square text-error"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 h-24 overflow-hidden relative group/inner">
                    <p className="text-[11px] leading-relaxed text-slate-500 font-mono italic">"{profile.systemPrompt}"</p>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent opacity-60"></div>
                  </div>

                  <div className="card-actions justify-end mt-2">
                    <button 
                      onClick={() => handleToggleDefault(profile)}
                      className={`btn btn-xs rounded-full px-4 font-black uppercase tracking-widest transition-all ${profile.isDefault ? 'btn-disabled bg-blue-100 text-blue-500' : 'btn-ghost hover:bg-blue-50 text-slate-400 hover:text-blue-600'}`}
                    >
                      <Star size={10} className="mr-1.5" /> Set Default
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
    </main>
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
      <div className="modal-box max-w-2xl p-0 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
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
                  className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-xl" 
                />
              </div>
              <div className="form-control w-full">
                <label className="label py-1"><span className="label-text font-black text-[10px] uppercase opacity-60 tracking-widest">Tagline / Description</span></label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Quick summary of the style" 
                  className="input input-bordered input-sm w-full font-bold focus:input-primary rounded-xl" 
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
                className="textarea textarea-bordered w-full font-mono text-[11px] leading-relaxed focus:textarea-primary rounded-xl custom-scrollbar" 
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

          <div className="px-8 py-6 bg-slate-50 flex justify-end gap-4 border-t border-slate-100">
            <button type="button" className="btn btn-ghost btn-sm font-black uppercase tracking-widest opacity-50" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn btn-primary btn-sm px-10 font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 ${isPending ? 'loading' : ''}`} disabled={isPending}>
              <Save size={14} className="mr-2" /> {profile ? 'Update Soul' : 'Ignite Persona'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
}
