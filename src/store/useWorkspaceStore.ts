import { create } from 'zustand';

export type WorkspaceTab = 'book' | 'chapter' | 'scene';

interface ModalState {
  isOpen: boolean;
  mode: string;
  bookId: string;
  targetId: string | null;
  title: string;
  num: number;
}

interface WorkspaceState {
  // IDs & Hierarchy
  activeBookId: string | null;
  activeBookTitle: string | null;
  activeChapterId: string | null;
  activeSceneId: string | null;
  activeTab: WorkspaceTab;

  // UI State
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  hasUnsavedChanges: boolean;
  saveStatus: {
    isSaving: boolean;
    lastSynced: string | null;
  };

  // Modal State
  modal: ModalState;

  // Actions
  setActiveBook: (id: string, title: string) => void;
  setActiveChapter: (id: string) => void;
  setActiveScene: (sceneId: string, chapterId: string) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setUnsavedChanges: (status: boolean) => void;
  setSaveStatus: (isSaving: boolean, lastSynced?: string | null) => void;
  
  // Modal Actions
  openMetadataModal: (mode: string, bookId: string, targetId: string | null, title?: string, num?: number) => void;
  closeMetadataModal: () => void;
  updateModalData: (data: Partial<Pick<ModalState, 'title' | 'num'>>) => void;
  
  resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeBookId: null,
  activeBookTitle: null,
  activeChapterId: null,
  activeSceneId: null,
  activeTab: 'scene',
  
  leftPanelOpen: true,
  rightPanelOpen: true,
  hasUnsavedChanges: false,
  saveStatus: { isSaving: false, lastSynced: null },
  
  modal: {
    isOpen: false,
    mode: '',
    bookId: '',
    targetId: null,
    title: '',
    num: 1,
  },

  setActiveBook: (id, title) => set({ 
    activeBookId: id, 
    activeBookTitle: title 
  }),

  setActiveChapter: (id) => set({ 
    activeChapterId: id, 
    activeSceneId: null, 
    activeTab: 'chapter' 
  }),

  setActiveScene: (sceneId, chapterId) => set({ 
    activeSceneId: sceneId, 
    activeChapterId: chapterId, 
    activeTab: 'scene' 
  }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

  setUnsavedChanges: (status) => set({ hasUnsavedChanges: status }),

  setSaveStatus: (isSaving, lastSynced = null) => set((state) => ({
    saveStatus: { 
      isSaving, 
      lastSynced: lastSynced || state.saveStatus.lastSynced 
    }
  })),

  openMetadataModal: (mode, bookId, targetId, title = '', num = 1) => set({
    modal: { isOpen: true, mode, bookId, targetId, title, num }
  }),

  closeMetadataModal: () => set((state) => ({
    modal: { ...state.modal, isOpen: false }
  })),

  updateModalData: (data) => set((state) => ({
    modal: { ...state.modal, ...data }
  })),

  resetWorkspace: () => set({
    activeBookId: null,
    activeBookTitle: null,
    activeChapterId: null,
    activeSceneId: null,
    hasUnsavedChanges: false,
  })
}));
