# HOMO 🏛️ v3.0.0

A professional Next.js 16 manuscript suite enabling authors to craft books, essays, and technical content with context-aware AI assistance and immersive focus.

## 🚀 Key Features

- **Unified AI Engine**: Drafting and targeted revisions share a single, elegant streaming UI. Use **Cmd+J** on selected text for surgical edits or the Footer for creative expansion.
- **Precision AI Replacement**: Targeted AI edits now use absolute document coordinates to perfectly overwrite selections, even after the UI is closed.
- **Hardened Security Architecture**: Full zero-secret audit completed. No hardcoded API keys; all provider configurations (Google, Anthropic, OpenAI) use secure, server-side environment variables via Vercel AI SDK.
- **Optimized Prompt Caching**: Native support for **Anthropic Prompt Caching** (ephemeral) and **Google Gemini Context Caching** (>32k tokens) to dramatically reduce latency and costs for long-form manuscripts.
- **Hardened Metadata Sync**: All fields in the Inspector (Global Synopsis, Character Cast, Scene Beats) feature debounced auto-save and `onBlur` force-sync to the database.
- **Global Cast Management**: Centralized character management in the Book tab serves as the source of truth for scene-level character tracking.
- **Scene Locking & Protection**: Finalize your prose by locking scenes to prevent accidental edits or AI overwrites, with an elegant "Faded Ink" archival sidebar aesthetic.
- **Version History (Snapshots)**: Automatic version capture before every AI action, with side-by-side diff viewing and easy restoration.
- **Ultra-Dense Focus Mode**: A distraction-free environment maximized for text density, centering your prose while providing quick access to essential AI controls.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **AI SDK**: Vercel AI SDK (Google, Anthropic, OpenAI)
- **Styling**: Tailwind CSS 4 + DaisyUI 5 (Strictly semantic components)
- **Database**: SQLite with Prisma 6
- **Editor**: TipTap (ProseMirror)

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Create a `.env.local` file:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   DATABASE_URL="file:./dev.db"
   ```

3. **Setup Database**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## ⌨️ Keyboard Shortcuts

- **`Cmd/Ctrl + Enter`**: Trigger AI Scene Generation.
- **`Cmd/Ctrl + J`**: Open AI Command Bar for selected text.
- **`Escape`**: Toggle Focus Mode.
- **`Cmd/Ctrl + Z / Y`**: Undo/Redo within the editor.

## 📐 Architecture

- **SSOT Prompt Factory**: Centralized logic in `lib/prompt-builder.ts` ensures consistent instructions across all generation tasks.
- **Synchronous Context**: Uses `liveContent` injection from client refs to bypass database latency and ensure the AI always sees the absolute latest text.
- **Precision Replacement**: Uses `insertContentAt` with persistent range tracking to solve the "Selection Clearing" bug in TipTap.
- **Git Integrity**: Optimized `.gitignore` structure protecting internal agent data (`.gemini/`, `.claude/`), SQLite temporary files (`-shm`, `-wal`), and automated logs.

## 🔒 Database Backup & Recovery

HOMO includes an **automated backup system** with integrity verification:

### Automatic Backups
- ✅ Backup created automatically before every `npm run dev` and `npm run build`
- ✅ Backups stored in `/backups` directory with timestamp
- ✅ Last 30 backups retained automatically (older ones deleted)
- ✅ Each backup verified with MD5 checksum

### Manual Backup & Restore
```bash
# Create manual backup
npm run backup

# View backups in UI
Navigate to Settings → Data & Exports → SQLite Database Backups
```

### Recovery Procedure
If you need to restore from a backup:

1. **Via UI** (Recommended):
   - Navigate to `Settings → Data & Exports`
   - Find your backup in the "SQLite Database Backups" section
   - Click "Restore" on the desired backup
   - Confirm restoration (a safety backup is created automatically)
   - Reload the application

2. **Manual Recovery**:
   ```bash
   # Stop the development server
   # Copy backup file to dev.db
   cp backups/dev-TIMESTAMP.db dev.db
   # Restart the server
   npm run dev
   ```
