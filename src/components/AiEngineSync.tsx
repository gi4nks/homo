'use client';

import React, { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { getAppSettings } from '@/app/actions/ai.actions';

export default function AiEngineSync() {
  const setAiEngine = useWorkspaceStore(state => state.setAiEngine);

  useEffect(() => {
    const sync = async () => {
      const settings = await getAppSettings();
      setAiEngine(settings.activeProvider, settings.activeModelName);
    };
    sync();
  }, [setAiEngine]);

  return null;
}
