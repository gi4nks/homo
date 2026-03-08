/**
 * HTML Sanitization Utilities
 *
 * Provides server-side HTML sanitization for TipTap content
 * to prevent XSS attacks and ensure data integrity
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Allowed HTML tags for TipTap content
 * Based on TipTap StarterKit extensions
 */
const ALLOWED_TAGS = [
  // Block elements
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code',

  // Lists
  'ul', 'ol', 'li',

  // Inline formatting
  'strong', 'em', 'u', 's', 'mark',
  'a', 'br',

  // Code blocks
  'code',

  // Line breaks
  'hr'
];

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTR = [
  'href',      // for links
  'target',    // for links (e.g., _blank)
  'rel',       // for links (e.g., noopener noreferrer)
  'class',     // for styling (though TipTap uses minimal classes)
  'data-*'     // for custom data attributes (if needed)
];

/**
 * DOMPurify configuration for TipTap content
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,  // Disable data-* attributes by default for security
  KEEP_CONTENT: true,      // Keep text content even if tags are removed
  RETURN_DOM: false,       // Return HTML string, not DOM
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,

  // Security settings
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],

  // Additional protections
  ALLOW_ARIA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true
};

/**
 * Sanitize HTML content from TipTap editor
 *
 * Removes dangerous tags, attributes, and scripts while preserving
 * valid formatting from TipTap StarterKit
 *
 * @param html - Raw HTML content from TipTap
 * @returns Sanitized HTML safe for storage and rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Sanitize with DOMPurify
  const sanitized = DOMPurify.sanitize(html, SANITIZE_CONFIG);

  // Additional validation: check for empty or whitespace-only content
  const textContent = sanitized.replace(/<[^>]*>/g, '').trim();
  if (!textContent && sanitized.trim()) {
    // If sanitized HTML has tags but no text content, it might be malicious
    console.warn('[HTML Sanitizer] Content contains only tags without text, returning empty');
    return '';
  }

  return sanitized;
}

/**
 * Validate HTML structure (basic check)
 *
 * Returns validation result with potential issues
 */
export function validateHtml(html: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for script tags (should never pass sanitization)
  if (/<script[^>]*>/i.test(html)) {
    errors.push('Script tags detected');
  }

  // Check for event handlers
  if (/on\w+\s*=/i.test(html)) {
    errors.push('Event handlers detected');
  }

  // Check for inline styles (warning only, as they're not dangerous but not ideal)
  if (/style\s*=/i.test(html)) {
    warnings.push('Inline styles detected');
  }

  // Check for iframe/embed
  if (/<(iframe|embed|object)[^>]*>/i.test(html)) {
    errors.push('Embedded content detected');
  }

  // Check for data URIs in src/href
  if (/(?:src|href)\s*=\s*["']data:/i.test(html)) {
    warnings.push('Data URI detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate word count from HTML content
 * (Helper function for Scene word count calculation)
 */
export function calculateWordCount(html: string): number {
  if (!html) return 0;

  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');

  // Normalize whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) return 0;

  // Split by whitespace and count
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Sanitize and validate HTML in one call
 *
 * Returns sanitized HTML and validation results
 */
export function sanitizeAndValidate(html: string): {
  sanitized: string;
  original: string;
  wasModified: boolean;
  validation: ReturnType<typeof validateHtml>;
} {
  const original = html;
  const sanitized = sanitizeHtml(html);
  const validation = validateHtml(original);

  return {
    sanitized,
    original,
    wasModified: sanitized !== original,
    validation
  };
}
