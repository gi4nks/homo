import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreBeats() {
  const bookId = 'b7655319-df64-49c2-a275-4853efa773f2';
  console.log(`--- RESTORING IMMEDIATE ACTION (BEATS) FOR BOOK: ${bookId} ---`);

  try {
    // Helper per trovare/creare personaggi
    const existingChars = await prisma.character.findMany({ where: { bookId } });
    const getCharId = async (name: string) => {
      let char = existingChars.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
      if (!char) {
        char = await prisma.character.create({
          data: { name: name.trim(), bookId, role: "Persona", description: "Ripristinato automaticamente." }
        });
        existingChars.push(char);
      }
      return char.id;
    };

    const data = [
      { num: 11, scenes: [{ num: 1, title: "L'Addio alle Regine", protagonists: ["Gunner", "Lail", "Crystal", "Naim"], beats: "Purificazione del varco e addio straziante alle regine." }] },
      { num: 12, scenes: [
        { num: 1, title: "Incontro con Pyrilla", protagonists: ["Gunner", "Pyrilla"], beats: "Incontro con Pyrilla, la Principessa di Roccia Fusa (una figura monumentale la cui pelle trasuda dolore liquido)." },
        { num: 2, title: "La Prova del Magma", protagonists: ["Gunner"], beats: "Gunner risolve l'Enigma Cosmico sulla natura della resistenza interiore." },
        { num: 3, title: "Il Prezzo del Fuoco", protagonists: ["Gunner"], beats: "Apparizione della cicatrice elementale sul corpo reale; rivelazione: ogni legame è bilanciamento." }
      ]},
      { num: 13, scenes: [
        { num: 1, title: "Febbri Magiche", protagonists: ["Crystal", "Elyanore"], beats: "Elyanore è colpita da febbri magiche; Crystal percepisce il legame pulsante." },
        { num: 2, title: "La Corruzione dell'Acqua", protagonists: ["Lail", "Naim"], beats: "Sabbia nera nei pozzi; Lail adotta una strategia fredda per contenere il panico." },
        { num: 3, title: "La Distorsione Temporale", protagonists: ["Popolo del Calimshan"], beats: "Il tempo accelera: nel mondo reale è passato un mese intero." }
      ]},
      { num: 14, scenes: [
        { num: 1, title: "Incontro con Aethelgard", protagonists: ["Gunner", "Aethelgard"], beats: "Incontro con Aethelgard, la Principessa dei rampicanti (un'entità vegetale che avvolge il tempo)." },
        { num: 2, title: "La Prova della Responsabilità", protagonists: ["Gunner"], beats: "Risoluzione di un enigma sulla stabilità delle proprie fondamenta morali." },
        { num: 3, title: "Tensione Controllata", protagonists: ["Gunner"], beats: "Gunner invecchia soggettivamente; rivelazione: l'equilibrio è tensione." }
      ]},
      { num: 15, scenes: [
        { num: 1, title: "Sogni di Scaglie", protagonists: ["Lail", "Branko"], beats: "Branko è tormentato da incubi sui serpenti; Lail teme per la sua sanità mentale." },
        { num: 2, title: "Il Silenzio della Reliquia", protagonists: ["Naim", "Crystal"], beats: "La Brace smette di rispondere; Naim militarizza il palazzo contro minacce occulte." }
      ]},
      { num: 16, scenes: [
        { num: 1, title: "Incontro con Nihila", protagonists: ["Gunner", "Nihila"], beats: "Incontro con Nihila, la Principessa del Nulla (avvolta in veli di spazio negativo)." },
        { num: 2, title: "La Difesa del Vuoto", protagonists: ["Gunner"], beats: "Gunner difende la principessa da entità esterne che tentano di divorare il piano." },
        { num: 3, title: "Il Martirio del Fulcro", protagonists: ["Gunner"], beats: "Perdita di un incantesimo chiave; rivelazione: il fulcro deve soffrire più degli altri." }
      ]},
      { num: 17, scenes: [
        { num: 1, title: "Mura Profanate", protagonists: ["Crystal"], beats: "La Brace bagliore per un istante; Crystal scopre che reagisce alle principesse liberate." },
        { num: 2, title: "Il Simbolo del Serpente", protagonists: ["Naim", "Nobili"], beats: "Un simbolo di Set appare sulle mura; rivolta politica sedata dal controllo militare." }
      ]},
      { num: 18, scenes: [
        { num: 1, title: "L'Oceano dei Ricordi", protagonists: ["Gunner", "Thalassia"], beats: "Incontro con Thalassia, la Principessa delle Correnti (fatta d'acqua che riflette il passato)." },
        { num: 2, title: "Il Sacrificio Personale", protagonists: ["Gunner"], beats: "Gunner rinuncia a un ricordo d'infanzia per superare la prova di controllo emotivo." },
        { num: 3, title: "Circolazione del Potere", protagonists: ["Gunner"], beats: "Rivelazione: il potere deve fluire; il sole nel mondo reale appare più distante." }
      ]},
      { num: 19, scenes: [
        { num: 1, title: "Spie e Venti Sussurranti", protagonists: ["Lail", "Emissario"], beats: "Un emissario straniero osserva la debolezza del trono; voci sinistre nel vento." },
        { num: 2, title: "L'Incertezza di Elyanore", protagonists: ["Crystal", "Elyanore"], beats: "La bambina peggiora; Crystal cerca risposte nel Tempio di Horus-Re." }
      ]},
      { num: 20, scenes: [
        { num: 1, title: "La Folgore Decisionale", protagonists: ["Gunner", "Voltara"], beats: "Incontro con Voltara, la Principessa dell'Istante (una figura elettrica che si muove tra i lampi)." },
        { num: 2, title: "Duello Magico Puro", protagonists: ["Gunner"], beats: "Gunner deve decidere istantaneamente ogni incantesimo per non essere disintegrato." },
        { num: 3, title: "Sacrificio Scelto", protagonists: ["Gunner"], beats: "Gunner sceglie di perdere un ricordo di Lail; rivelazione sulla gestione del caos." }
      ]},
      { num: 21, scenes: [
        { num: 1, title: "Razionamenti d'Acciaio", protagonists: ["Naim", "Popolo"], beats: "Crisi dei raccolti; Naim impone razionamenti duri; le ombre iniziano a staccarsi dai corpi." },
        { num: 2, title: "La Fronda dei Nobili", protagonists: ["Lail", "Consiglio"], beats: "Una fazione nobile propone formalmente il Consiglio di Reggenza." }
      ]},
      { num: 22, scenes: [
        { num: 1, title: "La Geometria della Verità", protagonists: ["Gunner", "Clarissia"], beats: "Incontro con Clarissia, la Principessa del Prisma (composta da sfaccettature perfette)." },
        { num: 2, title: "Duello di Sincerità", protagonists: ["Gunner"], beats: "Ogni esitazione crea fratture nel corpo di Gunner; prova di verità assoluta." },
        { num: 3, title: "Il Peso del Fulcro", protagonists: ["Gunner"], beats: "Una delle regine sviene per debolezza fisica; rivelazione sulla sofferenza necessaria." }
      ]},
      { num: 23, scenes: [
        { num: 1, title: "Sussurri tra le Mura", protagonists: ["Crystal", "Elyanore"], beats: "Elyanore sviluppa febbri critiche; sussurri maligni nel vento minano la fede dei servitori." },
        { num: 2, title: "Il Potere di Lail", protagonists: ["Lail"], beats: "Lail diventa più fredda e inizia a eliminare le pedine del Consiglio di Reggenza." }
      ]},
      { num: 24, scenes: [
        { num: 1, title: "L'Eclissi di Cenere", protagonists: ["Gunner", "Ashaya"], beats: "Incontro con Ashaya, la Principessa del Rimpianto (fatta di fumo e memorie sbiadite)." },
        { num: 2, title: "Enigma del Fallimento", protagonists: ["Gunner"], beats: "Gunner deve trovare la forza nei suoi errori passati per procedere." },
        { num: 3, title: "Il Ritorno del Flusso", protagonists: ["Gunner"], beats: "Rivelazione: il potere è circolazione; la Brace smette di rispondere del tutto." }
      ]},
      { num: 25, scenes: [
        { num: 1, title: "La Menzogna del Serpente", protagonists: ["Naim", "Cultisti"], beats: "Un culto di Set dichiara Gunner morto; scoppia una rivolta contenuta dalla guardia di Naim." },
        { num: 2, title: "L'Assedio delle Ombre", protagonists: ["Crystal", "Branko"], beats: "Le ombre non seguono più i corpi nel palazzo, creando un clima di puro terrore." }
      ]},
      { num: 26, scenes: [
        { num: 1, title: "Il Gelo Assoluto", protagonists: ["Gunner", "Glaciara"], beats: "Incontro con Glaciara, la Principessa della Conservazione (statua vivente di ghiaccio eterno)." },
        { num: 2, title: "Accettazione Dolorosa", protagonists: ["Gunner"], beats: "Gunner deve accettare una verità sulla sua solitudine come dio-faraone." },
        { num: 3, title: "Frammenti Perduti", protagonists: ["Gunner"], beats: "Perdita di un ricordo di una regina; rivelazione sul legame come bilanciamento." }
      ]},
      { num: 27, scenes: [
        { num: 1, title: "La Guardia della Roccia", protagonists: ["Naim", "Guardie"], beats: "La Brace emette un lampo; Naim crea la guardia d'élite fedele solo a lei." },
        { num: 2, title: "Contaminazione", protagonists: ["Naim"], beats: "Sabbia nera nei pozzi; i nobili tremano davanti alla ferocia di Naim." }
      ]},
      { num: 28, scenes: [
        { num: 1, title: "Clessidre di Polvere", protagonists: ["Gunner", "Chronos-Hekat"], beats: "Incontro con Chronos-Hekat, la Principessa della Memoria (fatta di clessidre dorate)." },
        { num: 2, title: "Viaggio Letale", protagonists: ["Gunner"], beats: "Gunner attraversa un deserto che consuma l'identità ad ogni passo compiuto." },
        { num: 3, title: "Il Sacrificio della Salvezza", protagonists: ["Gunner"], beats: "Rivelazione: non puoi salvare tutti; perdita di un incantesimo fondamentale." }
      ]},
      { num: 29, scenes: [
        { num: 1, title: "Il Sonno dei Serpenti", protagonists: ["Naim", "Branko"], beats: "Naim raziona le ultime scorte; i bambini hanno sogni costanti di serpi." },
        { num: 2, title: "L'Attesa Strategica", protagonists: ["Lail"], beats: "Lail muove le ultime pedine per bloccare il Consiglio di Reggenza." }
      ]},
      { num: 30, scenes: [
        { num: 1, title: "La Fiamma Originaria", protagonists: ["Gunner", "Luxia"], beats: "Incontro con Luxia, la Principessa della Fede (un sole ardente con fattezze celestiali)." },
        { num: 2, title: "Sacrificio della Luce", protagonists: ["Gunner"], beats: "Gunner deve spegnere la sua luce esterna per trovarne una interna; prova di fede." },
        { num: 3, title: "Invecchiamento soggettivo", protagonists: ["Gunner"], beats: "Gunner comprende che il fulcro deve soffrire; la Brace tace nel mondo reale." }
      ]},
      { num: 31, scenes: [
        { num: 1, title: "L'Ombra della Reggenza", protagonists: ["Lail", "Consiglio"], beats: "Il sole è sempre più freddo; il Consiglio tenta di forzare i sigilli reali." },
        { num: 2, title: "Panico Urbano", protagonists: ["Popolo"], beats: "Le ombre ribelli camminano libere per le strade del Calimshan." }
      ]},
      { num: 32, scenes: [
        { num: 1, title: "Le Ali del Distacco", protagonists: ["Gunner", "Zephyria"], beats: "Incontro con Zephyria, la Principessa della Libertà (uno spirito d'aria inafferrabile)." },
        { num: 2, title: "Sacrificio d'Identità", protagonists: ["Gunner"], beats: "Gunner rinuncia alle sue ultime ancore col passato per poter volare nel piano." },
        { num: 3, title: "Potere Circolare", protagonists: ["Gunner"], beats: "Nuova cicatrice elementale; rivelazione finale sulla circolazione dell'energia." }
      ]},
      { num: 33, scenes: [
        { num: 1, title: "Il Tradimento dell'Incenso", protagonists: ["Naim", "Sacerdote"], beats: "Scoperto un sacerdote corrotto; rivolta politica contenuta con estrema durezza." },
        { num: 2, title: "Mese di Silenzio", protagonists: ["Lail", "Crystal"], beats: "Fuori è passato un mese; gli equilibri sono cambiati drasticamente in favore delle regine." }
      ]},
      { num: 34, scenes: [
        { num: 1, title: "Lo Specchio Oscuro", protagonists: ["Gunner", "Skia"], beats: "Incontro con Skia, la Principessa dell'Identità (un riflesso nero che sfida l'ego di Gunner)." },
        { num: 2, title: "Difesa dell'Anima", protagonists: ["Gunner"], beats: "Gunner difende Skia da un parassita di Set che vuole divorare l'identità del piano." },
        { num: 3, title: "L'Ombra è Parte", protagonists: ["Gunner"], beats: "Rivelazione finale: l'ombra è sistema; perdita dell'ultimo incantesimo chiave." }
      ]},
      { num: 35, scenes: [
        { num: 1, title: "IL RITORNO", protagonists: ["Gunner", "Le Regine"], beats: "Gunner emerge dalla Tela. Ritorno traumatico; il tempo salta avanti e indietro; incontri ripetuti e déjà-vu." },
        { num: 2, title: "Confronto Finale", protagonists: ["Gunner", "Consiglio"], beats: "Gunner affronta il Consiglio di Reggenza; scioglimento con il peso della Compensazione." }
      ]},
      { num: 36, scenes: [
        { num: 1, title: "Il Faraone di Ferro", protagonists: ["Gunner", "Famiglia"], beats: "Il destino dei traditori e dei figli. Gunner punisce i nobili e osserva Branko umano; annuncio del viaggio al 16° Cerchio." }
      ]}
    ];

    for (const chData of data) {
      const chapter = await prisma.chapter.findFirst({
        where: { bookId, chapterNumber: chData.num }
      });

      if (chapter) {
        // Eliminiamo le scene attuali per ripopolarle con i beats corretti e l'ordine giusto
        await prisma.scene.deleteMany({ where: { chapterId: chapter.id } });

        for (let i = 0; i < chData.scenes.length; i++) {
          const sc = chData.scenes[i];
          const charIds = [];
          for (const pName of sc.protagonists) {
            charIds.push({ id: await getCharId(pName) });
          }

          await prisma.scene.create({
            data: {
              chapterId: chapter.id,
              sceneNumber: sc.num,
              title: sc.title,
              promptGoals: sc.beats,
              orderIndex: i + 1,
              characters: { connect: charIds }
            }
          });
        }
        console.log(`Beats restored for Chapter ${chData.num}`);
      }
    }

    console.log("--- BEATS RESTORATION COMPLETED ---");

  } catch (error) {
    console.error("Restoration Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreBeats();
