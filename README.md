# HOMO 🏛️

A professional Next.js 16 manuscript suite enabling authors to craft books, essays, and technical content with context-aware AI assistance and immersive focus.

## 🚀 Key Features

- **AI-Powered Personas**: Select from specialized writing styles (e.g., The Dark Epic Poet, The Tech Evangelist, The Subtle Enhancer) or create your own custom AI personas.
- **Context-Aware Drafting**: Real-time streaming generation using **Google Gemini 2.5 Flash** that understands your book's synopsis, chapter goals, and character cast.
- **Inline AI Editor**: Highlight text to "Improve", "Make Darker", or "Show, Don't Tell". The AI performs context-aware rewrites based on your specific story bible.
- **Immersive Focus Mode**: A distraction-free writing environment that centers your prose and hides all sidebars with a single click or `Escape`.
- **Integrated Chapter View**: Click any chapter title to read all its scenes concatenated in a beautiful, chronological reading layout.
- **Professional Three-Pane Workspace**:
  - **Navigator (Left)**: Drag & Drop reordering with exclusive chapter expansion.
  - **Writing Canvas (Center)**: Minimalist TipTap editor with power-user keyboard shortcuts.
  - **Inspector (Right)**: Collapsible accordion sections for granular metadata management.
- **Prompt Blueprint**: Total transparency with a terminal-style view of the exact source instructions sent to the AI.

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
   npx prisma generate
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

- **SSOT Prompt Factory**: Centralized logic in `lib/prompt-builder.ts` ensures consistent instructions across all generation tasks.
- **URL-Driven State**: Permanent linkability for every Book, Chapter, and Scene.
- **Safe Sync**: Uses React's `startTransition` for background autosaves to protect active AI streams.
- **Custom Modals**: Replaces native browser dialogs with styled, themed confirmation overlays.
