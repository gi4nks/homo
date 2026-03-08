#!/usr/bin/env npx tsx

/**
 * Test Word Count Middleware
 *
 * Verifies that Prisma middleware automatically calculates
 * word count when Scene.content is created or updated
 */

import { PrismaClient } from '@prisma/client';
import prisma from '../src/lib/prisma';

async function main() {
  console.log('🧪 Testing Word Count Middleware\n');

  // Create a test book
  console.log('1️⃣  Creating test book...');
  const testBook = await prisma.book.create({
    data: {
      title: '[TEST] Word Count Test - DELETE ME',
      genre: 'Test',
      synopsis: 'Testing word count middleware'
    }
  });
  console.log(`   ✅ Created test book: ${testBook.id}`);

  // Create a test chapter
  console.log('2️⃣  Creating test chapter...');
  const testChapter = await prisma.chapter.create({
    data: {
      title: '[TEST] Chapter 1',
      bookId: testBook.id,
      orderIndex: 1,
      chapterNumber: 1
    }
  });
  console.log(`   ✅ Created test chapter: ${testChapter.id}`);

  // Test 1: Create scene with content (middleware should auto-calculate word count)
  console.log('3️⃣  Creating scene with content (without explicit wordCount)...');
  const testContent1 = '<p>This is a test scene with exactly ten words here.</p>';
  const expectedWordCount1 = 10;

  const testScene = await prisma.scene.create({
    data: {
      title: '[TEST] Scene with Auto Word Count',
      chapterId: testChapter.id,
      orderIndex: 1,
      sceneNumber: 1,
      content: testContent1
      // NOTE: Not setting wordCount explicitly - middleware should handle it
    }
  });

  console.log(`   Content: "${testContent1.replace(/<[^>]*>/g, '')}"`);
  console.log(`   Expected word count: ${expectedWordCount1}`);
  console.log(`   Actual word count: ${testScene.wordCount}`);

  if (testScene.wordCount === expectedWordCount1) {
    console.log(`   ✅ MIDDLEWARE WORKS! Word count auto-calculated on create`);
  } else {
    console.error(`   ❌ FAILED! Expected ${expectedWordCount1}, got ${testScene.wordCount}`);
    throw new Error('Middleware failed on create');
  }

  // Test 2: Update scene content (middleware should re-calculate word count)
  console.log('\n4️⃣  Updating scene with new content...');
  const testContent2 = '<p>Updated content with a completely different number of words in this sentence.</p>';
  const expectedWordCount2 = 12;

  const updatedScene = await prisma.scene.update({
    where: { id: testScene.id },
    data: {
      content: testContent2
      // NOTE: Not setting wordCount explicitly
    }
  });

  console.log(`   Content: "${testContent2.replace(/<[^>]*>/g, '')}"`);
  console.log(`   Expected word count: ${expectedWordCount2}`);
  console.log(`   Actual word count: ${updatedScene.wordCount}`);

  if (updatedScene.wordCount === expectedWordCount2) {
    console.log(`   ✅ MIDDLEWARE WORKS! Word count auto-calculated on update`);
  } else {
    console.error(`   ❌ FAILED! Expected ${expectedWordCount2}, got ${updatedScene.wordCount}`);
    throw new Error('Middleware failed on update');
  }

  // Test 3: Update other fields (wordCount should remain unchanged)
  console.log('\n5️⃣  Updating scene title only (wordCount should stay same)...');
  const sceneBeforeUpdate = await prisma.scene.findUnique({
    where: { id: testScene.id }
  });

  const updatedSceneTitle = await prisma.scene.update({
    where: { id: testScene.id },
    data: {
      title: '[TEST] Updated Title'
    }
  });

  if (updatedSceneTitle.wordCount === sceneBeforeUpdate?.wordCount) {
    console.log(`   ✅ Word count unchanged when content not modified`);
  } else {
    console.error(`   ❌ FAILED! Word count changed unexpectedly`);
    throw new Error('Middleware incorrectly modified wordCount');
  }

  // Cleanup
  console.log('\n6️⃣  Cleaning up test data...');
  await prisma.book.delete({
    where: { id: testBook.id }
  });
  console.log(`   ✅ Test data deleted`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL TESTS PASSED: Word count middleware works correctly!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Prisma middleware automatically calculates word count:');
  console.log('  ✅ On scene create with content');
  console.log('  ✅ On scene update with new content');
  console.log('  ✅ Unchanged when content not modified');
  console.log('');

  await prisma.$disconnect();
}

main()
  .catch(async (error) => {
    console.error('\n❌ Test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
