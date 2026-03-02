'use client';

import { useState, useCallback } from 'react';

export function useAiStream() {
  const [aiProposal, setAiProposal] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const startStream = useCallback(async (sceneId: string) => {
    if (!sceneId) return;
    
    setIsAiLoading(true);
    setAiProposal("");
    setAiError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId })
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
  }, []);

  return {
    aiProposal,
    isAiLoading,
    aiError,
    startStream,
    clearProposal
  };
}
