import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function appendChapters() {
  console.log("--- APPENDING PROLOGUE & EPILOGUE TO VOLUME 2 ---");

  try {
    // 1. Find Volume 2 Book
    const targetBookId = 'b7655319-df64-49c2-a275-4853efa773f2'; // Based on previous sync
    const book = await prisma.book.findUnique({
      where: { id: targetBookId }
    });

    if (!book) {
      throw new Error(`Book with ID ${targetBookId} not found.`);
    }

    // 2. Ensure "Famiglia" exists as a character group for the epilogue
    let famigliaChar = await prisma.character.findFirst({
      where: { name: 'Famiglia', bookId: targetBookId }
    });

    if (!famigliaChar) {
      console.log("Creating missing character group: Famiglia");
      famigliaChar = await prisma.character.create({
        data: {
          name: "Famiglia",
          role: "Il nucleo reale",
          description: "La famiglia reale del Calimshan, composta da Lail, Naim, Crystal, Elyanore e Branko, uniti dal sangue e dal peso del potere.",
          bookId: targetBookId
        }
      });
    }

    // Fetch all characters in the book to map them by name
    const characters = await prisma.character.findMany({
      where: { bookId: targetBookId }
    });

    // Helper to find character ID by partial or exact name
    const getCharId = (name: string) => {
      const match = characters.find(c => 
        c.name.toLowerCase() === name.toLowerCase() ||
        c.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(c.name.toLowerCase())
      );
      if (!match) console.warn(`Warning: Character ${name} not found in book.`);
      return match?.id;
    };

    // 3. Define the new chapters
    const newChapters = [
      {
        number: 11, 
        title: "PROLOGO: Il Passo oltre il Velo", 
        goal: "Gunner decide di entrare nella tela per affrontare le conseguenze delle sue scelte.",
        orderIndex: 0, // Set to 0 to place it before Chapter 12
        scenes: [
          { 
            number: 1, 
            title: "L'Addio alle Regine", 
            protagonists: ["Gunner", "Lail", "Crystal", "Naim"], 
            prompt: "Concentrati sull'addio straziante tra Gunner e le sue regine prima che lui varchi il velo. Descrivi la purificazione del varco dimensionale con un tono solenne e carico di tensione emotiva. Ogni personaggio deve reagire in modo coerente col proprio carattere: la freddezza strategica di Lail, la risolutezza di Naim e la connessione empatica di Crystal." 
          }
        ]
      },
      {
        number: 36, 
        title: "EPILOGO: Il Faraone di Ferro", 
        goal: "Mostrare le conseguenze delle azioni di Gunner e preparare il terreno per il viaggio successivo.",
        orderIndex: 99, // Set high to place it at the very end
        scenes: [
          { 
            number: 1, 
            title: "Il Destino dei Traditori", 
            protagonists: ["Gunner", "Famiglia"], 
            prompt: "Gunner impone una punizione esemplare ai nobili traditori del Consiglio di Reggenza. Il tono deve essere freddo, spietato e definitivo. Segue un momento di osservazione in cui Gunner guarda il piccolo Branko. Infine, annuncia con gravità il viaggio imminente verso il 16° Cerchio." 
          }
        ]
      }
    ];

    // 4. Insert Chapters and Scenes
    for (const ch of newChapters) {
      console.log(`Creating Chapter ${ch.number}: ${ch.title}`);
      
      const createdChapter = await prisma.chapter.create({
        data: {
          bookId: targetBookId,
          title: ch.title,
          chapterNumber: ch.number,
          orderIndex: ch.orderIndex,
          chapterGoal: ch.goal
        }
      });

      for (let j = 0; j < ch.scenes.length; j++) {
        const sc = ch.scenes[j];
        console.log(`  - Creating Scene ${sc.number}: ${sc.title}`);
        
        // Map protagonist names to IDs
        const characterIds = sc.protagonists
          .map(name => getCharId(name))
          .filter(id => id !== undefined);

        await prisma.scene.create({
          data: {
            chapterId: createdChapter.id,
            title: sc.title,
            sceneNumber: sc.number,
            orderIndex: j + 1,
            promptGoals: sc.prompt,
            characters: {
              connect: characterIds.map(id => ({ id }))
            }
          }
        });
      }
    }

    console.log("--- APPEND COMPLETED SUCCESSFULLY ---");

  } catch (error) {
    console.error("Error appending chapters:", error);
  } finally {
    await prisma.$disconnect();
  }
}

appendChapters();
