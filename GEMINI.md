# HOMO - Engineering Manifest v3.0.0

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

### 2. AI Intelligence (SSOT & CMS V2)
- **Prompt Factory (`lib/prompt-builder.ts`)**: Single source of truth. Standardizes prompt hierarchy (Core Engine -> Style -> Persona -> Context -> Task).
- **Prompt Caching**: Implemented for Anthropic (Ephemeral) and Google Gemini (Context Caching >32k tokens) to reduce cost and latency.
- **Visual Validation**: The `HighlightedPromptEditor` provides real-time regex-based syntax highlighting for dynamic variables ({{sceneText}}, {{authorialIntent}}, etc.) in the CMS.
- **Dynamic Inspector Bindings**: Configuration UI in Settings allows mapping specific Inspector fields to specialized AI Protocols and Personas, rendering "Magic AI Buttons" (✨) on-demand.

### 3. Layout Hierarchy (Zero-Overlap Flexbox)
- **Root Layout**: A strict `flex-col h-screen` structure where the Header, Main area, and global Footer occupy non-overlapping slots.
- **Canvas Section**: A fixed-height container that hosts the Editor card. It prevents outer scroll to keep the Editor Footer anchored at the bottom.
- **Floating Action Badges**: Magic AI buttons are positioned as non-overlapping floating badges within the field labels row, preventing UI occlusion.

### 4. Scene Security & Lifecycle
- **Scene Locking**: A hardcoded protection mechanism (`isLocked`) that disables editing and AI generation for finalized prose.
- **Faded Ink Sidebar**: Completed chapters and scenes utilize a muted `slate-400` italic aesthetic to visually recede, highlighting active work.

## 💾 Data Safety & Security
- **Hardened Security**: Multi-layer security audit confirmed zero hardcoded secrets. All AI providers (Google, Anthropic, OpenAI) use server-side environment variables via Vercel AI SDK.
- **Git Integrity**: Enhanced `.gitignore` rules protect SQLite temporary files (`-shm`, `-wal`), local tool configurations (`.claude/`, `.gemini/`), and automated backups.
- **Snapshot System**: Automated versioning ("Auto: Pre-AI") captured before every AI generation.
- **Backup Redundancy**: Automated backup system with integrity checks (MD5) before `dev` and `build` cycles.
- **Cache Hit Indicator**: Global "Cache Hit / Cold Start" indicator provides real-time performance feedback.

## 📜 Roadmap
- [x] Multi-Engine Support (Claude, GPT, Gemini).
- [x] Full Database Backup & Manuscript Export.
- [x] Version history / Snapshots.
- [x] Scene Locking & Protection logic.
- [x] Unified AI Drafting/Revision flow.
- [x] Global Cast Management (Book Tab).
- [x] Dynamic AI Inspector Bindings.
- [x] Prompt Caching (Anthropic/Gemini).
- [x] Security Hardening & Secret Management Audit.
- [ ] Multi-format Export (PDF/ePub).
- [ ] Collaboration / Sync (Optional).
