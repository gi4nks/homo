'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function seedVolume2() {
  try {
    console.log("--- STARTING MEGA-SEED: VOLUME 2 ---");

    // 1. CREATE THE BOOK
    const book = await prisma.book.create({
      data: {
        title: "Volume 2: Il Peso dell'Equilibrio",
        genre: "Epic Dark Fantasy",
        tone: "Grave, Materico, Epico",
        synopsis: "Gunner attraversa i piani elementali per stabilizzare la Brace, mentre il regno del Calimshan scivola nel caos climatico e politico sotto l'ombra di Set.",
        status: "Drafting"
      }
    });

    const bookId = book.id;

    // 2. DEFINE MASTER CHARACTERS
    const characterData = [
      { name: "Gunner", role: "Protagonista / Mago", description: "Il Faraone e fulcro del sistema elementale. Segnato dai viaggi planari." },
      { name: "Lail", role: "Regina Reggente", description: "Moglie di Gunner, stratega fredda che maschera un terrore profondo per la sua famiglia." },
      { name: "Naim", role: "Generale / Regina", description: "Comandante militare pragmatica e risoluta, fedele all'ordine del regno." },
      { name: "Crystal", role: "Figlia / Sensitiva", description: "Legata alla Brace, percepisce lo stato d'animo del padre attraverso le dimensioni." },
      { name: "Elyanore", role: "Figlia", description: "Colpita da febbri magiche legate all'instabilità elementale." },
      { name: "Branko", role: "Figlio", description: "Tormentato da incubi profetici inviati dal culto di Set." },
      { name: "Ignis-Pyra", role: "Principessa del Magma", description: "Gigantessa di roccia fusa. La sua pelle trasuda lava e dolore costante." },
      { name: "Veridiana", role: "Driade Millenaria", description: "Le sue radici formano il sistema nervoso del piano della Radice." },
      { name: "Aethelra", role: "Entità del Vuoto", description: "Essere di puro spazio negativo avvolto in nebulose cangianti." },
      { name: "Thalassa", role: "Creatura delle Profondità", description: "Entità d'acqua che riflette i rimpianti sommersi di chi la osserva." },
      { name: "Astra-Vult", role: "Fulmine Senziente", description: "Energia elettrica racchiusa in una corazza di bronzo antico." },
      { name: "Krystallia", role: "Principessa Geometrica", description: "Essere di luce rifratta e spigoli perfetti. Comunica per risonanze." },
      { name: "Ashen-Ra", role: "Spirito della Cenere", description: "Fumo e rimpianto che danza tra rovine eterne." },
      { name: "Kryos", role: "Signore del Gelo", description: "Figura statuaria di ghiaccio azzurro che congela il tempo." },
      { name: "Khrone", role: "Principessa della Sabbia", description: "Composta da polvere dorata e clessidre infrante." },
      { name: "Lux-Anima", role: "Luce Primordiale", description: "Sole in miniatura con fattezze angeliche accecanti." },
      { name: "Zephyra", role: "Spirito del Vento", description: "Entità inafferrabile fatta di correnti d'aria ad alta quota." },
      { name: "Umbra-Nix", role: "Riflesso Oscuro", description: "L'ombra speculare di Gunner, nata dal suo stesso ego." }
    ];

    const characterMap: Record<string, string> = {};

    for (const char of characterData) {
      const createdChar = await prisma.character.create({
        data: { ...char, bookId }
      });
      characterMap[char.name] = createdChar.id;
    }

    // 3. CHAPTERS & SCENES DEFINITION (Sample from the prompt request)
    const structure = [
      {
        num: 12, title: "La Fornace del Cuore", goal: "Gunner entra nel dominio del Magma e accetta il dolore come valuta.",
        scenes: [
          { num: 1, title: "L'Incontro con la Fiamma", protagonists: ["Gunner", "Ignis-Pyra"], prompt: "Descrivi il calore insopportabile del piano del Magma. Ignis-Pyra deve apparire come una figura tragica. Focus sul contrasto tra la carne di Gunner e la roccia fusa." },
          { num: 2, title: "L'Enigma della Resistenza", protagonists: ["Gunner"], prompt: "Gunner affronta l'Enigma Cosmico. Focus sulla filosofia del dolore: resistere significa consumarsi." },
          { num: 3, title: "Il Prezzo della Carne", protagonists: ["Gunner"], prompt: "Apparizione della cicatrice elementale. Rivelazione: il potere richiede un bilanciamento fisico devastante." }
        ]
      },
      {
        num: 13, title: "Sabbia Nera e Febbre", goal: "Deterioramento del regno e ascesa politica di Lail.",
        scenes: [
          { num: 1, title: "Il Battito Lontano", protagonists: ["Crystal", "Elyanore"], prompt: "Elyanore è delirante. Crystal percepisce Gunner attraverso la Brace. Atmosfera claustrofobica." },
          { num: 2, title: "Le Ombre della Capitale", protagonists: ["Lail", "Naim"], prompt: "Sabbia nera nei pozzi. Lail adotta una maschera di freddezza strategica per gestire la crisi." }
        ]
      },
      {
        num: 14, title: "Le Radici del Potere", goal: "Gunner nel piano della Radice. Comprensione della responsabilità.",
        scenes: [
          { num: 1, title: "L'Anima del Bosco", protagonists: ["Gunner", "Veridiana"], prompt: "Incontro con Veridiana. Le sue radici sono il sistema nervoso del piano. Focus sulla maestosità antica." },
          { num: 2, title: "Prova della Fondamenta", protagonists: ["Gunner"], prompt: "Risoluzione dell'enigma sulla stabilità. Gunner deve dimostrare la solidità delle sue intenzioni." },
          { num: 3, title: "Invecchiamento Soggettivo", protagonists: ["Gunner"], prompt: "Gunner comprende che l'equilibrio è tensione. Invecchia visibilmente nel piano mentre il tempo fuori scorre diversamente." }
        ]
      }
      // ... QUI AGGIUNGEREMMO TUTTI GLI ALTRI 20 CAPITOLI ...
    ];

    // 4. EXECUTE INSERTION
    for (let i = 0; i < structure.length; i++) {
      const ch = structure[i];
      const createdChapter = await prisma.chapter.create({
        data: {
          bookId,
          title: ch.title,
          chapterNumber: ch.num,
          orderIndex: i + 1,
          chapterGoal: ch.goal
        }
      });

      for (let j = 0; j < ch.scenes.length; j++) {
        const sc = ch.scenes[j];
        await prisma.scene.create({
          data: {
            chapterId: createdChapter.id,
            title: sc.title,
            sceneNumber: sc.num,
            orderIndex: j + 1,
            promptGoals: sc.prompt,
            characters: {
              connect: sc.protagonists.map(p => ({ id: characterMap[p] })).filter(p => p.id)
            }
          }
        });
      }
    }

    console.log("--- SEED COMPLETED SUCCESSFULLY ---");
    revalidatePath('/');
    return { success: true, bookId };

  } catch (error) {
    console.error("SEED ERROR:", error);
    return { success: false, error: String(error) };
  }
}
