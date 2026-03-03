'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
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
  X
} from 'lucide-react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface EditorProps {
  initialContent: string;
  bookId: string;
  sceneId: string;
  onChange: (content: string) => void;
}

export interface EditorRef {
  undo: () => void;
  redo: () => void;
  setContent: (content: string) => void;
  insertContent: (content: string) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({ initialContent, bookId, sceneId, onChange }, ref) => {
  const [wordCount, setWordCount] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [inlineProposal, setInlineProposal] = useState<string | null>(null);

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
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert focus:outline-none min-h-[500px] max-w-none p-12 md:p-24 bg-base-100 shadow-sm border border-base-300 rounded-lg selection:bg-primary/20 leading-[2.2] font-serif',
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

  const handleAiRewrite = async (instruction: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    if (!selectedText || selectedText.length < 2) return;

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedText, instruction, bookId, sceneId }),
      });

      if (!response.ok) throw new Error('Rewrite failed');

      const { rewrittenText } = await response.json();
      setInlineProposal(rewrittenText);
    } catch (error) {
      console.error('AI Rewrite error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (editor) {
      setWordCount(editor.storage.characterCount.words());
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="relative w-full h-full flex flex-col group">
      {/* 1. FORMATTING BUBBLE MENU (Only for triggers) */}
      <BubbleMenu 
        editor={editor} 
        tippyOptions={{ duration: 150, offset: [0, 15] }}
        shouldShow={({ editor }) => !editor.state.selection.empty && !inlineProposal}
      >
        <div className="flex bg-base-100 shadow-2xl border border-primary/20 rounded-2xl p-1.5 gap-1 items-center overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-max z-50">
          <div className="flex gap-1 px-1">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-ghost btn-xs btn-square rounded-lg ${editor.isActive('bold') ? 'text-primary bg-primary/10' : 'opacity-40'}`}><Bold size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-ghost btn-xs btn-square rounded-lg ${editor.isActive('italic') ? 'text-primary bg-primary/10' : 'opacity-40'}`}><Italic size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-ghost btn-xs btn-square rounded-lg ${editor.isActive('bulletList') ? 'text-primary bg-primary/10' : 'opacity-40'}`}><List size={14} /></button>
          </div>
          <div className="divider divider-horizontal mx-1 h-4 opacity-10"></div>
          <div className="flex items-center gap-1 pr-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-full mr-1">
              {isAiLoading ? <Loader2 size={12} className="animate-spin text-primary" /> : <Sparkles size={12} className="text-primary" />}
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">AI</span>
            </div>
            <button onClick={() => handleAiRewrite("Improve the prose, make it more evocative.")} disabled={isAiLoading} className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-primary/10 hover:text-primary"><Sparkles size={14} /></button>
            <button onClick={() => handleAiRewrite("Rewrite to be more gritty and dark.")} disabled={isAiLoading} className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-indigo-900/20 hover:text-indigo-400"><Moon size={14} /></button>
            <button onClick={() => handleAiRewrite("Rewrite using Show, Don't Tell rules.")} disabled={isAiLoading} className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-amber-500/10 hover:text-amber-600"><Eye size={14} /></button>
          </div>
        </div>
      </BubbleMenu>

      {/* 2. CENTERED REVISION MODAL (When proposal is ready) */}
      {inlineProposal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setInlineProposal(null)}></div>
          <div className="relative w-full max-w-xl bg-base-100 rounded-3xl shadow-2xl border border-primary/20 p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between border-b border-base-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary">Revisione Proposta</h3>
                  <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setInlineProposal(null)} 
                  className="btn btn-circle btn-ghost btn-sm hover:bg-error/10 hover:text-error transition-colors"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={() => {
                    editor.chain().focus().insertContent(inlineProposal).run();
                    setInlineProposal(null);
                  }} 
                  className="btn btn-primary px-6 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all font-black uppercase tracking-widest text-[10px]"
                >
                  Applica Revisione
                </button>
              </div>
            </div>

            <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300/50">
              <div className="text-[15px] leading-relaxed font-serif italic text-base-content/90 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {inlineProposal}
              </div>
            </div>

            <div className="flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-widest px-2">
              <span>Context-Aware Refactoring</span>
              <span>Click backdrop to cancel</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN EDITOR CONTENT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar py-12 px-4 md:px-0">
         <div className="max-w-4xl mx-auto relative">
            <EditorContent editor={editor} />
         </div>
      </div>
      
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
