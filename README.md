# Novel AI Architect 🏛️

A professional Next.js 16 manuscript suite enabling authors to draft books chapter-by-chapter with context-aware LLM prompts and local SQLite persistence.

## 🚀 Key Features

- **Hierarchical Manuscript Management**: Organize your work into Books, Chapters, and Scenes.
- **AI-Powered Drafting**: Real-time streaming generation using **Google Gemini 2.5 Flash** with reasoning capabilities.
- **AI Proposal UI**: Review and accept AI suggestions letter-by-letter before committing them to your manuscript.
- **Professional Three-Pane Workspace**:
  - **Navigator (Left)**: Drag & Drop reordering with exclusive chapter expansion and active route highlighting.
  - **Writing Canvas (Center)**: Distraction-free TipTap editor with 1.5s debounced autosave and focus protection.
  - **Inspector (Right)**: Context-aware tabs for Book metadata, Chapter goals, and Scene casting.
- **Intelligent Prompt Engine**: Automatically assembles 7-block LLM prompts including global synopsis, genre rules, chapter arcs, scene cast, and previous context.
- **Manuscript Export**: Compile your entire book into a single Markdown file with a single click.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **AI SDK**: Vercel AI SDK + Google AI SDK
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Database**: SQLite with Prisma 6
- **Icons**: Lucide React
- **Editor**: TipTap (ProseMirror)
- **Drag & Drop**: @dnd-kit

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Create a `.env.local` file:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
   DATABASE_URL="file:./dev.db"
   ```

3. **Setup Database**:
   ```bash
   npx prisma db push
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## 📐 Architecture

- **URL-Based Navigation**: All manuscript context (Book, Chapter, Scene) is managed via Next.js Dynamic Routes, ensuring deep-linking and browser history support.
- **Zustand**: Manages transient UI state such as panel visibility and modal data.
- **Custom Hooks**: `useAiStream` handles bulletproof manual fetch streams to prevent HMR interruptions during long generations.
- **Server Actions**: All database operations are handled via type-safe server actions with Zod validation.
- **Safe Sync**: Uses React's `startTransition` for background autosaves to maintain high-priority UI responsiveness and stream integrity.

## 📝 Manuscript Logic

- **Word Counts**: Calculated in real-time on the client and displayed in the Navigator and Canvas Footer.
- **Exclusive Expansion**: The sidebar automatically manages chapter focus, keeping your workspace clean.
- **Genre Injection**: Genre-specific rules defined in `/settings/genres` are automatically injected into the AI prompt template.
