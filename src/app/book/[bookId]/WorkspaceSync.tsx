'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export default function WorkspaceSync({ title }: { title: string }) {
  const setActiveBookTitle = useWorkspaceStore(state => state.setActiveBookTitle);

  React.useEffect(() => {
    setActiveBookTitle(title);
  }, [title, setActiveBookTitle]);

  return null;
}
