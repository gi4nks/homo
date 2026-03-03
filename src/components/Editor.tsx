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
} from 'lucide-react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export interface EditorRef {
  undo: () => void;
  redo: () => void;
  setContent: (content: string) => void;
  insertContent: (content: string) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({ initialContent, onChange }, ref) => {
  const [wordCount, setWordCount] = useState(0);

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

  // Aggiorna il conteggio al montaggio
  useEffect(() => {
    if (editor) {
      setWordCount(editor.storage.characterCount.words());
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="relative w-full h-full flex flex-col group">
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex bg-base-100 shadow-2xl border border-base-300 rounded-lg p-1 gap-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-ghost btn-xs btn-square ${editor.isActive('bold') ? 'btn-active' : ''}`}><Bold size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-ghost btn-xs btn-square ${editor.isActive('italic') ? 'btn-active' : ''}`}><Italic size={14} /></button>
          <div className="divider divider-horizontal mx-0"></div>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`btn btn-ghost btn-xs btn-square ${editor.isActive('heading', { level: 1 }) ? 'btn-active' : ''}`}><Heading1 size={14} /></button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`btn btn-ghost btn-xs btn-square ${editor.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`}><Heading2 size={14} /></button>
          <div className="divider divider-horizontal mx-0"></div>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-ghost btn-xs btn-square ${editor.isActive('bulletList') ? 'btn-active' : ''}`}><List size={14} /></button>
        </div>
      </BubbleMenu>

      <div className="flex-grow overflow-y-auto custom-scrollbar bg-base-200/20 py-12 px-4 md:px-0">
         <div className="max-w-4xl mx-auto relative">
            <EditorContent editor={editor} />
         </div>
      </div>
      
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
