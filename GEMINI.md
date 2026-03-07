# HOMO - Engineering Manifest v2.4.0

## 🎯 Project Overview
"HOMO" is a specialized drafting tool for authors. It prioritizes structure, context, and a distraction-free writing experience. The app uses a hierarchical data model (Book -> Chapter -> Scene) to provide LLMs with precise context for generating high-quality drafting prompts.

## 🛠️ Tech Stack & Constraints
- **Framework**: Next.js 16 (App Router) + React 19.
- **AI Engine**: Multi-provider support (Google Gemini, Anthropic Claude, OpenAI GPT) via Vercel AI SDK.
- **Styling**: Tailwind CSS 4 + DaisyUI 5. Strictly semantic classes (`base-100`, `base-200`, `card`, `collapse`).
- **Database**: SQLite with Prisma 6.
- **Editor**: TipTap with internal scrolling, extreme density overrides, and AI-powered Bubble Menu.

## 🏗️ Architecture

### 1. State Management & Sync
- **URL & Zustand**: Navigation is URL-driven. UI state (panel visibility, focus mode, active engine) is managed via Zustand (`src/store/useWorkspaceStore.ts`).
- **WorkspaceSync**: A robust synchronization layer that aligns server data with the global store, handling structural changes while protecting optimistic UI states.
- **Bidirectional Sync**: Editor footer controls (Model, Template, Persona) are synchronized with the Inspector and persisted to the DB via Server Actions.

### 2. Scene Security & Lifecycle
- **Scene Locking**: A hardcoded protection mechanism (`isLocked`) that disables editing and AI generation for finalized prose.
- **Optimistic Locking**: Toggle actions are processed instantly via Zustand and persisted to the DB without destructive page revalidations.
- **Read-Only Mode**: Locked scenes maintain full typographical contrast for reading pleasure but disable the AI Bubble Menu and formatting tools.

### 3. Layout Hierarchy (Zero-Overlap Flexbox)
- **Root Layout**: A strict `flex-col h-screen` structure where the Header, Main area, and global Footer occupy non-overlapping slots.
- **Canvas Section**: A fixed-height container that hosts the Editor card. It prevents outer scroll to keep the Editor Footer anchored at the bottom.
- **Faded Ink Sidebar**: Completed chapters and scenes utilize a muted `slate-400` italic aesthetic to visually recede, highlighting active work.

### 4. AI Intelligence (SSOT)
- **Prompt Factory (`lib/prompt-builder.ts`)**: Single source of truth. Standardizes prompt hierarchy (Core Engine -> Style -> Persona -> Context -> Task).
- **Hardened Bubble Menu**: A floating action bar appended to `document.body` (via Tippy.js) to prevent clipping, featuring a refined Sans-Serif UI.
- **Harmonized AI Proposals**: Unified indigo-themed design for both drafting and revision proposals, including integrated XML Blueprints.

## 💾 Data Safety & UX
- **Snapshot System**: Automated versioning ("Auto: Pre-AI") captured before every AI generation to prevent data loss.
- **Custom Confirmation**: A DaisyUI-native asynchronous modal system for dangerous operations (restoring, deleting, unlocking).
- **Focus Mode**: Optimized for hardcore drafting with a `98vw` card width and maximized text density.

## 📜 Roadmap
- [x] Multi-Engine Support (Claude, GPT, Gemini).
- [x] Full Database Backup & Manuscript Export.
- [x] Version history / Snapshots.
- [x] Scene Locking & Protection logic.
- [x] DaisyUI 5 Theme Migration (Fantasy).
- [ ] Multi-format Export (PDF/ePub).
- [ ] Collaboration / Sync (Optional).
