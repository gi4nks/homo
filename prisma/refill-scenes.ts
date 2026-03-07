import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function refillScenes() {
  const bookId = 'b7655319-df64-49c2-a275-4853efa773f2';
  console.log(`--- RECONSTRUCTING SCENES FOR BOOK: ${bookId} ---`);

  try {
    // 1. Get all characters for this book to map them
    const existingChars = await prisma.character.findMany({ where: { bookId } });
    const getCharId = async (name: string) => {
      let char = existingChars.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!char) {
        // Create if missing
        char = await prisma.character.create({
          data: { name, bookId, role: "Character", description: "Automatically created during scene refill." }
        });
        existingChars.push(char);
      }
      return char.id;
    };

    const data = [
      {
        num: 11, title: "PROLOGO: Il Passo oltre il Velo", goal: "Gunner decide di entrare nella tela per sigillare il varco di Set.",
        scenes: [
          { num: 1, title: "L'Addio alle Regine", protagonists: ["Gunner", "Lail", "Crystal", "Naim"], prompt: "Purificazione del varco e addio straziante. Focus sull'intensità emotiva del distacco e sul peso del dovere." }
        ]
      },
      {
        num: 12, title: "Il Cuore della Fornace", goal: "Livello 1: Dominio del Magma. Prova della resistenza interiore.",
        scenes: [
          { num: 1, title: "Incontro con Pyrilla", protagonists: ["Gunner", "Pyrilla"], prompt: "Incontro con la Principessa di Roccia Fusa. Descrivi la pelle che trasuda dolore liquido e l'atmosfera soffocante del magma." },
          { num: 2, title: "L'Enigma Cosmico", protagonists: ["Gunner"], prompt: "Risoluzione dell'enigma sulla natura della resistenza. Gunner deve dimostrare la sua tempra mentale." },
          { num: 3, title: "Il Prezzo del Fuoco", protagonists: ["Gunner"], prompt: "Apparizione della cicatrice elementale. Rivelazione filosofica: il legame è bilanciamento." }
        ]
      },
      {
        num: 13, title: "Sabbia e Febbre", goal: "Stato del regno durante il Livello 1. Distorsione temporale.",
        scenes: [
          { num: 1, title: "Il Battito del Legame", protagonists: ["Crystal", "Elyanore"], prompt: "Elyanore colpita da febbri magiche. Crystal percepisce il legame pulsante con Gunner attraverso la Brace." },
          { num: 2, title: "La Corruzione dell'Acqua", protagonists: ["Lail", "Naim"], prompt: "Sabbia nera nei pozzi della capitale. Lail adotta una strategia fredda per contenere il panico della popolazione." },
          { num: 3, title: "Un Mese di Silenzio", protagonists: ["Popolo del Calimshan"], prompt: "Il tempo accelera nel mondo reale. Gli abitanti scoprono che è passato un mese intero in un istante." }
        ]
      },
      {
        num: 14, title: "Le Radici del Mondo", goal: "Livello 2: Dominio della Radice. Prova della responsabilità.",
        scenes: [
          { num: 1, title: "Incontro con Aethelgard", protagonists: ["Gunner", "Aethelgard"], prompt: "Incontro con la Principessa dei rampicanti. Un'entità vegetale che avvolge il tempo e lo spazio del piano." },
          { num: 2, title: "Le Fondamenta Morali", protagonists: ["Gunner"], prompt: "Risoluzione di un enigma sulla stabilità della propria anima e delle proprie responsabilità verso il regno." },
          { num: 3, title: "Tensione Controllata", protagonists: ["Gunner"], prompt: "Gunner invecchia soggettivamente. La rivelazione che l'equilibrio richiede una tensione costante." }
        ]
      },
      {
        num: 15, title: "Sogni di Scaglie", goal: "Deterioramento psichico del regno e militarizzazione.",
        scenes: [
          { num: 1, title: "Incubi di Branko", protagonists: ["Lail", "Branko"], prompt: "Branko tormentato da sogni di serpenti. Lail teme che il figlio stia perdendo la ragione." },
          { num: 2, title: "Il Silenzio della Reliquia", protagonists: ["Naim", "Crystal"], prompt: "La Brace tace. Naim trasforma il palazzo in una fortezza contro le minacce occulte." }
        ]
      },
      {
        num: 16, title: "L'Abisso di Nihila", goal: "Livello 3: Vuoto Astrale. Sacrificio del fulcro.",
        scenes: [
          { num: 1, title: "La Principessa del Nulla", protagonists: ["Gunner", "Nihila"], prompt: "Incontro con Nihila nel Vuoto Astrale. Spazio negativo e nebulose cangianti. Silenzio assoluto." },
          { num: 2, title: "Difesa del Vuoto", protagonists: ["Gunner"], prompt: "Gunner combatte contro entità esterne che tentano di divorare la stabilità del piano astrale." },
          { num: 3, title: "Il Martirio", protagonists: ["Gunner"], prompt: "Perdita di un incantesimo fondamentale. Rivelazione: il fulcro (Gunner) deve soffrire per sostenere il sistema." }
        ]
      },
      {
        num: 17, title: "Mura Profanate", goal: "Risposta della reliquia e apparizione dei simboli di Set.",
        scenes: [
          { num: 1, title: "Bagliori della Brace", protagonists: ["Crystal"], prompt: "La Brace reagisce alla liberazione delle principesse. Crystal analizza i nuovi segni elementali." },
          { num: 2, title: "Il Simbolo del Serpente", protagonists: ["Naim", "Nobili"], prompt: "Il marchio di Set appare sulle mura. Naim seda con la forza la rivolta politica dei nobili." }
        ]
      },
      {
        num: 18, title: "L'Oceano dei Ricordi", goal: "Livello 4: Mare Profondo. Circolazione del potere.",
        scenes: [
          { num: 1, title: "Principessa Thalassia", protagonists: ["Gunner", "Thalassia"], prompt: "Incontro con la creatura d'acqua che riflette il passato di chi la osserva. Mare profondo e oscuro." },
          { num: 2, title: "Sacrificio Infantile", protagonists: ["Gunner"], prompt: "Gunner rinuncia a un ricordo d'infanzia per superare la prova di controllo delle proprie emozioni." },
          { num: 3, title: "Il Sole Freddo", protagonists: ["Gunner"], prompt: "Rivelazione sulla circolazione del potere. Nel mondo reale, il sole inizia a raffreddarsi visibilmente." }
        ]
      },
      {
        num: 19, title: "Spie e Venti Sussurranti", goal: "Debolezza del trono e peggioramento di Elyanore.",
        scenes: [
          { num: 1, title: "L'Osservatore Straniero", protagonists: ["Lail", "Emissario"], prompt: "Un emissario spia la corte. Voci sinistre nel vento minano la morale dei sudditi e della reggente." },
          { num: 2, title: "Il Tempio di Horus-Re", protagonists: ["Crystal", "Elyanore"], prompt: "Elyanore peggiora drasticamente. Crystal cerca una cura disperata nel tempio solare." }
        ]
      },
      {
        num: 20, title: "La Folgore Decisionale", goal: "Livello 5: Dominio del Fulmine. Gestione del caos.",
        scenes: [
          { num: 1, title: "Voltara l'Elettrica", protagonists: ["Gunner", "Voltara"], prompt: "Incontro con la principessa tra i lampi. Velocità estrema e instabilità molecolare." },
          { num: 2, title: "Velocità di Reazione", protagonists: ["Gunner"], prompt: "Duello magico dove il tempo di decisione è quasi nullo. Un errore significa la morte immediata." },
          { num: 3, title: "Un Ricordo di Lail", protagonists: ["Gunner"], prompt: "Vittoria pagata dimenticando un momento prezioso con Lail. Il caos deve essere bilanciato dal sacrificio." }
        ]
      },
      {
        num: 21, title: "Razionamenti d'Acciaio", goal: "Crisi dei raccolti e ascesa del Consiglio di Reggenza.",
        scenes: [
          { num: 1, title: "Ombre Ribelli", protagonists: ["Naim", "Popolo"], prompt: "Naim impone razionamenti. Fenomeno soprannaturale: le ombre dei cittadini iniziano a staccarsi." },
          { num: 2, title: "Proposta di Reggenza", protagonists: ["Lail", "Consiglio"], prompt: "I nobili propongono formalmente il Consiglio di Reggenza per esautorare le regine." }
        ]
      },
      {
        num: 22, title: "La Geometria della Verità", goal: "Livello 6: Dominio del Cristallo. Verità assoluta.",
        scenes: [
          { num: 1, title: "Clarissia la Geometrica", protagonists: ["Gunner", "Clarissia"], prompt: "Incontro con la principessa del prisma. Luce rifratta, angoli perfetti e assenza di ambiguità." },
          { num: 2, title: "Fratture di Menzogna", protagonists: ["Gunner"], prompt: "Duello di sincerità. Ogni mezza verità o esitazione crea una frattura fisica nel corpo di Gunner." },
          { num: 3, title: "Debolezza Reale", protagonists: ["Gunner"], prompt: "Comprendere che il fulcro deve soffrire. Una delle regine sviene nel mondo reale per il riverbero." }
        ]
      },
      {
        num: 23, title: "Sussurri tra le Mura", goal: "Febbri critiche e repressione politica di Lail.",
        scenes: [
          { num: 1, title: "Fede Vacillante", protagonists: ["Crystal", "Elyanore"], prompt: "Febbri critiche di Elyanore. I sussurri nel vento convincono la servitù che la fine è vicina." },
          { num: 2, title: "Eliminazione delle Pedine", protagonists: ["Lail"], prompt: "Lail diventa spietata. Inizia a eliminare fisicamente o politicamente i membri del Consiglio." }
        ]
      },
      {
        num: 24, title: "L'Eclissi di Cenere", goal: "Livello 7: Dominio della Cenere. Forza dal fallimento.",
        scenes: [
          { num: 1, title: "Ashaya del Rimpianto", protagonists: ["Gunner", "Ashaya"], prompt: "Incontro con lo spirito di fumo tra le rovine. Atmosfera di malinconia e memorie sbiadite." },
          { num: 2, title: "Il Valore degli Errori", protagonists: ["Gunner"], prompt: "Enigma del fallimento. Gunner deve accettare e trarre forza dai propri errori passati." },
          { num: 3, title: "Il Silenzio della Brace", protagonists: ["Gunner"], prompt: "Rivelazione sulla circolazione. La Brace nel mondo reale smette di rispondere del tutto." }
        ]
      },
      {
        num: 25, title: "La Menzogna del Serpente", goal: "Rivolta del culto e terrore nel palazzo.",
        scenes: [
          { num: 1, title: "Annuncio di Morte", protagonists: ["Naim", "Cultisti"], prompt: "Il culto di Set dichiara Gunner morto. Naim seda la rivolta con una brutalità necessaria." },
          { num: 2, title: "Assedio Ombroso", protagonists: ["Crystal", "Branko"], prompt: "Le ombre nel palazzo agiscono indipendentemente. Clima di puro terrore claustrofobico." }
        ]
      },
      {
        num: 26, title: "Il Gelo Assoluto", goal: "Livello 8: Dominio del Ghiaccio. Solitudine del faraone.",
        scenes: [
          { num: 1, title: "Principessa Glaciara", protagonists: ["Gunner", "Glaciara"], prompt: "Incontro con la statua di ghiaccio eterno. Freddo che congela il tempo e i pensieri." },
          { num: 2, title: "Solitudine Divina", protagonists: ["Gunner"], prompt: "Accettazione della solitudine come unica condizione possibile per un dio-faraone." },
          { num: 3, title: "Ricordo Perduto", protagonists: ["Gunner"], prompt: "Gunner sacrifica un altro ricordo di una delle sue regine per poter proseguire." }
        ]
      },
      {
        num: 27, title: "La Guardia della Roccia", goal: "Guardia d'élite di Naim e paura dei nobili.",
        scenes: [
          { num: 1, title: "Fedeltà Cieca", protagonists: ["Naim", "Guardie"], prompt: "Lampo della Brace. Naim istituisce una guardia d'élite fedele solo a lei, non al trono." },
          { num: 2, title: "Ferocia di Naim", protagonists: ["Naim"], prompt: "Nuova sabbia nera nei pozzi. I nobili tremano davanti alla risolutezza ferocemente pragmatica di Naim." }
        ]
      },
      {
        num: 28, title: "Clessidre di Polvere", goal: "Livello 9: Sabbia del Tempo. Limiti della salvezza.",
        scenes: [
          { num: 1, title: "Chronos-Hekat", protagonists: ["Gunner", "Chronos-Hekat"], prompt: "Incontro con la principessa fatta di clessidre dorate. Governa la memoria e l'oblio." },
          { num: 2, title: "Erosione dell'Io", protagonists: ["Gunner"], prompt: "Viaggio in un deserto che consuma letteralmente l'identità del viaggiatore ad ogni passo." },
          { num: 3, title: "Salvezza Impossibile", protagonists: ["Gunner"], prompt: "Rivelazione: non si può salvare chiunque. Perdita di un altro incantesimo fondamentale." }
        ]
      },
      {
        num: 29, title: "Il Sonno dei Serpenti", goal: "Ultime razioni e attesa strategica di Lail.",
        scenes: [
          { num: 1, title: "Sogni dei Bambini", protagonists: ["Naim", "Branko"], prompt: "Razionamento totale dell'acqua contaminata. I bambini del regno sognano all'unisono i serpenti." },
          { num: 2, title: "Scacco Matto", protagonists: ["Lail"], prompt: "Lail muove le ultime pedine politiche per bloccare definitivamente il Consiglio." }
        ]
      },
      {
        num: 30, title: "La Fiamma Originaria", goal: "Livello 10: Luce Primordiale. Prova di fede.",
        scenes: [
          { num: 1, title: "Luxia la Celestiale", protagonists: ["Gunner", "Luxia"], prompt: "Incontro con la principessa della fede. Un sole angelico che acceca e purifica." },
          { num: 2, title: "Luce Interna", protagonists: ["Gunner"], prompt: "Gunner deve spegnere la propria luce esterna per trovare una sorgente di potere interna." },
          { num: 3, title: "Tace la Brace", protagonists: ["Gunner"], prompt: "Gunner invecchia ancora visibilmente. Nel mondo reale, la Brace smette di brillare." }
        ]
      },
      {
        num: 31, title: "L'Ombra della Reggenza", goal: "Crisi del sole e tentato furto dei sigilli.",
        scenes: [
          { num: 1, title: "Assalto ai Sigilli", protagonists: ["Lail", "Consiglio"], prompt: "Il sole è freddo. Il Consiglio tenta di sottrarre i sigilli reali a Lail con la forza." },
          { num: 2, title: "Ombre per le Strade", protagonists: ["Popolo"], prompt: "Le ombre dei cittadini camminano libere per Calimshan, seminando panico e follia." }
        ]
      },
      {
        num: 32, title: "Le Ali del Distacco", goal: "Livello 11: Dominio del Vento. Potere circolare.",
        scenes: [
          { num: 1, title: "Zephyria l'Inafferrabile", protagonists: ["Gunner", "Zephyria"], prompt: "Incontro con lo spirito d'aria rapido e libero da ogni vincolo materiale." },
          { num: 2, title: "Rinuncia alle Ancore", protagonists: ["Gunner"], prompt: "Gunner rinuncia alle sue ultime ancore col passato per poter 'volare' verso la fine." },
          { num: 3, title: "Ultima Cicatrice", protagonists: ["Gunner"], prompt: "Appare l'ultima cicatrice elementale. Rivelazione finale sulla circolazione dell'energia." }
        ]
      },
      {
        num: 33, title: "Il Tradimento dell'Incenso", goal: "Sacerdote corrotto e cambiamento degli equilibri.",
        scenes: [
          { num: 1, title: "Set nel Tempio", protagonists: ["Naim", "Sacerdote"], prompt: "Scoperto un traditore nel clero. La rivolta viene schiacciata con una durezza senza precedenti." },
          { num: 2, title: "Equilibri Stravolti", protagonists: ["Lail", "Crystal"], prompt: "Fuori è passato un mese. Le regine hanno preso il controllo totale ma il regno è in ginocchio." }
        ]
      },
      {
        num: 34, title: "Lo Specchio Oscuro", goal: "Livello 12: Ombra Elementale. L'ombra necessaria.",
        scenes: [
          { num: 1, title: "Incontro con Skia", protagonists: ["Gunner", "Skia"], prompt: "Incontro con il proprio riflesso nero che mette in dubbio ogni scelta fatta da Gunner." },
          { num: 2, title: "Parassita di Set", protagonists: ["Gunner"], prompt: "Difesa di Skia da un'entità di Set che vuole divorare l'identità stessa del piano." },
          { num: 3, title: "Ultima Perdita", protagonists: ["Gunner"], prompt: "Rivelazione finale: l'ombra è parte del sistema. Gunner perde l'ultimo incantesimo chiave." }
        ]
      },
      {
        num: 35, title: "IL RITORNO: Il Caos del Tempo", goal: "Ritorno di Gunner e confronto con il Consiglio.",
        scenes: [
          { num: 1, title: "Emerge dalla Tela", protagonists: ["Gunner", "Le Regine"], prompt: "Ritorno traumatico. Il tempo salta avanti e indietro di giorni. Incontri ripetuti e déjà-vu." },
          { num: 2, title: "Confronto con i Traditori", protagonists: ["Gunner", "Consiglio"], prompt: "Gunner affronta il Consiglio di Reggenza. È un uomo stanco, invecchiato e segnato." }
        ]
      },
      {
        num: 36, title: "EPILOGO: Il Faraone di Ferro", goal: "Punizione dei traditori e annuncio del viaggio al 16° Cerchio.",
        scenes: [
          { num: 1, title: "Il Faraone di Ferro", protagonists: ["Gunner", "Famiglia"], prompt: "Punizione dei nobili. Gunner osserva Branko umano e annuncia il viaggio al 16° Cerchio." }
        ]
      }
    ];

    // 2. PROCESS CHAPTERS AND SCENES
    for (const chData of data) {
      // Find or Create Chapter
      let chapter = await prisma.chapter.findFirst({
        where: { bookId, chapterNumber: chData.num }
      });

      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: {
            bookId,
            chapterNumber: chData.num,
            title: chData.title,
            chapterGoal: chData.goal,
            orderIndex: chData.num // Sync orderIndex with number for consistency
          }
        });
      } else {
        await prisma.chapter.update({
          where: { id: chapter.id },
          data: { title: chData.title, chapterGoal: chData.goal, orderIndex: chData.num }
        });
      }

      // Delete existing scenes for this chapter to avoid duplicates
      await prisma.scene.deleteMany({ where: { chapterId: chapter.id } });

      // Create new scenes
      for (let i = 0; i < chData.scenes.length; i++) {
        const scData = chData.scenes[i];
        
        // Resolve character connections
        const charIds = [];
        for (const pName of scData.protagonists) {
          const cid = await getCharId(pName);
          charIds.push({ id: cid });
        }

        await prisma.scene.create({
          data: {
            chapterId: chapter.id,
            sceneNumber: scData.num,
            title: scData.title,
            promptGoals: scData.prompt,
            orderIndex: i + 1,
            characters: {
              connect: charIds
            }
          }
        });
      }
      console.log(`Updated Chapter ${chData.num} with ${chData.scenes.length} scenes.`);
    }

    console.log("--- REFILL COMPLETED SUCCESSFULLY ---");

  } catch (error) {
    console.error("Refill Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

refillScenes();
