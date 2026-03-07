/**
 * HOMO TEMPLATE ENGINE
 * Handles variable interpolation for dynamic prompts.
 */

export function compileTemplate(templateString: string, data: Record<string, any>): string {
  if (!templateString) return "";

  return templateString.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    const value = data[variableName];
    
    // Return N/A or empty string if variable is missing/null/undefined
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }
    
    return String(value);
  });
}
