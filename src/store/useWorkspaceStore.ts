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

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

interface WorkspaceState {
  // Global Metadata (Not in URL)
  activeBookTitle: string | null;
  activeTab: WorkspaceTab;
  activeAiProfileId: string | null;

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
  confirmModal: ConfirmModalState;

  // Actions
  setActiveBookTitle: (title: string) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  setActiveAiProfileId: (id: string | null) => void;

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleFocusMode: () => void;
  setUnsavedChanges: (status: boolean) => void;
  setSaveStatus: (isSaving: boolean, lastSynced?: string | null) => void;

  // Modal Actions
  openMetadataModal: (mode: string, bookId: string, targetId: string | null, title?: string, num?: number) => void;
  closeMetadataModal: () => void;
  updateModalData: (data: Partial<Pick<ModalState, 'title' | 'num'>>) => void;

  // Confirm Modal Actions
  openConfirmModal: (config: Omit<ConfirmModalState, 'isOpen'>) => void;
  closeConfirmModal: () => void;

  resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeBookTitle: null,
  activeTab: 'scene',
  activeAiProfileId: null,

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

  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  },

  setActiveBookTitle: (title) => set({ activeBookTitle: title }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveAiProfileId: (id) => set({ activeAiProfileId: id }),

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

  openConfirmModal: (config) => set({
    confirmModal: { ...config, isOpen: true }
  }),

  closeConfirmModal: () => set((state) => ({
    confirmModal: { ...state.confirmModal, isOpen: false }
  })),

  resetWorkspace: () => set({
    activeBookTitle: null,
    activeAiProfileId: null,
    hasUnsavedChanges: false,
  })
}));

