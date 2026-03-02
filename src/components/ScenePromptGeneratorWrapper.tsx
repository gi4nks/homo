'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PromptGenerator from '@/components/PromptGenerator';

interface ScenePromptGeneratorWrapperProps {
  bookId: string;
}

export default function ScenePromptGeneratorWrapper({ bookId }: ScenePromptGeneratorWrapperProps) {
  const params = useParams();
  const activeSceneId = params.sceneId as string;
  
  if (!activeSceneId) return null;
  
  return <PromptGenerator bookId={bookId} currentSceneId={activeSceneId} />;
}
