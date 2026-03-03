# Novel AI Architect 🏛️

A professional Next.js 16 manuscript suite enabling authors to draft books chapter-by-chapter with context-aware LLM prompts and local SQLite persistence.

## 🚀 Key Features

- **AI-Powered Drafting**: Real-time streaming generation using **Google Gemini 2.5 Flash** with reasoning capabilities.
- **Inline AI Editor**: Notion-style bubble menu. Highlight text to "Improve", "Make Darker", or "Show, Don't Tell" with context-aware results.
- **Centered Revision Modal**: Review and accept AI suggestions in a focused overlay before committing them to your manuscript.
- **Immersive Focus Mode**: Enter a distraction-free writing environment with a single click or `Escape` key.
- **Professional Three-Pane Workspace**:
  - **Navigator (Left)**: Drag & Drop reordering with exclusive chapter expansion and active route highlighting.
  - **Writing Canvas (Center)**: Centered layout with real-time word counting and power-user keyboard shortcuts.
  - **Inspector (Right)**: Context-aware tabs for Book metadata, Chapter goals, and Scene casting.
- **Intelligent Prompt Engine**: Hardened prompt assembly using XML delimiters to prevent injection while providing deep story context.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **AI SDK**: Vercel AI SDK + Google AI SDK (Gemini 2.5 Flash)
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Database**: SQLite with Prisma 6
- **Editor**: TipTap (ProseMirror)

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Create a `.env.local` file:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
   DATABASE_URL="file:./dev.db"
   ```

3. **Setup Database**:
   ```bash
   npx prisma db push
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## ⌨️ Keyboard Shortcuts

- **`Cmd/Ctrl + Enter`**: Trigger AI Scene Generation.
- **`Escape`**: Toggle Focus Mode.
- **`Cmd/Ctrl + Z / Y`**: Undo/Redo within the editor.

## 📐 Architecture

- **URL-Driven State**: Book, Chapter, and Scene context are managed via dynamic routes for permanent linkability.
- **Blueprint Peek**: View the exact source prompt sent to the AI via the "Instruction Blueprint" terminal view.
- **Safe Sync**: Background autosaves use `startTransition` to maintain UI responsiveness and protect active streams.
