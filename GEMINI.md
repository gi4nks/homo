# HOMO - Engineering Manifest v2.2.0

## 🎯 Project Overview
"HOMO" is a specialized drafting tool for authors. It prioritizes structure, context, and a distraction-free writing experience. The app uses a hierarchical data model (Book -> Chapter -> Scene) to provide LLMs with precise context for generating high-quality drafting prompts.

## 🛠️ Tech Stack & Constraints
- **Framework**: Next.js 16 (App Router) + React 19.
- **AI Engine**: Multi-provider support (Google Gemini, Anthropic Claude, OpenAI GPT) via Vercel AI SDK.
- **Styling**: Tailwind CSS 4 + DaisyUI 5. Strictly semantic classes (`base-100`, `base-200`, `card`, `collapse`).
- **Database**: SQLite with Prisma 6.
- **Editor**: TipTap with internal scrolling and extreme density overrides.

## 🏗️ Architecture

### 1. State Management & Sync
- **URL & Zustand**: Navigation is URL-driven. UI state (panel visibility, focus mode, active engine) is managed via Zustand (`src/store/useWorkspaceStore.ts`).
- **AiEngineSync**: A global client component that initializes AI provider settings from the database on app load.
- **Bidirectional Sync**: Editor footer controls (Model, Template, Persona) are synchronized with the Inspector and persisted to the DB via Server Actions.

### 2. Layout Hierarchy (Zero-Overlap Flexbox)
- **Root Layout**: A strict `flex-col h-screen` structure where the Header, Main area, and global Footer occupy non-overlapping slots.
- **Canvas Section**: A fixed-height container that hosts the Editor card. It prevents outer scroll to keep the Editor Footer anchored at the bottom.
- **Editor Card**: A "floating" card with `shadow-2xl` and `mb-8+` spacing, visually detached from the system watermark footer.

### 3. Component Hierarchy
- `GlobalHeader`: Context-aware navbar with quick-access project settings.
- `ChapterManager`: Left Navigator with Drag & Drop reordering and exclusive expansion logic.
- `SceneEditor`: Central workstation with internal scroll, real-time word counting, and the unified AI Footer.
- `InspectorSection`: A reusable, stateful wrapper using DaisyUI `collapse` or `card` components based on a `collapsible` prop.
- `FooterSelector`: A unified, premium dropdown component for Engine, Template, and Persona selection.

### 4. AI Intelligence (SSOT)
- **Prompt Factory (`lib/prompt-builder.ts`)**: Single source of truth. Standardizes prompt hierarchy (Core Engine -> Style -> Persona -> Context -> Task).
- **Dynamic Grounding**: Injects `{{styleReference}}`, `{{authorialIntent}}`, and `{{loreConstraints}}` into the prompt context for deeper manuscript alignment.
- **Contextual Action Chips**: Quick-access AI tasks (Improve, Cruder, Summarize) injected into the bubble menu for zero-click drafting.

## 💾 Data Safety & UX
- **Data Portability**: Full JSON backup and Markdown manuscript exports available via browser or direct local disk save (`fs` API).
- **Focus Mode**: Optimized for hardcore drafting with a `98vw` card width, reduced padding, and maximized text density.
- **Safe Revalidation**: Server Actions use `revalidatePath` triggered via `startTransition` to protect active AI streams.

## 📜 Roadmap
- [x] Multi-Engine Support (Claude, GPT, Gemini).
- [x] Full Database Backup & Manuscript Export.
- [x] Logical Inspector Refactor.
- [x] Quick-Switch AI Footer.
- [ ] Multi-format Export (PDF/ePub).
- [ ] Version history/Snapshots.
- [ ] Collaboration / Sync (Optional).
