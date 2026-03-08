# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HOMO** is a Next.js 16 manuscript authoring suite for professional writers (novelists, essayists, technical authors). It provides context-aware AI assistance with multi-provider support (Google Gemini, Anthropic Claude, OpenAI GPT) for drafting and editing long-form content.

The app uses a hierarchical data model (Book → Chapter → Scene) to provide LLMs with precise context for generating high-quality prose. All AI logic flows through a centralized **SSOT Prompt Factory** (`lib/prompt-builder.ts`).

## Development Commands

```bash
# Install dependencies
npm install

# Database setup (first time or after schema changes)
npx prisma db push
npx prisma generate

# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Environment Setup

Create `.env.local` with:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
DATABASE_URL="file:./dev.db"
```

## Architecture Fundamentals

### 1. Data Layer Pattern

**Server Actions** (`src/app/actions/*.actions.ts`) provide an RPC-like interface for all database operations. API Routes (`src/app/api/*`) are ONLY used for streaming responses.

```
Client Component
    ↓ calls
Server Action (e.g., updateSceneContent)
    ↓ uses
Prisma Client (singleton from lib/prisma.ts)
    ↓ persists to
SQLite (dev.db)
```

**Critical Pattern**: Never perform database operations in API routes. Use Server Actions for all CRUD.

### 2. AI Prompt Assembly (SSOT)

**Single Source of Truth**: `lib/prompt-builder.ts` → `buildMasterPrompt()`

All AI generation flows through this function, which:
1. Fetches `PromptTemplate` (user-defined or default)
2. Fetches `AiProfile` (writing persona)
3. Applies genre-aware logic (fiction vs. non-fiction detection)
4. Compiles template variables ({{bookSynopsis}}, {{sceneText}}, etc.)
5. Returns **split context** for caching optimization:
   - **Static Context** (book-wide, cache-friendly): System instruction, persona, style, synopsis, lore
   - **Dynamic Context** (scene-specific): Current content, previous scene, task directive

**Provider-Specific Caching**:
- **Anthropic**: Ephemeral cache (5-min window), static context prefixed with cache breakpoint
- **Gemini**: In-memory cache registry for >32KB contexts
- **OpenAI**: No caching

### 3. AI Streaming Workflow

```
User Action (Cmd+Enter or Cmd+J)
    ↓
SceneEditor.tsx orchestrator
    ↓
useAiStream.ts hook
    ├─ Calls generatePromptData() to build prompt
    └─ Streams to /api/generate or /api/rewrite
        ↓
API Route
    ├─ Fetches scene + book context from DB
    ├─ Calls buildMasterPrompt() (⚠️ REDUNDANT - see AGENTS.md)
    ├─ Instantiates AI model via getAIModel()
    └─ Returns streamText() event stream
        ↓
Editor.tsx (AiProposalBox component)
    ├─ Accumulates streamed chunks
    ├─ User accepts → insertContentAt() with range
    ├─ createSnapshot() for version history
    └─ updateSceneContent() to persist
```

### 4. State Management

**Zustand Store** (`src/store/useWorkspaceStore.ts`) manages workspace state:
- Active AI profile/template (both default + ephemeral overrides)
- Panel visibility (left/right/focus mode)
- Save status tracking
- Inspector field bindings (metadata → AI protocol mappings)

**Hydration Pattern**: `WorkspaceSync.tsx` (client component) runs one-time effect to hydrate Zustand from server-fetched props. This maintains SSR compatibility.

### 5. Editor Integration

**TipTap (ProseMirror)** via `Editor.tsx` (335 LOC):
- Uses `useImperativeHandle` to expose ref methods: `insertContentAt()`, `replaceRange()`, `forceSave()`
- `liveContentRef` maintains in-memory cache of editor state to bypass DB latency
- Debounced auto-save (500ms) + `onBlur` force-sync for all metadata fields

**Critical Pattern**: Always use `liveContent` injection when calling AI APIs to ensure the prompt reflects absolute latest text (not stale DB content).

### 6. Database Schema Key Points

```prisma
Book {
  // Metadata for AI context
  synopsis, tone, styleReference, authorialIntent, loreConstraints

  // AI defaults (overridable at scene level)
  defaultAiProfile, defaultPromptTemplate

  // Relations
  chapters: Chapter[]
  charactersList: Character[]
  genreConfig: GenreConfig?
}

Scene {
  content (HTML from TipTap)
  isLocked (boolean - prevents AI overwrites)

  // Scene-level AI overrides
  defaultAiProfile?, defaultPromptTemplate?

  // Version history
  snapshots: Snapshot[]

  // Many-to-many character casting
  characters: Character[]
}

PromptTemplate {
  phase: WORLDBUILDING|OUTLINING|DRAFTING|EDITING|UTILITY
  systemInstruction (core HOMO engine)
  contextTemplate ({{variable}} interpolation)
  taskDirective (specific task logic)
}

AiProfile {
  name, description
  systemPrompt (persona instruction)
}
```

**Cascade Deletes**: Book deletion cascades to chapters → scenes → snapshots automatically via Prisma schema.

### 7. Layout Hierarchy (Zero-Overlap Flexbox)

```
RootLayout (flex-col h-screen)
├─ GlobalHeader (fixed)
├─ Main (flex-1)
│  └─ WorkspaceShell (flex-row)
│     ├─ SidebarPanel (ChapterManager + DnD)
│     ├─ CanvasSection (fixed-height, internal scroll)
│     │  └─ Editor card (TipTap + AiProposalBox)
│     └─ InspectorPanel (tab switcher)
│        ├─ BookTab (metadata, characters, AI defaults)
│        ├─ SceneTab (scene metadata, AI bindings)
│        └─ HistoryTab (snapshots, diff viewer)
└─ Footer (status bar)
```

**Critical Pattern**: Canvas Section uses `max-h-[calc(100vh-...)]` to prevent outer scroll. Editor has internal scrolling to keep Footer anchored.

## Key Patterns & Conventions

### Validation
All user inputs validated via **Zod schemas** (`lib/validations.ts`) before DB operations. Server Actions return generic `ActionResponse<T>` wrapper:
```typescript
interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}
```

### Template Variable System
- Variables defined in `lib/template-engine.ts` → `compileTemplate()`
- Syntax: `{{variableName}}` in PromptTemplate fields
- Typos silently return `"N/A"` (⚠️ weakly-typed, see AGENTS.md)
- Common variables: `bookSynopsis`, `sceneText`, `sceneCast`, `authorialIntent`, `loreConstraints`, `narrativePosition`

### Scene Protection
- `isLocked: true` disables editing UI and AI generation
- Locked scenes show "Faded Ink" aesthetic in sidebar (slate-400 italic)
- Auto-snapshot created before every AI action

### Styling Constraints
- **DaisyUI 5 only**: Use semantic classes (`btn`, `card`, `collapse`, `base-100`)
- Avoid arbitrary Tailwind classes where DaisyUI semantic equivalents exist
- Fantasy theme enforced globally

## Keyboard Shortcuts

- **Cmd+Enter**: AI Scene Generation (drafting continuation)
- **Cmd+J**: AI Command Bar (selection-aware inline edits)
- **Escape**: Toggle Ultra-Dense Focus Mode
- **Cmd+Z/Y**: Undo/Redo (TipTap-only, NOT for AI edits)

## Critical Files for Understanding

- `lib/prompt-builder.ts` (150 LOC) - SSOT for all AI logic
- `src/app/actions/ai.actions.ts` (302 LOC) - AI orchestration
- `src/store/useWorkspaceStore.ts` - Workspace state + 100+ action creators
- `src/components/Editor.tsx` (335 LOC) - TipTap integration + AI controls
- `prisma/schema.prisma` - Full data model with cascades

## Known Issues & Technical Debt

See `AGENTS.md` for comprehensive architectural analysis. Key issues:
1. **Redundant Prompt Building**: `buildMasterPrompt()` called on both client and server
2. **N+1 Query Risk**: `generatePromptData()` fetches entire book hierarchy to find previous scene
3. **Snapshot Unbounded Growth**: No cleanup mechanism for old snapshots
4. **Zero Test Coverage**: No `.test.ts` files
5. **Prompt Injection Risk**: User instructions concatenated without escaping
6. **No Rate Limiting**: `/api/generate` and `/api/rewrite` unprotected

## Database Operations

```bash
# View database contents (Prisma Studio)
npx prisma studio

# Create migration after schema changes
npx prisma migrate dev --name description_of_change

# Reset database (⚠️ destroys all data)
npx prisma migrate reset

# Seed default AI profiles & templates
# (Run via Settings UI → Profiles/Prompts → "Seed Defaults" button)
```

## Multi-Provider AI Model Support

**Google Gemini**: gemini-2.5-flash (default), gemini-2.5-flash-lite, gemini-3.0-flash
**Anthropic Claude**: claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5
**OpenAI GPT**: gpt-4o, gpt-4o-mini

Switch provider/model via Settings → AI Models or Editor Footer quick-access.

## Version History System

- **Auto-snapshots**: Created before every AI generation action
- **Manual snapshots**: Create via Scene Inspector → History tab
- **Restore**: Side-by-side diff viewer shows changes before restoration
- **No cleanup**: Snapshots accumulate indefinitely (see technical debt)
