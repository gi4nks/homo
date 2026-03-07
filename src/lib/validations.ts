import { z } from 'zod';

// --- COMMON ---
export const IdSchema = z.string().uuid();
export const CloneItemSchema = z.object({ id: IdSchema });

export const ReorderItemSchema = z.object({
  id: IdSchema,
  orderIndex: z.number().int().nonnegative(),
});
export const ReorderPayloadSchema = z.array(ReorderItemSchema);

export type IdInput = z.infer<typeof IdSchema>;
export type CloneItemInput = z.infer<typeof CloneItemSchema>;
export type ReorderItemInput = z.infer<typeof ReorderItemSchema>;
export type ReorderPayloadInput = z.infer<typeof ReorderPayloadSchema>;

// --- BOOK VALIDATIONS ---
export const CreateBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  genre: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  tone: z.string().max(5000).optional(),
});
export type CreateBookInput = z.infer<typeof CreateBookSchema>;

export const UpdateBookBibleSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255).optional(),
  genre: z.string().max(100).optional(),
  synopsis: z.string().optional(),
  styleReference: z.string().optional(),
  authorialIntent: z.string().optional(),
  loreConstraints: z.string().optional(),
  genreSpecificGoals: z.string().optional(),
  genreId: z.string().uuid().nullable().optional(),
  tone: z.string().max(5000).optional(),
  status: z.string().max(50).optional(),
  defaultAiProfileId: z.string().uuid().nullable().optional(),
  defaultPromptTemplateId: z.string().uuid().nullable().optional(),
});
export type UpdateBookBibleInput = z.infer<typeof UpdateBookBibleSchema>;

// --- CHAPTER VALIDATIONS ---
export const CreateChapterSchema = z.object({
  bookId: IdSchema,
  title: z.string().min(1, "Title is required").max(255),
});
export type CreateChapterInput = z.infer<typeof CreateChapterSchema>;

export const UpdateChapterSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255).optional(),
  chapterGoal: z.string().optional(),
  orderIndex: z.number().int().positive().optional(),
  chapterNumber: z.number().int().positive().optional(),
});
export type UpdateChapterInput = z.infer<typeof UpdateChapterSchema>;

export const ReorderChaptersSchema = z.object({
  bookId: IdSchema,
  updates: z.array(z.object({
    id: IdSchema,
    orderIndex: z.number().int().positive(),
  })),
});
export type ReorderChaptersInput = z.infer<typeof ReorderChaptersSchema>;

// --- CHARACTER VALIDATIONS ---
export const CharacterSchema = z.object({
  bookId: IdSchema,
  name: z.string().min(1, "Name is required").max(255),
  role: z.string().max(100).optional(),
  description: z.string().optional(),
});
export type CharacterInput = z.infer<typeof CharacterSchema>;

export const UpdateCharacterSchema = CharacterSchema.partial().extend({
  id: IdSchema
});
export type UpdateCharacterInput = z.infer<typeof UpdateCharacterSchema>;

// --- SCENE VALIDATIONS (Existing) ---
export const CreateSceneSchema = z.object({
  chapterId: IdSchema,
  title: z.string().min(1).max(255),
});
export type CreateSceneInput = z.infer<typeof CreateSceneSchema>;

export const UpdateSceneSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  promptGoals: z.string().optional(),
  narrativePosition: z.string().optional(),
  orderIndex: z.number().int().positive().optional(),
  sceneNumber: z.number().int().positive().optional(),
  defaultAiProfileId: z.string().uuid().nullable().optional(),
  defaultPromptTemplateId: z.string().uuid().nullable().optional(),
});
export type UpdateSceneInput = z.infer<typeof UpdateSceneSchema>;

export const UpdateSceneContentSchema = z.object({
  id: IdSchema,
  content: z.string(),
});
export type UpdateSceneContentInput = z.infer<typeof UpdateSceneContentSchema>;

export const UpdateScenePromptGoalsSchema = z.object({
  id: IdSchema,
  promptGoals: z.string(),
});
export type UpdateScenePromptGoalsInput = z.infer<typeof UpdateScenePromptGoalsSchema>;

export const ReorderScenesSchema = z.object({
  chapterId: IdSchema,
  updates: z.array(z.object({
    id: IdSchema,
    orderIndex: z.number().int().positive(),
  })),
});
export type ReorderScenesInput = z.infer<typeof ReorderScenesSchema>;

export const ToggleCharacterInSceneSchema = z.object({
  sceneId: IdSchema,
  characterId: IdSchema,
});
export type ToggleCharacterInSceneInput = z.infer<typeof ToggleCharacterInSceneSchema>;

// --- GENRE VALIDATIONS ---
export const GenreConfigSchema = z.object({
  genreName: z.string().min(1, "Genre name is required").max(100),
  customPromptRules: z.string().min(1, "Rules are required"),
});
export type GenreConfigInput = z.infer<typeof GenreConfigSchema>;

export const UpdateGenreConfigSchema = GenreConfigSchema.partial().extend({
  id: IdSchema
});
export type UpdateGenreConfigInput = z.infer<typeof UpdateGenreConfigSchema>;
