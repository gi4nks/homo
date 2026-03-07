# HOMO - Engineering Manifest v2.6.0

## 🎯 Project Overview
"HOMO" is a specialized drafting tool for authors. It prioritizes structure, context, and a distraction-free writing experience. The app uses a hierarchical data model (Book -> Chapter -> Scene) to provide LLMs with precise context for generating high-quality drafting prompts.

## 🛠️ Tech Stack & Constraints
- **Framework**: Next.js 16 (App Router) + React 19.
- **AI Engine**: Multi-provider support (Google Gemini, Anthropic Claude, OpenAI GPT) via Vercel AI SDK.
- **Styling**: Tailwind CSS 4 + DaisyUI 5. Strictly semantic classes (`base-100`, `base-200`, `card`, `collapse`).
- **Database**: SQLite with Prisma 6.
- **Editor**: TipTap with internal scrolling, extreme density overrides, and unified AI Proposal blocks.

## 🏗️ Architecture

### 1. State Management & Sync
- **URL & Zustand**: Navigation is URL-driven. UI state (panel visibility, focus mode, active engine) is managed via Zustand (`src/store/useWorkspaceStore.ts`).
- **Unified AI Flow**: AI commands from the Bubble Menu and general drafting from the Footer now share the same logic and UI component (`AiProposalBox`).
- **Precision Replacement**: Revision tasks use `insertContentAt` with persistent selection coordinates to perfectly overwrite original text even after UI deselects.
- **Hardened Auto-Save**: Metadata fields in the Inspector (Synopsis, Goals, Lore) now feature debounced auto-save + `onBlur` force-sync, integrated with the global sync indicator.

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
- **Live Content Injection**: AI API calls (`/api/generate`) now receive `liveContent` from the client ref, bypassing stale database states.
- **Global Cast Management**: Centralized character list in the Book tab acting as the master source for scene-level character selection.

## 💾 Data Safety & UX
- **Snapshot System**: Automated versioning ("Auto: Pre-AI") captured before every AI generation to prevent data loss.
- **Force Flush Logic**: Every AI trigger forces an immediate synchronous save to the database before the LLM is invoked.
- **Focus Mode**: Optimized for hardcore drafting with a `98vw` card width and maximized text density.

## 📜 Roadmap
- [x] Multi-Engine Support (Claude, GPT, Gemini).
- [x] Full Database Backup & Manuscript Export.
- [x] Version history / Snapshots.
- [x] Scene Locking & Protection logic.
- [x] Unified AI Drafting/Revision flow.
- [x] Global Cast Management (Book Tab).
- [ ] Multi-format Export (PDF/ePub).
- [ ] Collaboration / Sync (Optional).
