'use client';

import { useState, useCallback } from 'react';
import { generatePromptData } from '@/app/actions/ai.actions';

export function useAiStream() {
  const [aiProposal, setAiProposal] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [promptBlueprint, setPromptBlueprint] = useState<string | null>(null);

  const startStream = useCallback(async (
    bookId: string, 
    sceneId?: string | null, 
    profileId?: string, 
    promptTemplateId?: string,
    instruction?: string,
    taskType: 'DRAFT' | 'REWRITE' | 'ANALYZE' = 'DRAFT',
    originalVersion?: string,
    revisedVersion?: string,
    liveContent?: string,
    selectedText?: string 
    ) => {
    if (!bookId) return;

    setIsAiLoading(true);
    setAiProposal("");
    setAiError(null);
    setPromptBlueprint(null);

    try {
      // 1. Build prompt once (SSOT) and pass pre-built to server
      const { system, prompt, staticContext, dynamicContext, tokenEstimate } = await generatePromptData(
        bookId,
        sceneId || null,
        profileId,
        promptTemplateId,
        taskType,
        selectedText,
        instruction,
        originalVersion,
        revisedVersion,
        liveContent
      );

      // Build blueprint with token usage info
      const tokenInfo = tokenEstimate
        ? `\n\n[TOKEN USAGE] ${tokenEstimate.total} / ${tokenEstimate.limit} (${tokenEstimate.usagePercentage.toFixed(0)}%)${tokenEstimate.wasTruncated ? ' [TRUNCATED]' : ''}${tokenEstimate.warning ? `\n⚠️ ${tokenEstimate.warning}` : ''}`
        : '';
      setPromptBlueprint(`[SYSTEM INSTRUCTION]\n${system}\n\n[USER PROMPT]\n${prompt}${tokenInfo}`);

      // 2. Stream with pre-built prompt (eliminates redundant server-side rebuild)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: sceneId || undefined,
          // Pass pre-built prompt to avoid redundant rebuild
          preBuiltPrompt: { system, prompt, staticContext, dynamicContext }
        })
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle rate limit errors (429) with user-friendly message
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 60;
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`);
        }

        throw new Error(errorData.error || `Stream failed with status ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          setAiProposal(accumulatedText);
        }
      }
    } catch (err: any) {
      console.error('AI Stream Hook Error:', err);
      setAiError(err.message || "An unknown error occurred");
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const clearProposal = useCallback(() => {
    setAiProposal("");
    setAiError(null);
    setPromptBlueprint(null);
  }, []);

  return {
    aiProposal,
    isAiLoading,
    aiError,
    promptBlueprint,
    startStream,
    clearProposal
  };
}
