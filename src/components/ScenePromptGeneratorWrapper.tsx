'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import PromptGenerator from '@/components/PromptGenerator';

interface ScenePromptGeneratorWrapperProps {
  bookId: string;
}

export default function ScenePromptGeneratorWrapper({ bookId }: ScenePromptGeneratorWrapperProps) {
  const activeSceneId = useWorkspaceStore(state => state.activeSceneId);
  
  if (!activeSceneId) return null;
  
  return <PromptGenerator bookId={bookId} currentSceneId={activeSceneId} />;
}
