'use client';

import React, { useRef } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export default function WorkspaceSync({ title, chapters, inspectorBindings, isCacheHit }: { title: string, chapters: any[], inspectorBindings?: any, isCacheHit?: boolean }) {
  const setActiveBookTitle = useWorkspaceStore(state => state.setActiveBookTitle);
  const setChapters = useWorkspaceStore(state => state.setChapters);
  const setInspectorBindings = useWorkspaceStore(state => state.setInspectorBindings);
  const setCacheActive = useWorkspaceStore(state => state.setCacheActive);
  
  const prevChaptersRef = useRef<string>('');
  const prevBindingsRef = useRef<string>('');
  const prevTitleRef = useRef<string>('');
  const prevCacheRef = useRef<boolean | null>(null);

  React.useEffect(() => {
    // Only update if title actually changed
    if (title !== prevTitleRef.current) {
      setActiveBookTitle(title);
      prevTitleRef.current = title;
    }
    
    // Only update chapters if content string changed (prevents reference-based loops)
    const chaptersStr = JSON.stringify(chapters);
    if (chaptersStr !== prevChaptersRef.current) {
      setChapters(chapters);
      prevChaptersRef.current = chaptersStr;
    }

    // Only update bindings if content string changed
    if (inspectorBindings) {
      const bindingsStr = JSON.stringify(inspectorBindings);
      if (bindingsStr !== prevBindingsRef.current) {
        setInspectorBindings(inspectorBindings);
        prevBindingsRef.current = bindingsStr;
      }
    }

    if (isCacheHit !== undefined && isCacheHit !== prevCacheRef.current) {
      setCacheActive(isCacheHit);
      prevCacheRef.current = isCacheHit;
    }
  }, [title, chapters, inspectorBindings, isCacheHit, setActiveBookTitle, setChapters, setInspectorBindings, setCacheActive]);

  return null;
}
