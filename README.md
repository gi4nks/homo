# HOMO 🏛️ v2.4.0

A professional Next.js 16 manuscript suite enabling authors to craft books, essays, and technical content with context-aware AI assistance and immersive focus.

## 🚀 Key Features

- **Multi-Engine Support**: Seamlessly switch between **Google Gemini**, **Anthropic Claude**, and **OpenAI GPT** models directly from the editor footer.
- **Scene Locking & Protection**: Finalize your prose by locking scenes to prevent accidental edits or AI overwrites.
- **Faded Ink Sidebar**: A refined archival aesthetic for the sidebar where finished chapters and scenes visually recede in muted slate tones.
- **Context-Aware Drafting**: Real-time streaming generation that understands your book's synopsis, authorial intent, lore constraints, and scene-specific goals.
- **Inline AI Editor**: Refined floating bubble menu with contextual actions (Migliora, Più Crudo, Riassumi) and custom AI commands.
- **Version History (Snapshots)**: Automatic version capture before every AI action, with side-by-side diff viewing and easy restoration.
- **Ultra-Dense Focus Mode**: A distraction-free environment maximized for text density, centering your prose while providing quick access to essential AI controls.
- **DaisyUI 5 (Fantasy Theme)**: A beautiful, themeable UI with a specialized "Fantasy" aesthetic optimized for creative flow.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **AI SDK**: Vercel AI SDK (Google, Anthropic, OpenAI)
- **Styling**: Tailwind CSS 4 + DaisyUI 5 (Strictly semantic components)
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
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
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
- **`Cmd/Ctrl + J`**: Open AI Command Bar.
- **`Escape`**: Toggle Focus Mode.
- **`Cmd/Ctrl + Z / Y`**: Undo/Redo within the editor.

## 📐 Architecture

- **SSOT Prompt Factory**: Centralized logic in `lib/prompt-builder.ts` ensures consistent instructions across all generation tasks.
- **Hardened UI Sync**: Zustand-first state management ensures the sidebar, editor, and inspector are always perfectly aligned.
- **Non-Destructive Locking**: Protections are applied at the container level to prevent TipTap reset bugs and data loss.
- **Flexible Layout**: A strict flexbox hierarchy ensures zero UI overlap and internal scrolling for long-form content.
