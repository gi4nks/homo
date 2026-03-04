'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getAiProfiles, seedAiProfiles } from '@/app/actions/ai.actions';
import { Cpu, ChevronDown } from 'lucide-react';

export default function AiProfileSelector() {
  const activeAiProfileId = useWorkspaceStore(state => state.activeAiProfileId);
  const setActiveAiProfileId = useWorkspaceStore(state => state.setActiveAiProfileId);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      // Ensure we have profiles seeded
      await seedAiProfiles();
      const data = await getAiProfiles();
      setProfiles(data);
      
      // Auto-select default if none active
      if (!activeAiProfileId && data.length > 0) {
        const defaultProfile = data.find(p => p.isDefault) || data[0];
        setActiveAiProfileId(defaultProfile.id);
      }
      setIsLoading(false);
    };
    load();
  }, [activeAiProfileId, setActiveAiProfileId]);

  const activeProfile = profiles.find(p => p.id === activeAiProfileId);

  return (
    <div className="dropdown dropdown-top dropdown-end">
      <div 
        tabIndex={0} 
        role="button"
        className="flex items-center gap-2 px-3 py-1.5 bg-base-200 hover:bg-base-300 rounded-lg cursor-pointer transition-all border border-base-300 group shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="p-1 bg-primary/10 rounded text-primary group-hover:scale-110 transition-transform">
          <Cpu size={12} />
        </div>
        <div className="flex flex-col items-start leading-none gap-1">
          <span className="text-[8px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">Persona</span>
          <span className="text-[10px] font-bold truncate max-w-[80px]">
            {isLoading ? '...' : (activeProfile?.name || 'Standard')}
          </span>
        </div>
        <ChevronDown size={12} className="opacity-20 group-hover:opacity-50 transition-opacity ml-1" />
      </div>
      
      <div tabIndex={0} className="dropdown-content z-[100] mb-3">
        <ul className="menu p-2 shadow-2xl bg-base-100 rounded-2xl border border-base-200 w-72 max-h-[400px] overflow-y-auto custom-scrollbar flex-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
          <li className="menu-title px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 border-b border-base-200 mb-1 sticky top-0 bg-base-100 z-20">
            AI Writing Profiles
          </li>
          {profiles.map(profile => (
            <li key={profile.id} className="p-0">
              <button 
                type="button"
                className={`flex flex-col items-start gap-1 py-3 px-4 rounded-xl my-0.5 mx-1 transition-colors ${activeAiProfileId === profile.id ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}`}
                onClick={() => {
                  setActiveAiProfileId(profile.id);
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }}
              >
                <span className="font-black text-[11px] uppercase tracking-tight text-left leading-tight w-full">{profile.name}</span>
                <span className="text-[9px] opacity-60 leading-tight normal-case font-medium text-left">{profile.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
