'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams } from 'next/navigation';
import { updateScenePromptGoals, toggleCharacterInScene } from '@/app/actions/scene.actions';
import { Sparkles, Users, RefreshCw } from 'lucide-react';

// Custom debounce hook internal to tab for performance
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SceneTab({ book }: { book: any }) {
  const params = useParams();
  const activeSceneId = params.sceneId as string;
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);
  const [isPending, startTransition] = useTransition();

  // Find current scene from prop
  const scene = book.chapters
    .flatMap((c: any) => c.scenes)
    .find((s: any) => s.id === activeSceneId);

  const [localGoals, setLocalSceneGoals] = useState(scene?.promptGoals || '');
  const debouncedGoals = useDebounce(localGoals, 1500);

  // Sync local state when scene changes
  useEffect(() => {
    if (scene) setLocalSceneGoals(scene.promptGoals || '');
  }, [activeSceneId, scene?.promptGoals]);

  // Auto-save logic
  useEffect(() => {
    if (!activeSceneId || debouncedGoals === (scene?.promptGoals || '')) return;

    const save = async () => {
      setSaveStatus(true, null);
      const res = await updateScenePromptGoals(activeSceneId, debouncedGoals);
      if (res.success) {
        setSaveStatus(false, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaveStatus(false, "Error");
      }
    };
    save();
  }, [debouncedGoals]);

  if (!activeSceneId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
        <Sparkles size={40} />
        <p className="text-xs font-bold uppercase tracking-widest text-center px-8">
          Select a scene in the sidebar to view its goals and cast
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* SCENE CASTING */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Users size={12} /> Scene Cast
        </h4>
        <div className="flex flex-wrap gap-2">
          {book.charactersList?.map((char: any) => {
            const isPresent = scene?.characters?.some((c: any) => c.id === char.id);
            return (
              <button 
                key={char.id} 
                onClick={async () => {
                  setSaveStatus(true, null);
                  const res = await toggleCharacterInScene(activeSceneId, char.id);
                  setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
                }} 
                className={`badge badge-sm py-3.5 px-4 font-black uppercase text-[9px] tracking-widest border transition-all ${
                  isPresent ? 'badge-primary border-primary shadow-md' : 'badge-ghost border-base-300 opacity-40 hover:opacity-100'
                }`}
              >
                {char.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* IMMEDIATE ACTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Immediate Action (Beats)</h4>
          {isPending && <RefreshCw size={10} className="animate-spin opacity-30" />}
        </div>
        <textarea 
          className="textarea textarea-bordered w-full h-80 text-[11px] leading-relaxed p-6 font-medium focus:border-primary bg-base-50 shadow-inner resize-none border-base-300" 
          placeholder="Describe exactly what happens in this scene..." 
          value={localGoals} 
          onChange={(e) => setLocalSceneGoals(e.target.value)} 
        />
      </section>
    </div>
  );
}
