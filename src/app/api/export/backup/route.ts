import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [
      books,
      chapters,
      scenes,
      characters,
      aiProfiles,
      promptTemplates,
      genreConfigs,
      appSettings
    ] = await Promise.all([
      prisma.book.findMany(),
      prisma.chapter.findMany(),
      prisma.scene.findMany(),
      prisma.character.findMany(),
      prisma.aiProfile.findMany(),
      prisma.promptTemplate.findMany(),
      prisma.genreConfig.findMany(),
      prisma.appSettings.findMany(),
    ]);

    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: {
        books,
        chapters,
        scenes,
        characters,
        aiProfiles,
        promptTemplates,
        genreConfigs,
        appSettings
      }
    };

    const fileName = `homo_full_backup_${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
}
