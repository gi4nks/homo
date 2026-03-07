# HOMO 🏛️ v2.2.0

A professional Next.js 16 manuscript suite enabling authors to craft books, essays, and technical content with context-aware AI assistance and immersive focus.

## 🚀 Key Features

- **Multi-Engine Support**: Seamlessly switch between **Google Gemini**, **Anthropic Claude**, and **OpenAI GPT** models directly from the editor footer.
- **AI-Powered Personas**: Select from specialized writing styles (e.g., The Dark Epic Poet, The Action Director) or create your own custom AI personas.
- **Context-Aware Drafting**: Real-time streaming generation that understands your book's synopsis, authorial intent, lore constraints, and scene-specific goals.
- **Inline AI Editor**: Highlight text to "Improve", "Make Cruder", or "Summarize" using contextual action chips in the bubble menu.
- **Data Portability**: Export your entire database as a JSON backup or compile your manuscript into a beautifully formatted Markdown (.md) file.
- **Ultra-Dense Focus Mode**: A distraction-free environment maximized for text density, centering your prose while providing quick access to essential AI controls.
- **Logical Inspector**: A structured workstation with collapsible sections for CORE METADATA, AI GROUNDING, and THE STAGE.
- **SSOT Prompt CMS**: Manage system instructions and contextual templates with a powerful internal CMS and Markdown export for prompt recipes.

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
- **`Cmd/Ctrl + J`**: Open AI Command Bar / Bubble Menu.
- **`Escape`**: Toggle Focus Mode.
- **`Cmd/Ctrl + Z / Y`**: Undo/Redo within the editor.

## 📐 Architecture

- **SSOT Prompt Factory**: Centralized logic in `lib/prompt-builder.ts` ensures consistent instructions across all generation tasks.
- **Canvas & Card Design**: A "floating paper" aesthetic that separates the creative workspace from the global application watermark.
- **Bidirectional Sync**: Editor footer controls are perfectly synchronized with the Inspector panel and persisted to the database.
- **Flexible Layout**: A strict flexbox hierarchy ensures zero UI overlap and internal scrolling for long-form content.
