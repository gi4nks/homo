# Technical Documentation

## 🧬 Prompt Engine Logic
The prompt engine is designed to solve the "context window" problem by providing only relevant hierarchical information.

### Word Extraction
We use a regex-based cleaner to strip HTML tags before counting words. The engine extracts the **last 500 words** of the preceding scene to provide a "smooth transition" for the AI without flooding it with the entire book history.

```typescript
function getLast500Words(text: string): string {
  const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanText.split(' ');
  return words.length <= 500 ? cleanText : "... " + words.slice(-500).join(' ');
}
```

## 🏗️ Drag & Drop Implementation
The `ChapterManager` uses a nested `@dnd-kit` approach:
1. **DndContext**: Wraps the entire list.
2. **SortableContext (Chapters)**: Manages top-level chapter ordering.
3. **SortableContext (Scenes)**: Manages scenes within each expanded chapter.

### Reordering Flow
1. User drops item.
2. `handleDragEnd` triggers an **Optimistic Update** using `arrayMove` on local state.
3. A Server Action (`reorderChapters` or `reorderScenes`) is fired with an array of `{ id, orderIndex }`.
4. Database performs a bulk update within a `$transaction`.

## 💾 Database Schema
### Key Relationships
- **Book (1) -> Chapter (N)**: Cascade delete enabled.
- **Chapter (1) -> Scene (N)**: Cascade delete enabled.
- **Book (1) -> Character (N)**: Master character list.
- **Scene (N) <-> Character (M)**: The "Scene Cast". Managed via Prisma's implicit many-to-many relationship (`SceneCast`).

## 🎨 Styling System
The project uses **Tailwind CSS 4** with the **DaisyUI 5** plugin. 
- **Typography**: Uses the `@tailwindcss/typography` plugin (`prose` classes) for the Writing Canvas.
- **Themes**: Default theme is `corporate`. Dark mode uses the `dark` theme.
- **Layout**: Predominantly uses `flex-col h-full overflow-hidden` to create "App-like" fixed-size layouts where only specific containers scroll.
