#!/usr/bin/env tsx

/**
 * Migration Script: Sanitize Existing HTML Content
 *
 * This script sanitizes all existing Scene.content in the database
 * to remove potentially malicious HTML and ensure data integrity.
 *
 * IMPORTANT: Run backup before executing this migration!
 *   npm run backup
 *   tsx scripts/migrate-sanitize-html.ts
 */

import { PrismaClient } from '@prisma/client';
import { sanitizeHtml, calculateWordCount, validateHtml } from '../src/lib/html-sanitizer';

const prisma = new PrismaClient();

interface MigrationStats {
  totalScenes: number;
  sanitized: number;
  unchanged: number;
  errors: number;
  warnings: number;
}

async function main() {
  console.log('🔄 Starting HTML Sanitization Migration...\n');

  // Verify backup exists
  console.log('⚠️  IMPORTANT: Ensure you have created a backup before proceeding!');
  console.log('   Run: npm run backup\n');

  // Fetch all scenes
  console.log('📊 Fetching all scenes from database...');
  const scenes = await prisma.scene.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      wordCount: true,
      chapter: {
        select: {
          id: true,
          bookId: true
        }
      }
    }
  });

  console.log(`✅ Found ${scenes.length} scenes to process\n`);

  const stats: MigrationStats = {
    totalScenes: scenes.length,
    sanitized: 0,
    unchanged: 0,
    errors: 0,
    warnings: 0
  };

  // Process each scene
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const progress = `[${i + 1}/${scenes.length}]`;

    try {
      // Skip if content is empty
      if (!scene.content) {
        console.log(`${progress} ⏭️  Skipping scene "${scene.title}" (empty content)`);
        stats.unchanged++;
        continue;
      }

      // Validate original content
      const validation = validateHtml(scene.content);

      // Sanitize content
      const sanitized = sanitizeHtml(scene.content);
      const newWordCount = calculateWordCount(sanitized);

      // Check if content was modified
      const wasModified = sanitized !== scene.content;
      const wordCountChanged = newWordCount !== scene.wordCount;

      if (wasModified || wordCountChanged) {
        // Update database
        await prisma.scene.update({
          where: { id: scene.id },
          data: {
            content: sanitized,
            wordCount: newWordCount
          }
        });

        stats.sanitized++;

        if (validation.errors.length > 0) {
          console.log(`${progress} 🔒 SANITIZED scene "${scene.title}"`);
          console.log(`         Errors removed: ${validation.errors.join(', ')}`);
          stats.errors += validation.errors.length;
        } else if (validation.warnings.length > 0) {
          console.log(`${progress} ⚠️  Updated scene "${scene.title}"`);
          console.log(`         Warnings: ${validation.warnings.join(', ')}`);
          stats.warnings += validation.warnings.length;
        } else if (wordCountChanged) {
          console.log(`${progress} 📝 Updated word count for "${scene.title}" (${scene.wordCount} → ${newWordCount})`);
        }
      } else {
        stats.unchanged++;
        if ((i + 1) % 10 === 0) {
          console.log(`${progress} ✅ Processed ${i + 1} scenes...`);
        }
      }
    } catch (error) {
      console.error(`${progress} ❌ Error processing scene "${scene.title}":`, error);
      stats.errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Scenes:        ${stats.totalScenes}`);
  console.log(`Sanitized:           ${stats.sanitized}`);
  console.log(`Unchanged:           ${stats.unchanged}`);
  console.log(`Security Issues:     ${stats.errors}`);
  console.log(`Warnings:            ${stats.warnings}`);
  console.log('='.repeat(60));

  if (stats.sanitized > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('   All HTML content has been sanitized and word counts updated.');
  } else {
    console.log('\n✅ No changes needed - all content was already clean!');
  }

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
