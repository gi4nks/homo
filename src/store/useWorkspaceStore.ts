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
  // Global Metadata (Not in URL)
  activeBookTitle: string | null;
  activeTab: WorkspaceTab;

  // UI State
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  isFocusMode: boolean;
  hasUnsavedChanges: boolean;
  saveStatus: {
    isSaving: boolean;
    lastSynced: string | null;
  };

  // Modal State
  modal: ModalState;

  // Actions
  setActiveBookTitle: (title: string) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleFocusMode: () => void;
  setUnsavedChanges: (status: boolean) => void;
  setSaveStatus: (isSaving: boolean, lastSynced?: string | null) => void;
  
  // Modal Actions
  openMetadataModal: (mode: string, bookId: string, targetId: string | null, title?: string, num?: number) => void;
  closeMetadataModal: () => void;
  updateModalData: (data: Partial<Pick<ModalState, 'title' | 'num'>>) => void;
  
  resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeBookTitle: null,
  activeTab: 'scene',
  
  leftPanelOpen: true,
  rightPanelOpen: true,
  isFocusMode: false,
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

  setActiveBookTitle: (title) => set({ 
    activeBookTitle: title 
  }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

  toggleFocusMode: () => set((state) => ({ 
    isFocusMode: !state.isFocusMode,
    leftPanelOpen: state.isFocusMode ? true : false,
    rightPanelOpen: state.isFocusMode ? true : false,
  })),

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
    activeBookTitle: null,
    hasUnsavedChanges: false,
  })
}));
