'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import CharacterCount from '@tiptap/extension-character-count';
import { Selection } from '@tiptap/pm/state';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Sparkles,
  Moon,
  Eye,
  Loader2,
  Wand2,
  Check,
  X,
  ArrowRight,
  MessageSquare,
  Lock,
  ChevronDown,
  ChevronUp,
  Terminal,
  Undo2
} from 'lucide-react';
import { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAiStream } from '@/hooks/useAiStream';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface EditorProps {
  initialContent: string;
  bookId: string;
  sceneId: string;
  activeAiProfileId?: string | null;
  activePromptTemplateId?: string | null;
  isLocked?: boolean;
  onChange: (content: string) => void;
  onManualSave?: (content: string) => Promise<void>;
  onAiAction?: (instruction: string, selectedText?: string, range?: { from: number, to: number }) => void;
}

export interface EditorRef {
  undo: () => void;
  redo: () => void;
  setContent: (content: string) => void;
  insertContent: (content: string) => void;
  replaceRange: (content: string, range: { from: number, to: number }) => void;
  getHTML: () => string;
  getText: () => string;
  forceSave: () => Promise<string>;
}

const selectionActions = [
  { label: "✨ Migliora", promptText: "Migliora la fluidità di questo testo." },
  { label: "🔪 Più crudo", promptText: "Rendi la prosa più cruda, viscerale e tagliente." },
  { label: "📝 Riassumi", promptText: "Crea un riassunto di massimo 3 righe." },
];

const cursorActions = [
  { label: "✨ Continua", promptText: "Continua a scrivere seguendo la traccia." },
  { label: "🗣️ Dialogo", promptText: "Inserisci un dialogo teso tra i personaggi presenti." },
  { label: "👁️ Descrivi", promptText: "Fai una descrizione sensoriale dell'ambiente circostante." },
];

const Editor = forwardRef<EditorRef, EditorProps>(({ 
  initialContent, 
  bookId, 
  sceneId, 
  activeAiProfileId, 
  activePromptTemplateId,
  isLocked = false,
  onChange,
  onManualSave,
  onAiAction
}, ref) => {
  const [wordCount, setWordCount] = useState(0);
  const [isAiInputMode, setIsAiInputMode] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");

  const liveContentRef = useRef(initialContent);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { activeProvider, activeModelName, isFocusMode, lastAiEdit, clearLastAiEdit } = useWorkspaceStore();

  // Check if lastAiEdit is recent (< 60 seconds)
  const isUndoAvailable = lastAiEdit && (Date.now() - lastAiEdit.timestamp) < 60000;

  const editor = useEditor({
    immediatelyRender: false,
    editable: !isLocked,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      BubbleMenuExtension.configure({
        element: null,
      }),
      CharacterCount,
      Extension.create({
        name: 'aiCommandShortcut',
        addOptions() {
          return { onTrigger: () => {} };
        },
        addKeyboardShortcuts() {
          return {
            'Mod-j': () => {
              this.options.onTrigger();
              return true;
            },
          };
        },
      }).configure({
        onTrigger: () => setIsAiInputMode(true)
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-full',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      liveContentRef.current = html;
      onChange(html);
      setWordCount(editor.storage.characterCount.words());

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        if (onManualSave) onManualSave(html);
      }, 2000);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [editor, isLocked]);

  const handleUndoAiEdit = useCallback(() => {
    if (!lastAiEdit || !editor) return;

    // Restore old content
    editor.commands.setContent(lastAiEdit.oldContent);
    liveContentRef.current = lastAiEdit.oldContent;

    // Clear lastAiEdit
    clearLastAiEdit();

    // Trigger save
    if (onManualSave) onManualSave(lastAiEdit.oldContent);
  }, [lastAiEdit, editor, clearLastAiEdit, onManualSave]);

  useImperativeHandle(ref, () => ({
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    setContent: (content: string) => {
      editor?.commands.setContent(content);
      liveContentRef.current = content;
    },
    insertContent: (content: string) => {
      editor?.chain().focus().insertContent(content).run(),
      liveContentRef.current = editor?.getHTML() || '';
    },
    replaceRange: (content: string, range: { from: number, to: number }) => {
      editor?.chain().focus().insertContentAt({ from: range.from, to: range.to }, content).run();
      liveContentRef.current = editor?.getHTML() || '';
    },
    getHTML: () => liveContentRef.current,
    getText: () => editor?.state.doc.textContent || '',
    forceSave: async () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const content = liveContentRef.current;
      if (onManualSave) await onManualSave(content);
      return content;
    }
  }));

  const handleAiTrigger = async (instruction: string) => {
    if (!editor || isLocked) return;
    
    // 1. Capture exact coordinates and text
    const { from, to } = editor.state.selection;
    const isEmpty = editor.state.selection.empty;
    const selectedText = isEmpty ? undefined : editor.state.doc.textBetween(from, to, ' ');
    const range = isEmpty ? undefined : { from, to };

    // 2. IMMEDIATELY CLOSE UI & CLEAR SELECTION
    setIsAiInputMode(false);
    setCustomInstruction("");
    
    // Deselect
    const { tr } = editor.state;
    editor.view.dispatch(tr.setSelection(Selection.near(tr.doc.resolve(to))));

    // 3. FORCE SAVE (Data integrity)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (onManualSave) await onManualSave(liveContentRef.current);

    // 4. CALL PARENT HANDLER WITH COORDINATES
    if (onAiAction) {
      onAiAction(instruction, selectedText, range);
    }
  };

  useEffect(() => {
    if (editor) {
      setWordCount(editor.storage.characterCount.words());
    }
  }, [editor]);

  // Keyboard shortcut for Undo AI Edit: Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        if (isUndoAvailable && !isLocked) {
          e.preventDefault();
          handleUndoAiEdit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUndoAvailable, isLocked, handleUndoAiEdit]);

  if (!editor) return null;

  return (
    <div className="relative w-full h-full flex flex-col group overflow-hidden">
      {/* 1. FORMATTING BUBBLE MENU */}
      <BubbleMenu 
        editor={editor} 
        tippyOptions={{ 
          duration: 150, 
          offset: [0, 15], 
          maxWidth: 'none', 
          zIndex: 9999,
          appendTo: () => document.body,
          placement: 'top',
          popperOptions: {
            modifiers: [
              {
                name: 'preventOverflow',
                options: { boundary: 'viewport' },
              },
              {
                name: 'flip',
                options: { fallbackPlacements: ['bottom', 'top'] },
              },
            ],
          },
        }}
        shouldShow={({ editor, state }) => {
          if (!editor.isEditable) return false;
          return isAiInputMode || !state.selection.empty;
        }}
      >
        <div className="bg-base-300 rounded-full shadow-2xl border border-base-200 p-1 flex items-center gap-1.5 min-w-max animate-in fade-in zoom-in-95 duration-200 z-[9999]">
          {!isAiInputMode ? (
            /* MODE A: MONOLITHIC ACTION BAR */
            <>
              <div className="flex items-center gap-0.5 px-1">
                <button 
                  onClick={() => editor.chain().focus().toggleBold().run()} 
                  className={`p-2 rounded-full transition-all ${editor.isActive('bold') ? 'bg-indigo-500 text-white shadow-lg' : 'text-base-content/60 hover:bg-base-100 hover:text-base-content'}`}
                >
                  <Bold size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => editor.chain().focus().toggleItalic().run()} 
                  className={`p-2 rounded-full transition-all ${editor.isActive('italic') ? 'bg-indigo-500 text-white shadow-lg' : 'text-base-content/60 hover:bg-base-100 hover:text-base-content'}`}
                >
                  <Italic size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => editor.chain().focus().toggleBulletList().run()} 
                  className={`p-2 rounded-full transition-all ${editor.isActive('bulletList') ? 'bg-indigo-500 text-white shadow-lg' : 'text-base-content/60 hover:bg-base-100 hover:text-base-content'}`}
                >
                  <List size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="w-px h-6 bg-base-200/50 mx-0.5"></div>

              <button 
                onClick={() => setIsAiInputMode(true)} 
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-4 py-1.5 shadow-lg shadow-indigo-500/20 transition-all font-sans font-black text-[10px] uppercase tracking-wider flex items-center gap-2 mr-1"
              >
                <Sparkles size={12} fill="currentColor" />
                AI Command
              </button>
            </>
          ) : (
            /* MODE B: MONOLITHIC AI INPUT */
            <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-300 pl-2 pr-1">
              <div className="flex items-center gap-1">
                {(editor.state.selection.empty ? cursorActions : selectionActions).map((action) => (
                  <button 
                    key={action.label} 
                    onClick={() => handleAiTrigger(action.promptText)} 
                    className="bg-base-100 hover:bg-base-200 text-base-content/70 font-sans text-[10px] font-semibold tracking-wider uppercase rounded-full px-3 py-1.5 border border-base-200/50 transition-all active:scale-95 whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              
              <div className="w-px h-6 bg-base-200/50 mx-1"></div>

              <input 
                autoFocus
                type="text"
                placeholder={editor.state.selection.empty ? "What next?" : "How to change?"}
                className="bg-transparent border-0 rounded-full px-2 py-2 text-sm focus:ring-0 focus:outline-none font-sans placeholder:text-base-content/30 w-48 h-9"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAiTrigger(customInstruction);
                  if (e.key === 'Escape') setIsAiInputMode(false);
                }}
              />

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleAiTrigger(customInstruction)} 
                  disabled={!customInstruction.trim()} 
                  className="bg-base-200 text-base-content rounded-full p-2 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors shrink-0 shadow-sm disabled:opacity-30"
                >
                  <ArrowRight size={16} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => setIsAiInputMode(false)} 
                  className="text-base-content/40 hover:text-base-content p-1.5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </BubbleMenu>

      {/* 3. MAIN EDITOR CONTENT */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar !p-0 relative transition-opacity duration-500`}>
         {/* UNDO AI EDIT BUTTON (Floating) */}
         {isUndoAvailable && !isLocked && (
           <div className="fixed bottom-24 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <button
               onClick={handleUndoAiEdit}
               className="flex items-center gap-2 px-4 py-2 bg-warning text-warning-content rounded-full shadow-2xl border border-warning/30 hover:scale-105 transition-transform font-bold text-sm uppercase tracking-widest"
             >
               <Undo2 size={16} />
               Undo AI Edit
             </button>
           </div>
         )}

         <div className={`prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert font-serif leading-[2.2] mx-auto transition-all duration-500 ${
           isFocusMode ? '!max-w-none !w-full !p-12 !pt-16' : 'max-w-4xl p-12 md:p-24'
         } ${isLocked ? 'cursor-default' : ''}`}>
            <EditorContent editor={editor} className="min-h-[80vh]" />
         </div>
      </div>
      
    </div>
  );
});

Editor.displayName = 'Editor';

export default function EditorWrapper(props: EditorProps & { ref?: React.Ref<EditorRef> }) {
  return <Editor {...props} ref={props.ref} />;
}
