'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getAiProfiles, seedAiProfiles } from '@/app/actions/ai.actions';
import { UserCircle } from 'lucide-react';
import FooterSelector from './FooterSelector';

export default function AiProfileSelector() {
  const activeAiProfileId = useWorkspaceStore(state => state.activeAiProfileId);
  const overrideAiProfileId = useWorkspaceStore(state => state.overrideAiProfileId);
  const setOverrideAiProfileId = useWorkspaceStore(state => state.setOverrideAiProfileId);
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await seedAiProfiles();
      const data = await getAiProfiles();
      setProfiles(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const activeProfile = profiles.find(p => p.id === activeAiProfileId);
  const overrideProfile = profiles.find(p => p.id === overrideAiProfileId);
  const displayProfile = overrideProfile || activeProfile;
  
  const isOverridden = overrideAiProfileId !== null && overrideAiProfileId !== activeAiProfileId;

  const handleSelect = (id: string | null) => {
    setOverrideAiProfileId(id);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <FooterSelector
      label={isOverridden ? 'Override' : 'Persona'}
      value={isLoading ? '...' : (displayProfile?.name || 'Standard')}
      icon={UserCircle}
      isOverridden={isOverridden}
      isLoading={isLoading}
    >
      <li className="menu-title px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 border-b border-base-200 mb-1 sticky top-0 bg-base-100 z-20">
        Contextual Persona
      </li>

      {/* Reset Option */}
      <li className="p-0">
        <button 
          type="button"
          className={`flex flex-col items-start gap-1 py-3 px-4 rounded-xl my-0.5 mx-1 transition-colors ${!isOverridden ? 'bg-primary/5 text-primary' : 'hover:bg-base-200'}`}
          onClick={() => handleSelect(activeAiProfileId)}
        >
          <span className="font-black text-[11px] uppercase tracking-tight text-left leading-tight w-full">Use Scene Default</span>
          <span className="text-[9px] opacity-60 leading-tight normal-case font-medium text-left">Sync with Inspector settings.</span>
        </button>
      </li>

      <div className="divider my-1 opacity-5 px-4"></div>

      {profiles.map(profile => (
        <li key={profile.id} className="p-0">
          <button 
            type="button"
            className={`flex flex-col items-start gap-1 py-3 px-4 rounded-xl my-0.5 mx-1 transition-colors ${overrideAiProfileId === profile.id ? 'bg-secondary/10 text-secondary' : 'hover:bg-base-200'}`}
            onClick={() => handleSelect(profile.id)}
          >
            <span className="font-black text-[11px] uppercase tracking-tight text-left leading-tight w-full">{profile.name}</span>
            <span className="text-[9px] opacity-60 leading-tight normal-case font-medium text-left">{profile.description}</span>
          </button>
        </li>
      ))}
    </FooterSelector>
  );
}
