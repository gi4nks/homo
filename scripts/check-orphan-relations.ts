#!/usr/bin/env npx tsx

/**
 * Check for Orphan Character Relations
 *
 * Verifies integrity of Character <-> Scene many-to-many relationships
 * and identifies any orphan records in the junction table
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for orphan character-scene relations...\n');

  // Get all characters
  const characters = await prisma.character.findMany({
    select: { id: true, name: true, bookId: true }
  });

  console.log(`📊 Found ${characters.length} characters in database`);

  // Get all scenes with their character relations
  const scenes = await prisma.scene.findMany({
    select: {
      id: true,
      title: true,
      characters: {
        select: { id: true, name: true }
      }
    }
  });

  console.log(`📊 Found ${scenes.length} scenes in database\n`);

  // Check for orphan relations
  const orphanRelations: Array<{
    sceneId: string;
    sceneTitle: string;
    characterId: string;
  }> = [];

  const validCharacterIds = new Set(characters.map(c => c.id));

  for (const scene of scenes) {
    for (const character of scene.characters) {
      if (!validCharacterIds.has(character.id)) {
        orphanRelations.push({
          sceneId: scene.id,
          sceneTitle: scene.title,
          characterId: character.id
        });
      }
    }
  }

  // Results
  console.log('='.repeat(60));
  console.log('📊 ORPHAN RELATIONS CHECK RESULTS');
  console.log('='.repeat(60));

  if (orphanRelations.length === 0) {
    console.log('✅ No orphan relations found!');
    console.log('   All character-scene relations are valid.');
  } else {
    console.log(`❌ Found ${orphanRelations.length} orphan relations:`);
    console.log('');
    orphanRelations.forEach((orphan, i) => {
      console.log(`  ${i + 1}. Scene "${orphan.sceneTitle}" (${orphan.sceneId})`);
      console.log(`     → References deleted character: ${orphan.characterId}`);
    });
    console.log('');
    console.log('⚠️  These relations should be cleaned up.');
  }

  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
