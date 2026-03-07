import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.promptTemplate.findMany({
      orderBy: [
        { phase: 'asc' },
        { name: 'asc' }
      ]
    });

    let markdown = `# HOMO: AI Prompt CMS Export\n`;
    markdown += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    // Group by Phase
    const phases = Array.from(new Set(templates.map(t => t.phase)));

    for (const phase of phases) {
      markdown += `## 🌍 ${phase}\n\n`;
      
      const phaseTemplates = templates.filter(t => t.phase === phase);
      
      for (const template of phaseTemplates) {
        markdown += `### ${template.name}${template.isDefault ? ' (DEFAULT)' : ''}\n`;
        markdown += `**Description:** ${template.description || 'No description provided.'}\n\n`;
        
        markdown += `**System Core Instruction:**\n`;
        markdown += `\`\`\`text\n${template.systemInstruction}\n\`\`\`\n\n`;
        
        markdown += `**Contextual Structure (XML):**\n`;
        markdown += `\`\`\`xml\n${template.contextTemplate}\n\`\`\`\n\n`;
        
        markdown += `**Task Directive:**\n`;
        markdown += `\`\`\`text\n${template.taskDirective}\n\`\`\`\n\n`;
        
        markdown += `---\n\n`;
      }
    }

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="homo_prompts_export.md"'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export templates' }, { status: 500 });
  }
}
