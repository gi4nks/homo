'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams } from 'next/navigation';
import { updateScenePromptGoals, toggleCharacterInScene } from '@/app/actions/scene.actions';
import { Sparkles, Users, RefreshCw, Target } from 'lucide-react';

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

  const scene = book.chapters
    .flatMap((ch: any) => ch.scenes)
    .find((s: any) => s.id === activeSceneId);

  const [localGoals, setLocalSceneGoals] = useState(scene?.promptGoals || '');
  const debouncedGoals = useDebounce(localGoals, 1500);

  useEffect(() => {
    if (debouncedGoals !== (scene?.promptGoals || '')) {
      if (!activeSceneId) return;
      setSaveStatus(true, null);
      startTransition(async () => {
        const res = await updateScenePromptGoals(activeSceneId, debouncedGoals);
        setSaveStatus(false, res.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Error");
      });
    }
  }, [debouncedGoals, activeSceneId, setSaveStatus, scene?.promptGoals]);

  if (!activeSceneId) return null;

  return (
    <div className="p-4 space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
      
      {/* SECTION: SCENE CAST */}
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm" open>
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-secondary">
          <Users size={12} /> Scene Cast
        </summary>
        <div className="collapse-content space-y-3">
          <div className="flex flex-wrap gap-2 pt-2">
            {book.charactersList?.map((char: any) => {
              const isSelected = scene?.characters.some((sc: any) => sc.id === char.id);
              return (
                <button
                  key={char.id}
                  onClick={() => toggleCharacterInScene(activeSceneId, char.id)}
                  className={`btn btn-xs rounded-full px-3 border transition-all ${
                    isSelected ? 'btn-secondary border-secondary shadow-md' : 'btn-ghost border-base-300 opacity-50 grayscale hover:grayscale-0'
                  }`}
                >
                  {char.name}
                </button>
              );
            })}
          </div>
          {(!book.charactersList || book.charactersList.length === 0) && (
            <p className="text-[10px] opacity-40 italic py-2">No characters defined in Book Tab.</p>
          )}
        </div>
      </details>

      {/* SECTION: IMMEDIATE ACTION */}
      <details className="collapse collapse-arrow bg-base-200/50 border border-base-300 shadow-sm" open>
        <summary className="collapse-title text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
          <Sparkles size={12} /> Immediate Action (Beats)
        </summary>
        <div className="collapse-content pt-2">
          <textarea 
            className="textarea textarea-ghost w-full min-h-[250px] text-[11px] leading-relaxed bg-base-100 p-4 border-none focus:ring-0 resize-none custom-scrollbar" 
            placeholder="Describe exactly what happens in this scene for the AI..." 
            value={localGoals} 
            onChange={(e) => setLocalSceneGoals(e.target.value)} 
          />
          <div className="flex justify-end gap-2 mt-2 opacity-20">
             <RefreshCw size={10} className={isPending ? 'animate-spin' : ''} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Auto-syncing Context</span>
          </div>
        </div>
      </details>

    </div>
  );
}
