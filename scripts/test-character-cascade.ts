#!/usr/bin/env npx tsx

/**
 * Test Character Cascade Delete Behavior
 *
 * Verifies that deleting a Character properly removes
 * all many-to-many relations with Scenes
 *
 * This is a SAFE test that creates temporary data and cleans up after itself
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Character Cascade Delete Behavior\n');

  // Create a test book
  console.log('1️⃣  Creating test book...');
  const testBook = await prisma.book.create({
    data: {
      title: '[TEST] Cascade Test Book - DELETE ME',
      genre: 'Test',
      synopsis: 'Temporary book for testing cascades'
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

  // Create a test scene
  console.log('3️⃣  Creating test scene...');
  const testScene = await prisma.scene.create({
    data: {
      title: '[TEST] Scene 1',
      chapterId: testChapter.id,
      orderIndex: 1,
      sceneNumber: 1,
      content: '<p>Test content</p>'
    }
  });
  console.log(`   ✅ Created test scene: ${testScene.id}`);

  // Create a test character
  console.log('4️⃣  Creating test character...');
  const testCharacter = await prisma.character.create({
    data: {
      name: '[TEST] Hero',
      bookId: testBook.id,
      role: 'Protagonist',
      description: 'Test character'
    }
  });
  console.log(`   ✅ Created test character: ${testCharacter.id}`);

  // Connect character to scene
  console.log('5️⃣  Connecting character to scene...');
  await prisma.scene.update({
    where: { id: testScene.id },
    data: {
      characters: {
        connect: { id: testCharacter.id }
      }
    }
  });
  console.log(`   ✅ Connected character to scene`);

  // Verify connection
  const sceneWithCharacters = await prisma.scene.findUnique({
    where: { id: testScene.id },
    include: { characters: true }
  });

  console.log(`6️⃣  Verifying connection...`);
  if (sceneWithCharacters?.characters.length === 1) {
    console.log(`   ✅ Scene has 1 character connected`);
  } else {
    throw new Error('Character connection failed!');
  }

  // Delete the character
  console.log('7️⃣  Deleting character...');
  await prisma.character.delete({
    where: { id: testCharacter.id }
  });
  console.log(`   ✅ Character deleted`);

  // Verify cascade: scene should now have 0 characters
  const sceneAfterDelete = await prisma.scene.findUnique({
    where: { id: testScene.id },
    include: { characters: true }
  });

  console.log(`8️⃣  Verifying cascade delete...`);
  if (sceneAfterDelete?.characters.length === 0) {
    console.log(`   ✅ CASCADE WORKS! Scene now has 0 characters`);
    console.log(`   ✅ Many-to-many relation was automatically cleaned up`);
  } else {
    console.error(`   ❌ CASCADE FAILED! Scene still has ${sceneAfterDelete?.characters.length} characters`);
    throw new Error('Cascade delete did not work!');
  }

  // Cleanup: delete test book (will cascade to chapter and scene)
  console.log('9️⃣  Cleaning up test data...');
  await prisma.book.delete({
    where: { id: testBook.id }
  });
  console.log(`   ✅ Test book and all related data deleted`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST PASSED: Character cascade delete works correctly!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Prisma automatically handles many-to-many cascade deletes.');
  console.log('No schema changes or migrations needed.');
  console.log('');

  await prisma.$disconnect();
}

main()
  .catch(async (error) => {
    console.error('\n❌ Test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
