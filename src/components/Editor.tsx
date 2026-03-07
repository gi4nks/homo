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
  MessageSquare
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
  onChange 
}, ref) => {
  const [wordCount, setWordCount] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [inlineProposal, setInlineProposal] = useState<string | null>(null);
  const [isAiInputMode, setIsAiInputMode] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");

  const { activeProvider, activeModelName } = useWorkspaceStore();

  const {
    aiProposal: streamedProposal,
    isAiLoading: isStreamLoading,
    aiError,
    startStream,
    clearProposal
  } = useAiStream();

  useEffect(() => {
    if (streamedProposal) setInlineProposal(streamedProposal);
  }, [streamedProposal]);

  const editor = useEditor({
    immediatelyRender: false,
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
        class: `prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert focus:outline-none bg-base-100 selection:bg-primary/20 leading-[2.2] font-serif transition-all duration-500 !p-12 !pt-16 !max-w-none !w-full [&_p]:my-4`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setWordCount(editor.storage.characterCount.words());
    },
  });

  useImperativeHandle(ref, () => ({
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    setContent: (content: string) => editor?.commands.setContent(content),
    insertContent: (content: string) => editor?.chain().focus().insertContent(content).run(),
  }));

  const handleAiAction = async (instruction: string) => {
    if (!editor) return;
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
        tippyOptions={{ duration: 150, offset: [0, 15], maxWidth: 'none', zIndex: 40 }}
        shouldShow={({ editor }) => {
          if (inlineProposal || actualAiLoading) return false;
          return isAiInputMode || !editor.state.selection.empty;
        }}
      >
        <div className="flex bg-base-100 shadow-2xl border border-primary/20 rounded-2xl p-1.5 gap-1 items-center overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-max z-50">
          {actualAiLoading ? (
            <div className="flex items-center gap-3 px-4 py-2 min-w-[200px] animate-pulse">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Forging Prose...</span>
            </div>
          ) : !isAiInputMode ? (
            <>
              <div className="flex gap-1 px-1">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-ghost btn-xs btn-square rounded-lg ${editor.isActive('bold') ? 'text-primary bg-primary/10' : 'opacity-40'}`}><Bold size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-ghost btn-xs btn-square rounded-lg ${editor.isActive('italic') ? 'text-primary bg-primary/10' : 'opacity-40'}`}><Italic size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-ghost btn-xs btn-square rounded-lg ${editor.isActive('bulletList') ? 'text-primary bg-primary/10' : 'opacity-40'}`}><List size={14} /></button>
              </div>
              <div className="divider divider-horizontal mx-1 h-4 opacity-10"></div>
              <div className="flex items-center gap-1 pr-1">
                <button onClick={() => setIsAiInputMode(true)} className="btn btn-primary btn-xs rounded-lg gap-2 px-3 shadow-md shadow-primary/20 hover:scale-105 transition-all">
                  <Sparkles size={12} />
                  <span className="text-[9px] font-black uppercase tracking-tight">AI Command</span>
                </button>
                <div className="divider divider-horizontal mx-1 h-4 opacity-10"></div>
                <button onClick={() => handleAiAction("Improve the prose, make it more evocative.")} disabled={actualAiLoading} className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-primary/10 hover:text-primary" title="Improve Prose"><Sparkles size={14} /></button>
                <button onClick={() => handleAiAction("Rewrite to be more gritty and dark.")} disabled={actualAiLoading} className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-indigo-900/20 hover:text-indigo-400" title="Gritty & Dark"><Moon size={14} /></button>
                <button onClick={() => handleAiAction("Rewrite using Show, Don't Tell rules.")} disabled={actualAiLoading} className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-amber-500/10 hover:text-amber-600" title="Show, Don't Tell"><Eye size={14} /></button>
              </div>
            </>
          ) : (
            <div className="flex flex-col min-w-[350px] animate-in slide-in-from-left-2 duration-300">
              <div className="flex gap-1.5 px-3 py-2 border-b border-base-200/50">
                {(editor.state.selection.empty ? cursorActions : selectionActions).map((action) => (
                  <button key={action.label} onClick={() => handleAiAction(action.promptText)} className="text-[8px] font-black uppercase tracking-tighter px-2 py-1 bg-base-200 hover:bg-primary hover:text-primary-content rounded-full transition-all border border-base-300/50">
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <Wand2 size={14} className="text-primary animate-pulse shrink-0" />
                <input 
                  autoFocus
                  type="text"
                  placeholder={editor.state.selection.empty ? "What should happen next?" : "How to change this text?"}
                  className="input input-ghost input-xs focus:bg-transparent border-none focus:ring-0 w-full font-bold text-[11px]"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAiAction(customInstruction);
                    if (e.key === 'Escape') setIsAiInputMode(false);
                  }}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleAiAction(customInstruction)} disabled={!customInstruction.trim() || actualAiLoading} className="btn btn-primary btn-xs btn-square rounded-lg shadow-lg">
                    <ArrowRight size={14} />
                  </button>
                  <button onClick={() => setIsAiInputMode(false)} className="btn btn-ghost btn-xs btn-square rounded-lg opacity-40 hover:opacity-100">
                    <X size={14} />
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
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-base-100 rounded-3xl shadow-2xl border border-primary/20 flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="flex items-center justify-between border-b border-base-200 p-6 bg-base-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Sparkles size={24} /></div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-widest text-primary">AI Revision Proposal</h3>
                  <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Powered by {activeProvider} {activeModelName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setInlineProposal(null)} disabled={actualAiLoading} className="btn btn-circle btn-ghost btn-sm hover:bg-error/10 hover:text-error transition-colors"><X size={20} /></button>
                <button onClick={() => { editor.chain().focus().insertContent(inlineProposal).run(); setInlineProposal(null); }} disabled={actualAiLoading} className="btn btn-primary px-8 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs">Apply Revision</button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-8 bg-base-100">
              <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown>{inlineProposal}</ReactMarkdown>
                {actualAiLoading && <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary opacity-20" size={32} /></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN EDITOR CONTENT - FILL PARENT AND SCROLL INTERNALLY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar !p-0">
         <div className="relative !max-w-none !w-full !mx-0 !p-0">
            <EditorContent editor={editor} className="w-full h-full" />
         </div>
      </div>
      
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
