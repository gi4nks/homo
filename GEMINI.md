# Novel AI Architect - Engineering Manifest

## 🎯 Project Overview
"Novel AI Architect" is a specialized drafting tool for authors. It prioritizes structure, context, and a distraction-free writing experience. The app uses a hierarchical data model (Book -> Chapter -> Scene) to provide LLMs with precise context for generating high-quality drafting prompts.

## 🛠️ Tech Stack & Constraints
- **Framework**: Next.js 16 (App Router) + React 19.
- **Styling**: Tailwind CSS 4 + DaisyUI 5.
- **Theme**: `corporate` (Light) and `dark`. High-contrast professional aesthetic.
- **Database**: SQLite with Prisma 6.
- **Strict Rule**: No custom CSS outside of `@utility` classes in `globals.css`.
- **Editor**: TipTap with `immediatelyRender: false` to avoid SSR hydration mismatches.

## 🏗️ Architecture

### 1. State Management (`src/context/StoryContext.tsx`)
The `UIProvider` acts as the single source of truth for the workspace:
- **Navigation**: `currentBookId`, `currentChapterId`, `currentSceneId`.
- **UI Context**: `activeTab` (Book/Chapter/Scene), `leftPanelOpen`, `rightPanelOpen`.
- **Sync State**: `saveStatus` (isSaving, lastSynced).
- **Metadata**: `currentBookTitle` for the Global Header.

### 2. Component Hierarchy
- `GlobalHeader`: Context-aware navbar (Breadcrumbs, Export, Save Status, Theme).
- `WorkspaceClient`: Root workspace layout with collapsible sidebars.
- `ChapterManager`: Left Navigator with nested @dnd-kit Sortable contexts.
- `SceneEditor`: Central Canvas with TipTap, Undo/Redo, and Real-time Metrics.
- `Inspector`: Right Tabbed panel for granular metadata management.

### 3. Prompt Engine (`src/app/actions.ts` -> `generatePromptData`)
The "Heart" of the app. Assembles a 7-block prompt:
1. Persona & Tone.
2. Global Context (Synopsis).
3. Genre Specific Goals (Fetched from `GenreConfig`).
4. Chapter Goal (Arc).
5. Scene Cast (Specific Characters).
6. Previous Context (Last 500 words of the previous scene).
7. Immediate Action (Beats).

## 💾 Data Safety & Migrations
- **Additive Changes**: Use `npx prisma db push` for non-destructive schema updates.
- **Precision Deletion**: `deleteChapter` and `deleteScene` must perform manual re-indexing of `orderIndex` for remaining siblings within a transaction.
- **Prisma Client**: Always run `npx prisma generate` after schema changes to ensure type safety in Server Actions.

## 📖 Key Knowledge & Gotchas
- **Hydration Safety**: Use the `FormattedNumber` or `FormattedDate` components for locale-dependent strings to avoid SSR mismatches.
- **Debounced Autosave**: Writing Canvas and Inspector fields use a 1.5s debounce to minimize DB load while ensuring data safety.
- **Modal Strategy**: Global Metadata Modals are mounted at the root of `UIProvider` to escape stacking contexts.
- **Z-Index**: Header is `z-50`, Modals are `z-[999]`.

## 📜 Future Roadmap
- [ ] AI Model Profile management (API keys/Selection).
- [ ] Multi-format Export (PDF/ePub).
- [ ] Global Search across all books.
- [ ] Version history/Snapshots.
