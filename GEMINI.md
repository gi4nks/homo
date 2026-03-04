# HOMO - Engineering Manifest

## 🎯 Project Overview
"HOMO" is a specialized drafting tool for authors. It prioritizes structure, context, and a distraction-free writing experience. The app uses a hierarchical data model (Book -> Chapter -> Scene) to provide LLMs with precise context for generating high-quality drafting prompts.

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
- **UI State**: Zustand (`src/store/useWorkspaceStore.ts`) manages transient UI context (panel visibility, focus mode, unsaved changes, modal data, and confirmation states).
- **Streaming**: Custom hook `useAiStream.ts` handles vanilla JS fetch readers for bulletproof real-time generation immunity to HMR.

### 2. Component Hierarchy
- `GlobalHeader`: Context-aware navbar. Hidden in **Focus Mode**. Includes "Prompt Preview" utility.
- `WorkspaceClient`: Root workspace layout with collapsible sidebars and **Focus Mode** orchestration.
- `ChapterManager`: Left Navigator with exclusive chapter expansion and active route highlighting.
- `SceneEditor`: Central Canvas with TipTap, real-time word counting, and AI profile selector.
- `Editor`: TipTap instance with a **Unified Bubble Menu** (formatting + AI rewrite triggers).
- `AiProposalBox`: Isolated component for reviewing/accepting AI-generated text before insertion. Features an **Expanded View** and **Instruction Blueprint** terminal.
- `ConfirmationModal`: Global styled replacement for native browser `confirm()` dialogs.

### 3. AI Intelligence (SSOT)
- **Prompt Factory (`lib/prompt-builder.ts`)**: Single source of truth for all LLM instructions. Standardizes prompt hierarchy (Core Engine -> Manuscript Style -> Persona Overlay -> Context -> Task).
- **AI Profile Management**: CRUD system for AI "Personas" (e.g., The Dark Epic Poet, The Action Director). Profiles are dynamically injected into the system prompt.
- **Genre-Aware Prompting**: Automatically detects Fiction vs. Non-Fiction genres to adjust task directives and stylistic constraints.
- **Context-Aware Rewriting**: Inline edits (Improve, Darker, etc.) are now fully aware of the book's synopsis and chapter goals.
- **Hardened Prompts**: Strict XML delimiters prevent prompt injection from user data.

## 💾 Data Safety & UX
- **Safe Revalidation**: Server Actions use `revalidatePath`, triggered on the client via `startTransition` to avoid severing AI streams.
- **Focus Mode**: Activated via UI button or **`Escape`**. Centers the editor and hides all distraction panels.
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + Enter`: Trigger AI Generation.
  - `Escape`: Toggle Focus Mode.
- **Exclusive Expansion**: Sidebar automatically manages chapter focus.
- **Accordion Inspector**: All metadata sections are now collapsible `<details>` blocks to optimize vertical space.

## 📖 Key Knowledge & Gotchas
- **Hydration Safety**: Use `FormattedNumber` or `FormattedDate` for locale-dependent strings.
- **Webpack Watcher**: Database files are ignored in `next.config.ts`.
- **Navigation**: Always use `Link` or `router.push`; avoid manual state setters for navigation.
- **Zod Validation**: Centralized in `lib/validations.ts` with strict length limits (e.g., 5000 chars for Style guides).

## 📜 Future Roadmap
- [x] Real-time AI Streaming (Gemini 2.5 Flash).
- [x] Inline Context-Aware AI Editing.
- [x] Immersive Focus Mode.
- [x] AI Profile Management (Personas).
- [ ] Multi-format Export (PDF/ePub).
- [ ] Version history/Snapshots.
