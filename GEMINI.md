# Novel AI Architect - Engineering Manifest

## 🎯 Project Overview
"Novel AI Architect" is a specialized drafting tool for authors. It prioritizes structure, context, and a distraction-free writing experience. The app uses a hierarchical data model (Book -> Chapter -> Scene) to provide LLMs with precise context for generating high-quality drafting prompts.

## 🛠️ Tech Stack & Constraints
- **Framework**: Next.js 16 (App Router) + React 19.
- **AI Engine**: Google Gemini 2.5 Flash via Vercel AI SDK.
- **Styling**: Tailwind CSS 4 + DaisyUI 5.
- **Theme**: `corporate` (Light) and `dark`. High-contrast professional aesthetic.
- **Database**: SQLite with Prisma 6.
- **Editor**: TipTap with `immediatelyRender: false`.

## 🏗️ Architecture

### 1. State Management (URL & Zustand)
- **Navigation**: Managed via **Next.js Dynamic Routes** (`/book/[bookId]/chapter/[chapterId]/scene/[sceneId]`). The URL is the single source of truth.
- **UI State**: Zustand (`src/store/useWorkspaceStore.ts`) manages transient UI context only (panel visibility, hasUnsavedChanges, modal data).
- **Streaming**: Custom hook `useAiStream.ts` handles vanilla JS fetch readers for bulletproof real-time generation immunity to HMR.

### 2. Component Hierarchy
- `GlobalHeader`: Context-aware navbar (Breadcrumbs, Export, Save Status, AI Prompt Trigger).
- `WorkspaceClient`: Root workspace layout with collapsible sidebars (Left: Navigator, Right: Inspector).
- `ChapterManager`: Left Navigator with exclusive chapter expansion and active route highlighting.
- `SceneEditor`: Central Canvas with TipTap and real-time word counting.
- `AiProposalBox`: Isolated component for reviewing/accepting AI-generated text before insertion.

### 3. Prompt Engine (`src/app/actions.ts` -> `generatePromptData`)
Assembles a 7-block directive prompt:
1. Persona & Tone.
2. Global Context (Synopsis).
3. Genre Specific Goals.
4. Chapter Goal (Arc).
5. Scene Cast.
6. Previous Context (Last 400 chars).
7. Immediate Action (Beats).

## 💾 Data Safety & Sync
- **Safe Revalidation**: Server Actions use `revalidatePath`, but triggered on the client via `startTransition` to avoid severing AI streams.
- **Debounced Autosave**: Canvas uses a 1.5s debounce, paused during active AI generation (`isAiLoading`).
- **Exclusive Expansion**: The sidebar automatically expands the active chapter and collapses others to maintain focus.

## 📖 Key Knowledge & Gotchas
- **Hydration Safety**: Use `FormattedNumber` or `FormattedDate` for locale-dependent strings.
- **Webpack Watcher**: Database files (`.db`, `.sqlite`) are ignored in `next.config.ts` to prevent accidental Fast Refreshes.
- **Navigation**: Always use `<Link>` or `router.push` to navigate between scenes; avoid manual state setters for IDs.

## 📜 Future Roadmap
- [x] Real-time AI Streaming (Gemini 2.5 Flash).
- [ ] AI Model Profile management.
- [ ] Multi-format Export (PDF/ePub).
- [ ] Version history/Snapshots.
