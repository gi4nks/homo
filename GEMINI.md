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
- **UI State**: Zustand (`src/store/useWorkspaceStore.ts`) manages transient UI context (panel visibility, focus mode, unsaved changes, modal data).
- **Streaming**: Custom hook `useAiStream.ts` handles vanilla JS fetch readers for bulletproof real-time generation immunity to HMR.

### 2. Component Hierarchy
- `GlobalHeader`: Context-aware navbar. Hidden in **Focus Mode**.
- `WorkspaceClient`: Root workspace layout with collapsible sidebars and **Focus Mode** orchestration.
- `ChapterManager`: Left Navigator with exclusive chapter expansion and active route highlighting.
- `SceneEditor`: Central Canvas with TipTap, real-time word counting, and keyboard shortcuts.
- `Editor`: TipTap instance with a **Unified Bubble Menu** (formatting + AI rewrite triggers).
- `AiProposalBox`: Isolated component for reviewing/accepting AI-generated text before insertion. Features a **Focus Mode (Expanded)** and **Instruction Blueprint** view.

### 3. AI Intelligence
- **Prompt Engine**: Assembles a 7-block directive prompt including Persona, Global Context, Genre Goals, Chapter Arc, Cast, Previous Context, and Immediate Action.
- **Inline Editor**: Context-aware text rewriting via a **Centered Revision Modal**. Automatically injects book synopsis and chapter goals into the rewrite prompt.
- **Hardened Prompts**: All user inputs are wrapped in strict XML delimiters to prevent prompt injection.

## 💾 Data Safety & UX
- **Safe Revalidation**: Server Actions use `revalidatePath`, triggered on the client via `startTransition` to avoid severing AI streams.
- **Focus Mode**: Activated via UI button or **`Escape`**. Centers the editor and hides all distraction panels.
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + Enter`: Trigger AI Generation.
  - `Escape`: Toggle Focus Mode.
- **Exclusive Expansion**: Sidebar automatically manages chapter focus.

## 📖 Key Knowledge & Gotchas
- **Hydration Safety**: Use `FormattedNumber` or `FormattedDate` for locale-dependent strings.
- **Webpack Watcher**: Database files are ignored in `next.config.ts`.
- **Navigation**: Always use `Link` or `router.push`; avoid manual state setters for navigation.

## 📜 Future Roadmap
- [x] Real-time AI Streaming (Gemini 2.5 Flash).
- [x] Inline Context-Aware AI Editing.
- [x] Immersive Focus Mode.
- [ ] AI Model Profile management.
- [ ] Multi-format Export (PDF/ePub).
- [ ] Version history/Snapshots.
