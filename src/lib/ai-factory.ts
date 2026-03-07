import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export type AIProvider = 'GOOGLE' | 'OPENAI' | 'ANTHROPIC' | 'CUSTOM';

export function getAIModel(provider: AIProvider, modelName: string) {
  switch (provider) {
    case 'ANTHROPIC':
      return anthropic(modelName || 'claude-3-7-sonnet-latest');
    case 'OPENAI':
      return openai(modelName || 'gpt-4o');
    case 'GOOGLE':
    default:
      return google(modelName || 'gemini-2.5-flash');
  }
}
