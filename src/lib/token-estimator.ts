/**
 * Token Estimation Utilities
 *
 * Provides lightweight token count estimation without heavy tokenizer dependencies.
 * Uses a character-based heuristic that is reasonably accurate for all major providers.
 *
 * Accuracy: ~85-95% vs actual tokenizer (good enough for context window validation)
 */

/**
 * Context window limits per model (in tokens)
 */
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  // Google Gemini
  'gemini-2.5-flash': 1048576,         // 1M tokens
  'gemini-2.5-flash-lite': 1048576,
  'gemini-3.0-flash': 1048576,

  // Anthropic Claude
  'claude-sonnet-4-6': 200000,
  'claude-opus-4-6': 200000,
  'claude-haiku-4-5': 200000,

  // OpenAI GPT
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
};

const DEFAULT_CONTEXT_LIMIT = 128000;

/**
 * Estimate token count from text using character-based heuristic.
 *
 * Heuristic: ~4 characters per token for English text (standard GPT tokenizer ratio).
 * For mixed content (HTML, code, punctuation), closer to 3.5 chars/token.
 *
 * This is intentionally conservative (overestimates slightly) to prevent context overflow.
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;

  // Use 3.5 chars per token (conservative, overestimates slightly)
  const charBasedEstimate = Math.ceil(text.length / 3.5);

  return charBasedEstimate;
}

/**
 * Get the context window limit for a specific model.
 */
export function getContextWindowLimit(modelName: string): number {
  return MODEL_CONTEXT_LIMITS[modelName] || DEFAULT_CONTEXT_LIMIT;
}

/**
 * Validate that a prompt fits within the context window.
 *
 * Returns validation result with usage stats and warnings.
 *
 * @param staticContext - Book-level context (cached)
 * @param dynamicContext - Scene-level context (per-request)
 * @param modelName - Target model name
 * @param reserveOutputTokens - Tokens to reserve for model output (default: 4096)
 */
export function validateContextWindow(
  staticContext: string,
  dynamicContext: string,
  modelName: string,
  reserveOutputTokens: number = 4096
): {
  isValid: boolean;
  totalTokens: number;
  staticTokens: number;
  dynamicTokens: number;
  contextLimit: number;
  availableTokens: number;
  usagePercentage: number;
  warning: string | null;
} {
  const staticTokens = estimateTokenCount(staticContext);
  const dynamicTokens = estimateTokenCount(dynamicContext);
  const totalTokens = staticTokens + dynamicTokens;
  const contextLimit = getContextWindowLimit(modelName);
  const effectiveLimit = contextLimit - reserveOutputTokens;
  const availableTokens = Math.max(0, effectiveLimit - totalTokens);
  const usagePercentage = (totalTokens / effectiveLimit) * 100;

  let warning: string | null = null;

  if (totalTokens > effectiveLimit) {
    warning = `Context overflow: ${totalTokens} tokens exceeds limit of ${effectiveLimit} (${modelName}). Truncation needed.`;
  } else if (usagePercentage > 80) {
    warning = `High context usage: ${usagePercentage.toFixed(0)}% (${totalTokens}/${effectiveLimit} tokens).`;
  }

  return {
    isValid: totalTokens <= effectiveLimit,
    totalTokens,
    staticTokens,
    dynamicTokens,
    contextLimit,
    availableTokens,
    usagePercentage,
    warning
  };
}

/**
 * Truncate text to fit within a target token budget.
 *
 * Truncates from the beginning (keeps the end, which is usually more relevant).
 */
export function truncateToTokenBudget(text: string, maxTokens: number): string {
  if (!text) return '';

  const estimatedTokens = estimateTokenCount(text);
  if (estimatedTokens <= maxTokens) return text;

  // Calculate target character count
  const targetChars = Math.floor(maxTokens * 3.5);

  if (text.length <= targetChars) return text;

  // Truncate from beginning, keep end (more relevant for context)
  const truncated = text.slice(text.length - targetChars);

  // Try to break at a paragraph or sentence boundary
  const paragraphBreak = truncated.indexOf('\n\n');
  if (paragraphBreak > 0 && paragraphBreak < targetChars * 0.3) {
    return '[...truncated...]\n\n' + truncated.slice(paragraphBreak + 2);
  }

  const sentenceBreak = truncated.indexOf('. ');
  if (sentenceBreak > 0 && sentenceBreak < targetChars * 0.2) {
    return '[...truncated...] ' + truncated.slice(sentenceBreak + 2);
  }

  return '[...truncated...] ' + truncated;
}
