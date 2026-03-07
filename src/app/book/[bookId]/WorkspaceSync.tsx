'use client';

import React, { useRef } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export default function WorkspaceSync({ title, chapters }: { title: string, chapters: any[] }) {
  const setActiveBookTitle = useWorkspaceStore(state => state.setActiveBookTitle);
  const setChapters = useWorkspaceStore(state => state.setChapters);
  const chaptersInStore = useWorkspaceStore(state => state.chapters);
  
  const isFirstSync = useRef(true);

  React.useEffect(() => {
    setActiveBookTitle(title);
    
    if (chapters) {
      if (isFirstSync.current) {
        setChapters(chapters);
        isFirstSync.current = false;
      } else {
        // Only update if structural changes occur (new chapters/scenes deleted)
        // or if the store is empty.
        if (chaptersInStore.length === 0 || chapters.length !== chaptersInStore.length) {
          setChapters(chapters);
        }
      }
    }
  }, [title, chapters, setActiveBookTitle, setChapters]);

  return null;
}
