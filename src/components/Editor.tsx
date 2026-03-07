'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import CharacterCount from '@tiptap/extension-character-count';
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
  Terminal
} from 'lucide-react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
}

export interface EditorRef {
  undo: () => void;
  redo: () => void;
  setContent: (content: string) => void;
  insertContent: (content: string) => void;
}

const DEFAULT_DRAFTING_TEMPLATE_ID = '6bccda93-3238-43c7-8f58-266d69810962';
const DEFAULT_EDITING_TEMPLATE_ID = 'a5c10c75-2748-45bc-aecd-3f6766b59e9c';

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
  onChange 
}, ref) => {
  const [wordCount, setWordCount] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [inlineProposal, setInlineProposal] = useState<string | null>(null);
  const [isAiInputMode, setIsAiInputMode] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");
  const [showBlueprint, setShowBlueprint] = useState(false);

  const { activeProvider, activeModelName, isFocusMode } = useWorkspaceStore();

  const {
    aiProposal: streamedProposal,
    isAiLoading: isStreamLoading,
    aiError,
    promptBlueprint,
    startStream,
    clearProposal
  } = useAiStream();

  useEffect(() => {
    if (streamedProposal) setInlineProposal(streamedProposal);
  }, [streamedProposal]);

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
      if (html === '<p></p>' && initialContent.length > 10) return;
      onChange(html);
      setWordCount(editor.storage.characterCount.words());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [editor, isLocked]);

  useImperativeHandle(ref, () => ({
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    setContent: (content: string) => editor?.commands.setContent(content),
    insertContent: (content: string) => editor?.chain().focus().insertContent(content).run(),
  }));

  const handleAiAction = async (instruction: string) => {
    if (!editor || isLocked) return;
    const { from, to } = editor.state.selection;
    const isEmpty = editor.state.selection.empty;
    const selectedText = isEmpty ? "" : editor.state.doc.textBetween(from, to, ' ');

    setIsAiLoading(true);
    setIsAiInputMode(false);
    editor.commands.focus();
    
    try {
      if (!isEmpty) {
        const targetTemplateId = activePromptTemplateId || DEFAULT_EDITING_TEMPLATE_ID;
        const response = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            selectedText, 
            instruction, 
            bookId, 
            sceneId,
            profileId: activeAiProfileId || undefined,
            promptTemplateId: targetTemplateId
          }),
        });
        if (!response.ok) throw new Error('Rewrite failed');
        const { rewrittenText } = await response.json();
        setInlineProposal(rewrittenText);
        setIsAiLoading(false);
      } else {
        const targetTemplateId = activePromptTemplateId || DEFAULT_DRAFTING_TEMPLATE_ID;
        setInlineProposal(""); 
        await startStream(bookId, sceneId, activeAiProfileId || undefined, targetTemplateId, instruction);
      }
    } catch (error) {
      console.error('AI Action error:', error);
      setIsAiLoading(false);
    } finally {
      setCustomInstruction("");
    }
  };

  const actualAiLoading = isAiLoading || isStreamLoading;

  useEffect(() => {
    if (editor) {
      setWordCount(editor.storage.characterCount.words());
    }
  }, [editor]);

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
          // ENSURE Bubble Menu ONLY shows if the editor is editable AND not loading AI results
          if (!editor.isEditable || inlineProposal || actualAiLoading) return false;
          return isAiInputMode || !state.selection.empty;
        }}
      >
        <div className="bg-base-100 shadow-2xl border border-base-300/50 rounded-2xl p-1.5 flex flex-col gap-2 min-w-max animate-in fade-in zoom-in-95 duration-200 z-[9999]">
          {actualAiLoading ? (
            <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <Loader2 size={16} className="animate-spin text-indigo-500" />
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-indigo-500">Forging Prose...</span>
            </div>
          ) : !isAiInputMode ? (
            /* MODE A: COMPACT FORMATTING ACTION BAR */
            <div className="flex items-center gap-2 px-1">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => editor.chain().focus().toggleBold().run()} 
                  className={`p-1.5 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}`}
                  title="Bold"
                >
                  <Bold size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => editor.chain().focus().toggleItalic().run()} 
                  className={`p-1.5 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}`}
                  title="Italic"
                >
                  <Italic size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => editor.chain().focus().toggleBulletList().run()} 
                  className={`p-1.5 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}`}
                  title="Bullet List"
                >
                  <List size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="w-px h-5 bg-base-300/80 mx-0.5"></div>

              <button 
                onClick={() => setIsAiInputMode(true)} 
                className="btn btn-primary btn-sm rounded-xl gap-2 px-4 shadow-md shadow-primary/20 hover:scale-105 transition-all font-sans font-black text-[10px] uppercase tracking-wider h-8 min-h-0 border-none ml-0.5"
              >
                <Sparkles size={12} fill="currentColor" />
                AI Command
              </button>
            </div>
          ) : (
            /* MODE B: AI COMMAND INPUT & CHIPS */
            <div className="flex flex-col gap-2 animate-in slide-in-from-left-2 duration-300 min-w-[350px]">
              <div className="flex flex-wrap gap-1.5 px-1 py-1">
                {(editor.state.selection.empty ? cursorActions : selectionActions).map((action) => (
                  <button 
                    key={action.label} 
                    onClick={() => handleAiAction(action.promptText)} 
                    className="font-sans text-[10px] font-semibold tracking-wider uppercase bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content rounded-full px-3 py-1.5 transition-all border border-base-300 border-b-base-300/50 shadow-sm flex items-center gap-1 active:scale-95"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 px-1 pb-1">
                <div className="relative flex-grow">
                  <input 
                    autoFocus
                    type="text"
                    placeholder={editor.state.selection.empty ? "What should happen next?" : "How to change this text?"}
                    className="w-full bg-base-100 border border-base-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all font-sans placeholder:text-base-content/40 h-10 shadow-inner"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAiAction(customInstruction);
                      if (e.key === 'Escape') setIsAiInputMode(false);
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => handleAiAction(customInstruction)} 
                    disabled={!customInstruction.trim() || actualAiLoading} 
                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-2.5 shadow-lg shadow-indigo-500/20 transition-all active:scale-90 disabled:bg-base-300 disabled:shadow-none"
                  >
                    <ArrowRight size={16} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => setIsAiInputMode(false)} 
                    className="btn btn-ghost btn-sm btn-square rounded-full opacity-40 hover:opacity-100"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </BubbleMenu>

      {/* 2. REVISION MODAL */}
      {inlineProposal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => { if (!actualAiLoading) setInlineProposal(null); }}></div>
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-indigo-500/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-500/20 flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48"></div>

            <div className="flex items-center justify-between border-b border-indigo-500/10 p-6 bg-indigo-500/5 shrink-0 relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-widest text-indigo-500">AI Revision Proposal</h3>
                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Powered by {activeProvider} {activeModelName}</p>
                  </div>
                </div>

                {promptBlueprint && (
                  <button 
                    type="button"
                    onClick={() => setShowBlueprint(!showBlueprint)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${showBlueprint ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-500/5 text-indigo-500/60 border-indigo-500/20 hover:bg-indigo-500/10'}`}
                  >
                    <Terminal size={12} />
                    Blueprint
                    {showBlueprint ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setInlineProposal(null)} disabled={actualAiLoading} className="btn btn-circle btn-ghost btn-sm hover:bg-error/10 hover:text-error transition-colors"><X size={20} /></button>
                <button onClick={() => { editor.chain().focus().insertContent(inlineProposal).run(); setInlineProposal(null); }} disabled={actualAiLoading} className="btn btn-primary px-8 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs">Apply Revision</button>
              </div>
            </div>

            {showBlueprint && promptBlueprint && (
              <div className="mx-6 mt-4 rounded-xl bg-slate-950 p-4 font-mono text-[10px] leading-relaxed text-slate-400 border border-slate-800 shadow-inner max-h-48 overflow-y-auto custom-scrollbar shrink-0 animate-in fade-in slide-in-from-top-2 duration-200 relative z-10">
                <pre className="whitespace-pre-wrap break-words">
                  {promptBlueprint.split('\n').map((line, i) => {
                    if (line.startsWith('<') || line.startsWith('</')) return <span key={i} className="text-amber-500/80 font-black">{line}{'\n'}</span>;
                    if (line.startsWith('[') && line.endsWith(']')) return <span key={i} className="text-indigo-400 font-black">{line}{'\n'}</span>;
                    return <span key={i}>{line}{'\n'}</span>;
                  })}
                </pre>
              </div>
            )}

            <div className="flex-grow overflow-y-auto custom-scrollbar p-10 bg-transparent relative z-10">
              <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none font-serif italic text-base-content/90 selection:bg-indigo-500/20 leading-[1.8]">
                <ReactMarkdown>{inlineProposal}</ReactMarkdown>
                {actualAiLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-500 opacity-30" size={48} />
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-4 border-t border-indigo-500/10 bg-indigo-500/5 flex justify-between items-center shrink-0 relative z-10">
              <div className="flex items-center gap-2 opacity-30 text-[9px] font-black uppercase tracking-widest text-indigo-500">
                <Check size={12} />
                <span>Verify results before applying</span>
              </div>
              <span className="opacity-30 text-[9px] font-black uppercase tracking-widest text-indigo-500">Click backdrop to cancel</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN EDITOR CONTENT */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar !p-0 relative transition-opacity duration-500`}>
         {/* INTERNAL PROSE CONTAINER - STABLE AND IMMUTABLE */}
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
