import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncCharacters() {
  const sourceBookId = 'ae2f1ce9-9335-42fa-93bc-ae4dbf3a7dad';
  const targetBookId = 'b7655319-df64-49c2-a275-4853efa773f2';

  console.log(`--- SYNCING CHARACTERS FROM ${sourceBookId} TO ${targetBookId} ---`);

  try {
    // 1. Fetch source characters
    const sourceCharacters = await prisma.character.findMany({
      where: { bookId: sourceBookId }
    });

    // 2. Fetch target characters
    const targetCharacters = await prisma.character.findMany({
      where: { bookId: targetBookId }
    });

    console.log(`Found ${sourceCharacters.length} characters in source book.`);

    for (const sourceChar of sourceCharacters) {
      const existingTargetChar = targetCharacters.find(
        c => c.name.toLowerCase() === sourceChar.name.toLowerCase()
      );

      if (existingTargetChar) {
        // UPDATE existing character
        console.log(`Updating character: ${sourceChar.name}`);
        await prisma.character.update({
          where: { id: existingTargetChar.id },
          data: {
            role: sourceChar.role,
            description: sourceChar.description
          }
        });
      } else {
        // CREATE new character in target book
        console.log(`Creating missing character: ${sourceChar.name}`);
        await prisma.character.create({
          data: {
            name: sourceChar.name,
            role: sourceChar.role,
            description: sourceChar.description,
            bookId: targetBookId
          }
        });
      }
    }

    console.log("--- CHARACTER SYNC COMPLETED ---");
  } catch (error) {
    console.error("Sync Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncCharacters();
