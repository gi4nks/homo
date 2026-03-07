import { create } from 'zustand';

export type WorkspaceTab = 'book' | 'chapter' | 'scene';

export interface Scene {
  id: string;
  title: string;
  orderIndex: number;
  sceneNumber: number;
  wordCount: number;
}

export interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  chapterNumber: number;
  scenes: Scene[];
}

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
  
  // AI Engine Info
  activeProvider: string | null;
  activeModelName: string | null;
  
  // Sidebar State (Single Source of Truth)
  chapters: Chapter[];
  
  // Scene Default (Persistent in DB)
  activeAiProfileId: string | null;
  activePromptTemplateId: string | null;

  // Local Override (Ephemeral for immediate action)
  overrideAiProfileId: string | null;
  overridePromptTemplateId: string | null;

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
  setAiEngine: (provider: string, model: string) => void;
  
  // Actions for Sidebar
  setChapters: (chapters: Chapter[]) => void;
  updateSceneWordCount: (sceneId: string, wordCount: number) => void;
  
  // Actions for Scene Defaults
  setActiveAiProfileId: (id: string | null) => void;
  setActivePromptTemplateId: (id: string | null) => void;

  // Actions for Local Overrides
  setOverrideAiProfileId: (id: string | null) => void;
  setOverridePromptTemplateId: (id: string | null) => void;

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
  
  activeProvider: null,
  activeModelName: null,

  chapters: [],

  activeAiProfileId: null,
  activePromptTemplateId: null,
  overrideAiProfileId: null,
  overridePromptTemplateId: null,

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
  setAiEngine: (provider, model) => set({ activeProvider: provider, activeModelName: model }),
  
  setChapters: (chapters) => set({ chapters }),
  updateSceneWordCount: (sceneId, wordCount) => set((state) => ({
    chapters: state.chapters.map(chapter => ({
      ...chapter,
      scenes: chapter.scenes.map(scene => 
        scene.id === sceneId ? { ...scene, wordCount } : scene
      )
    }))
  })),

  setActiveAiProfileId: (id) => set({ 
    activeAiProfileId: id,
    overrideAiProfileId: id // Sync override to new default
  }),
  setActivePromptTemplateId: (id) => set({ 
    activePromptTemplateId: id,
    overridePromptTemplateId: id // Sync override to new default
  }),

  setOverrideAiProfileId: (id) => set({ overrideAiProfileId: id }),
  setOverridePromptTemplateId: (id) => set({ overridePromptTemplateId: id }),

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
    activePromptTemplateId: null,
    overrideAiProfileId: null,
    overridePromptTemplateId: null,
    hasUnsavedChanges: false,
    chapters: [],
    activeProvider: null,
    activeModelName: null,
  })
}));
