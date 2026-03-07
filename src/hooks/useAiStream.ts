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
    sceneId: string, 
    profileId?: string, 
    promptTemplateId?: string,
    instruction?: string
  ) => {
    if (!sceneId || !bookId) return;
    
    setIsAiLoading(true);
    setAiProposal("");
    setAiError(null);
    setPromptBlueprint(null);

    try {
      // 1. Fetch the blueprint first for transparency (NOW WITH PERSONA, TEMPLATE & INSTRUCTION)
      const { system, prompt } = await generatePromptData(
        bookId, 
        sceneId, 
        profileId, 
        promptTemplateId,
        'DRAFT',
        undefined,
        instruction
      );
      setPromptBlueprint(`[SYSTEM INSTRUCTION]\n${system}\n\n[USER PROMPT]\n${prompt}`);

      // 2. Start the actual stream with optional profileId, promptTemplateId and instruction
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, profileId, promptTemplateId, instruction })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
