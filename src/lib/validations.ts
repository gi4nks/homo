import { z } from 'zod';

// --- COMMON ---
export const IdSchema = z.string().uuid();
export const CloneItemSchema = z.object({ id: IdSchema });

// --- BOOK VALIDATIONS ---
export const CreateBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  genre: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  tone: z.string().max(100).optional(),
});

export const UpdateBookBibleSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255).optional(),
  genre: z.string().max(100).optional(),
  synopsis: z.string().optional(),
  genreSpecificGoals: z.string().optional(),
  genreId: z.string().uuid().nullable().optional(),
  tone: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
});

// --- CHAPTER VALIDATIONS ---
export const CreateChapterSchema = z.object({
  bookId: IdSchema,
  title: z.string().min(1, "Title is required").max(255),
});

export const UpdateChapterSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255).optional(),
  chapterGoal: z.string().optional(),
  orderIndex: z.number().int().positive().optional(),
  chapterNumber: z.number().int().positive().optional(),
});

export const ReorderChaptersSchema = z.object({
  bookId: IdSchema,
  updates: z.array(z.object({
    id: IdSchema,
    orderIndex: z.number().int().positive(),
  })),
});

// --- CHARACTER VALIDATIONS ---
export const CharacterSchema = z.object({
  bookId: IdSchema,
  name: z.string().min(1, "Name is required").max(255),
  role: z.string().max(100).optional(),
  description: z.string().optional(),
});

export const UpdateCharacterSchema = CharacterSchema.partial().extend({
  id: IdSchema
});

// --- SCENE VALIDATIONS (Existing) ---
export const CreateSceneSchema = z.object({
  chapterId: IdSchema,
  title: z.string().min(1).max(255),
});

export const UpdateSceneSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  promptGoals: z.string().optional(),
  orderIndex: z.number().int().positive().optional(),
  sceneNumber: z.number().int().positive().optional(),
});

export const UpdateSceneContentSchema = z.object({
  id: IdSchema,
  content: z.string(),
});

export const UpdateScenePromptGoalsSchema = z.object({
  id: IdSchema,
  promptGoals: z.string(),
});

export const ReorderScenesSchema = z.object({
  chapterId: IdSchema,
  updates: z.array(z.object({
    id: IdSchema,
    orderIndex: z.number().int().positive(),
  })),
});

export const ToggleCharacterInSceneSchema = z.object({
  sceneId: IdSchema,
  characterId: IdSchema,
});
