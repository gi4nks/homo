'use client';

import React, { useRef, useEffect, useState } from 'react';

const VALID_VARS = [
  'bookStyle', 
  'styleReference', 
  'authorialIntent', 
  'loreConstraints', 
  'existingLoreConstraints', 
  'narrativePosition', 
  'aiPersonaPrompt', 
  'pacingConstraints', 
  'bookSynopsis', 
  'sceneGoal', 
  'sceneCast', 
  'sceneText',
  'previousSceneGoal', 
  'previousContent', 
  'taskType', 
  'taskGoal', 
  'taskInstruction', 
  'finalConstraint',
  'originalVersion',
  'revisedVersion'
];

interface HighlightedPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export default function HighlightedPromptEditor({
  value,
  onChange,
  placeholder,
  className = "",
  minHeight = "150px"
}: HighlightedPromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Synchronize scrolling between textarea and backdrop
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlightContent = (text: string) => {
    if (!text) return "";

    // Replace HTML special characters to prevent injection/rendering issues in the backdrop
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Regex to find {{variable}}
    return escaped.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const isValid = VALID_VARS.includes(varName.trim());
      if (isValid) {
        return `<span class="text-blue-600 font-black bg-blue-500/10 px-1 rounded ring-1 ring-blue-500/20">${match}</span>`;
      } else {
        return `<span class="text-red-600 font-black bg-red-500/10 px-1 rounded ring-1 ring-red-500/30 underline decoration-wavy decoration-red-500/50">${match}</span>`;
      }
    });
  };

  return (
    <div className={`relative font-mono text-[11px] leading-relaxed group ${className}`} style={{ minHeight }}>
      {/* THE BACKDROP (Where highlighting happens) */}
      <div
        ref={backdropRef}
        className="absolute inset-0 p-4 whitespace-pre-wrap break-words pointer-events-none overflow-hidden border border-transparent"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlightContent(value) + "\n" }}
      />

      {/* THE ACTUAL TEXTAREA (Caret and Input) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-primary resize-none outline-none border border-base-300 rounded-xl focus:border-primary transition-colors custom-scrollbar z-10"
        style={{ color: 'transparent', WebkitTextFillColor: 'transparent' }}
      />
      
      {/* INITIAL STYLE FALLBACK (When focused or hovered) */}
      <div className="absolute top-2 right-2 opacity-0 group-focus-within:opacity-40 group-hover:opacity-40 transition-opacity pointer-events-none z-20">
        <span className="text-[8px] font-black uppercase tracking-tighter bg-base-300 px-1.5 py-0.5 rounded">Prompt Editor</span>
      </div>
    </div>
  );
}
