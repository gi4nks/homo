import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const profiles = await prisma.aiProfile.findMany({
      orderBy: [
        { name: 'asc' }
      ]
    });

    let markdown = `# HOMO: AI Personas Export\n`;
    markdown += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    // Since AiProfile doesn't have a strict 'category' field in the current schema, 
    // we will group them by their 'isDefault' status or simply list them alphabetically.
    // For a cleaner look, we'll use a generic header.
    
    markdown += `## 🎭 Available Personas\n\n`;

    for (const profile of profiles) {
      markdown += `### Persona: ${profile.name}${profile.isDefault ? ' (SYSTEM DEFAULT)' : ''}\n`;
      markdown += `**Description:** ${profile.description || 'No description provided.'}\n\n`;
      
      markdown += `**System Overlay Prompt:**\n`;
      markdown += `\`\`\`text\n${profile.systemPrompt}\n\`\`\`\n\n`;
      
      markdown += `---\n\n`;
    }

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="homo_personas_export.md"'
      }
    });
  } catch (error) {
    console.error('Persona Export error:', error);
    return NextResponse.json({ error: 'Failed to export personas' }, { status: 500 });
  }
}
