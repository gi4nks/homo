# Novel AI Architect 🏛️

A professional Next.js 16 manuscript suite enabling authors to draft books chapter-by-chapter with context-aware LLM prompts and local SQLite persistence.

## 🚀 Key Features

- **Hierarchical Manuscript Management**: Organize your work into Books, Chapters, and Scenes.
- **Professional Three-Pane Workspace**:
  - **Navigator (Left)**: Drag & Drop reordering of chapters and scenes.
  - **Writing Canvas (Center)**: Distraction-free TipTap editor with 1.5s debounced autosave.
  - **Inspector (Right)**: Tabbed interface for Book metadata, Chapter goals, and Scene casting.
- **Intelligent Prompt Engine**: Automatically assembles LLM prompts including global synopsis, genre rules, chapter arcs, scene cast, and previous context.
- **Character Management**: Full CRUD for characters with roles and descriptions, including per-scene casting.
- **Global Header**: Context-aware navigation with breadcrumbs, theme toggling, and manuscript export (.md).
- **Manuscript Export**: Compile your entire book into a single Markdown file with a single click.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Database**: SQLite with Prisma 6
- **Icons**: Lucide React
- **Editor**: TipTap (ProseMirror)
- **Drag & Drop**: @dnd-kit

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Database**:
   ```bash
   npx prisma db push
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📐 Architecture

- **Context API**: `StoryContext.tsx` manages global UI state (selected scene, panel visibility, save status).
- **Server Actions**: All database operations are handled via `src/app/actions.ts`.
- **Atomic Components**: UI is broken down into reusable components in `src/components/`.
- **Optimistic UI**: Drag & Drop and deletions use optimistic updates for a snappy feel.

## 📝 Manuscript Logic

- **Word Counts**: Calculated in real-time on the client and displayed in the Navigator and Canvas Footer.
- **Sequencing**: Managed via `orderIndex` and `chapterNumber`/`sceneNumber`. Automatic re-indexing occurs on deletion.
- **Genre Injection**: Genre-specific rules defined in `/settings/genres` are automatically injected into the AI prompt template when a book is linked to a genre.
