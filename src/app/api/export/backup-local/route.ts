import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST() {
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
      type: "LOCAL_SAVE",
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

    const backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const fileName = `homo_local_backup_${timestamp}.json`;
    const filePath = path.join(backupDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: `Backup physically saved to disk.`,
      path: filePath,
      fileName: fileName
    });
  } catch (error) {
    console.error('Local backup save error:', error);
    return NextResponse.json({ error: 'Failed to write backup to disk' }, { status: 500 });
  }
}
