import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncDescriptions() {
  const sourceBookId = 'ae2f1ce9-9335-42fa-93bc-ae4dbf3a7dad';
  const targetBookId = 'b7655319-df64-49c2-a275-4853efa773f2';

  console.log(`--- REFINED DESCRIPTION SYNC ---`);

  try {
    const sourceChars = await prisma.character.findMany({ where: { bookId: sourceBookId } });
    const targetChars = await prisma.character.findMany({ where: { bookId: targetBookId } });

    for (const targetChar of targetChars) {
      // Find a match in source by exact name OR partial match (e.g., "Gunner" matches "Gunner (Gathor...)")
      const sourceMatch = sourceChars.find(s => 
        s.name.toLowerCase() === targetChar.name.toLowerCase() ||
        s.name.toLowerCase().includes(targetChar.name.toLowerCase()) ||
        targetChar.name.toLowerCase().includes(s.name.toLowerCase())
      );

      if (sourceMatch) {
        console.log(`Updating description for [${targetChar.name}] using data from [${sourceMatch.name}]`);
        await prisma.character.update({
          where: { id: targetChar.id },
          data: {
            description: sourceMatch.description,
            role: sourceMatch.role // Sync role too for completeness
          }
        });
      }
    }

    console.log("--- DESCRIPTION SYNC COMPLETED ---");
  } catch (error) {
    console.error("Sync Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDescriptions();
