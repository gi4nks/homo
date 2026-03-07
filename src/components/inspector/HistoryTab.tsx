'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useParams, useRouter } from 'next/navigation';
import { getSnapshotsBySceneId, createSnapshot, deleteSnapshot, restoreSnapshot } from '@/app/actions/snapshot.actions';
import { getSceneById } from '@/app/actions/scene.actions';
import { History, Camera, RotateCcw, Trash2, Clock, CheckCircle2, Search } from 'lucide-react';
import InspectorSection from './InspectorSection';
import DiffModal from './DiffModal';

export default function HistoryTab({ book }: { book: any }) {
  const params = useParams();
  const router = useRouter();
  const activeSceneId = params.sceneId as string;
  const activeBookId = params.bookId as string;
  const setSaveStatus = useWorkspaceStore((state) => state.setSaveStatus);
  const openConfirmModal = useWorkspaceStore((state) => state.openConfirmModal);
  
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [selectedSnapshotIds, setSelectedSnapshotIds] = useState<string[]>([]);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadSnapshots = async () => {
    if (!activeSceneId) return;
    setIsLoading(true);
    const data = await getSnapshotsBySceneId(activeSceneId);
    setSnapshots(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSnapshots();
    setSelectedSnapshotIds([]);
  }, [activeSceneId]);

  const handleTakeSnapshot = async () => {
    if (!activeSceneId) return;
    setSaveStatus(true, "Fetching...");
    const resScene = await getSceneById(activeSceneId);
    if (!resScene.success || !resScene.data) {
      setSaveStatus(false, "Load Error");
      return;
    }
    setSaveStatus(true, "Capturing...");
    const content = resScene.data.content || "";
    const res = await createSnapshot(activeSceneId, content, "Manual Backup");
    if (res.success) {
      setSaveStatus(false, "Captured");
      loadSnapshots();
    } else {
      setSaveStatus(false, "Error");
    }
  };

  const handleRestore = (id: string) => {
    openConfirmModal({
      title: "Restore Version",
      message: "Are you sure? This will overwrite your current scene content. This action can be undone via Version History.",
      confirmLabel: "Confirm Overwrite",
      onConfirm: async () => {
        setSaveStatus(true, "Restoring...");
        const res = await restoreSnapshot(id);
        if (res.success) {
          setSaveStatus(false, "Restored");
          router.refresh();
        } else {
          setSaveStatus(false, "Error");
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    const res = await deleteSnapshot(id);
    if (res.success) {
      loadSnapshots();
      setSelectedSnapshotIds(prev => prev.filter(sid => sid !== id));
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedSnapshotIds(prev => {
      if (prev.includes(id)) return prev.filter(sid => sid !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const getSelectedSnapshots = () => {
    return selectedSnapshotIds
      .map(id => snapshots.find(s => s.id === id))
      .filter(Boolean)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const selectedSnapshots = getSelectedSnapshots();

  if (!activeSceneId) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center opacity-30">
        <History size={48} className="mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Select a scene to view history</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 animate-in fade-in slide-in-from-right-2 duration-300 pb-32">
      
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-6 flex flex-col gap-3">
        <button 
          onClick={handleTakeSnapshot}
          className="btn btn-primary btn-sm w-full rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
        >
          <Camera size={14} className="mr-2" /> Take Manual Snapshot
        </button>

        {selectedSnapshotIds.length === 2 && (
          <button 
            onClick={() => setIsDiffModalOpen(true)}
            className="btn btn-secondary btn-sm w-full rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 animate-in zoom-in duration-200"
          >
            <Search size={14} className="mr-2" /> Compare Selected Versions
          </button>
        )}
      </div>

      <InspectorSection title="Version Timeline" icon={Clock} collapsible={false}>
        {isLoading ? (
          <div className="flex justify-center py-10 opacity-20">
            <div className="loading loading-spinner loading-sm"></div>
          </div>
        ) : snapshots.length === 0 ? (
          <div className="py-10 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest">
            No snapshots found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {snapshots.map((ss) => (
              <div 
                key={ss.id} 
                className={`p-4 bg-base-100 border rounded-xl group transition-all shadow-sm cursor-pointer ${selectedSnapshotIds.includes(ss.id) ? 'border-secondary ring-1 ring-secondary/30 bg-secondary/5' : 'border-base-300 hover:border-primary/30'}`}
                onClick={() => toggleSelection(ss.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-xs checkbox-secondary rounded" 
                      checked={selectedSnapshotIds.includes(ss.id)}
                      readOnly
                    />
                    <div className="flex flex-col leading-tight">
                      <span className={`text-[10px] font-black uppercase tracking-tight ${ss.label?.includes('Auto') ? 'text-secondary' : 'text-primary'}`}>
                        {ss.label || 'Snapshot'}
                      </span>
                      <span className="text-[9px] opacity-40 font-bold">
                        {new Date(ss.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(ss.id); }}
                    className="btn btn-ghost btn-xs btn-square text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRestore(ss.id); }}
                    className="btn btn-outline btn-xs flex-1 rounded-lg font-black uppercase tracking-widest text-[9px] border-base-300 hover:btn-primary"
                  >
                    <RotateCcw size={10} className="mr-1.5" /> Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </InspectorSection>

      {isDiffModalOpen && selectedSnapshots.length === 2 && (
        <DiffModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          originalTitle={`${selectedSnapshots[0].label} (${new Date(selectedSnapshots[0].createdAt).toLocaleTimeString()})`}
          revisedTitle={`${selectedSnapshots[1].label} (${new Date(selectedSnapshots[1].createdAt).toLocaleTimeString()})`}
          originalContent={selectedSnapshots[0].content.replace(/<[^>]*>/g, '\n')} 
          revisedContent={selectedSnapshots[1].content.replace(/<[^>]*>/g, '\n')} 
          bookId={activeBookId}
          sceneId={activeSceneId}
        />
      )}

    </div>
  );
}
