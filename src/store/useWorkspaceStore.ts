import { create } from 'zustand';

export type WorkspaceTab = 'book' | 'chapter' | 'scene' | 'history';

export interface Scene {
  id: string;
  title: string;
  orderIndex: number;
  sceneNumber: number;
  wordCount: number;
  isLocked?: boolean;
  promptGoals?: string;
  auditReport?: string;
  narrativePosition?: string;
  defaultAiProfileId?: string | null;
  defaultPromptTemplateId?: string | null;
}

export interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  chapterNumber: number;
  auditReport?: string;
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
  isCacheActive: boolean;
  
  // Sidebar State (Single Source of Truth)
  chapters: Chapter[];
  
  // Scene Default (Persistent in DB)
  activeAiProfileId: string | null;
  activePromptTemplateId: string | null;

  // AI Inspector Bindings
  inspectorBindings: Record<string, { templateId: string | null, personaId: string | null }>;

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

  // AI Edit Undo System
  lastAiEdit: {
    range: { from: number; to: number };
    oldContent: string;
    newContent: string;
    timestamp: number;
  } | null;

  // Global Editor Reference for Inspector AI Actions
  editorRef: any | null;

  // Actions
  setActiveBookTitle: (title: string) => void;
  setCacheActive: (status: boolean) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  setAiEngine: (provider: string, model: string) => void;
  
  // Actions for Sidebar
  setChapters: (chapters: Chapter[]) => void;
  updateSceneWordCount: (sceneId: string, wordCount: number) => void;
  updateSceneLock: (sceneId: string, isLocked: boolean) => void;
  
  // Actions for Scene Defaults
  setActiveAiProfileId: (id: string | null) => void;
  setActivePromptTemplateId: (id: string | null) => void;
  setInspectorBindings: (bindings: Record<string, { templateId: string | null, personaId: string | null }>) => void;

  setEditorRef: (ref: any | null) => void;

  // Actions for Local Overrides
  setOverrideAiProfileId: (id: string | null) => void;
  setOverridePromptTemplateId: (id: string | null) => void;

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleFocusMode: () => void;
  setUnsavedChanges: (status: boolean) => void;
  setSaveStatus: (isSaving: boolean, lastSynced?: string | null) => void;

  // AI Edit Undo Actions
  setLastAiEdit: (edit: { range: { from: number; to: number }; oldContent: string; newContent: string }) => void;
  clearLastAiEdit: () => void;

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
  isCacheActive: false,

  chapters: [],

  activeAiProfileId: null,
  activePromptTemplateId: null,
  inspectorBindings: {},
  overrideAiProfileId: null,
  overridePromptTemplateId: null,

  leftPanelOpen: true,
  rightPanelOpen: true,
  isFocusMode: false,
  hasUnsavedChanges: false,
  saveStatus: { isSaving: false, lastSynced: null },

  lastAiEdit: null,
  editorRef: null,

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
  setCacheActive: (status) => set({ isCacheActive: status }),
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

  updateSceneLock: (sceneId, isLocked) => set((state) => ({
    chapters: state.chapters.map(chapter => ({
      ...chapter,
      scenes: chapter.scenes.map(scene => 
        scene.id === sceneId ? { ...scene, isLocked } : scene
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
  setInspectorBindings: (bindings) => set({ inspectorBindings: bindings }),

  setEditorRef: (ref) => set({ editorRef: ref }),

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

  setLastAiEdit: (edit) => set({
    lastAiEdit: {
      ...edit,
      timestamp: Date.now()
    }
  }),

  clearLastAiEdit: () => set({ lastAiEdit: null }),

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
    inspectorBindings: {},
    overrideAiProfileId: null,
    overridePromptTemplateId: null,
    hasUnsavedChanges: false,
    chapters: [],
    activeProvider: null,
    activeModelName: null,
    isCacheActive: false,
    editorRef: null,
  })
}));