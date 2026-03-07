import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceUpdateBeats() {
  const bookId = 'b7655319-df64-49c2-a275-4853efa773f2';
  console.log(`--- FORCE UPDATING BEATS FOR BOOK: ${bookId} ---`);

  const data = [
    { ch: 11, sc: 1, text: "Purificazione del varco e addio straziante alle regine." },
    { ch: 12, sc: 1, text: "Incontro con Pyrilla, la Principessa di Roccia Fusa (una figura monumentale la cui pelle trasuda dolore liquido)." },
    { ch: 12, sc: 2, text: "Gunner risolve l'Enigma Cosmico sulla natura della resistenza interiore." },
    { ch: 12, sc: 3, text: "Apparizione della cicatrice elementale sul corpo reale; rivelazione: ogni legame è bilanciamento." },
    { ch: 13, sc: 1, text: "Elyanore è colpita da febbri magiche; Crystal percepisce il legame pulsante." },
    { ch: 13, sc: 2, text: "Sabbia nera nei pozzi; Lail adotta una strategia fredda per contenere il panico." },
    { ch: 13, sc: 3, text: "Il tempo accelera: nel mondo reale è passato un mese intero." },
    { ch: 14, sc: 1, text: "Incontro con Aethelgard, la Principessa dei rampicanti (un'entità vegetale che avvolge il tempo)." },
    { ch: 14, sc: 2, text: "Risoluzione di un enigma sulla stabilità delle proprie fondamenta morali." },
    { ch: 14, sc: 3, text: "Gunner invecchia soggettivamente; rivelazione: l'equilibrio è tensione." },
    { ch: 15, sc: 1, text: "Branko è tormentato da incubi sui serpenti; Lail teme per la sua sanità mentale." },
    { ch: 15, sc: 2, text: "La Brace smette di rispondere; Naim militarizza il palazzo contro minacce occulte." },
    { ch: 16, sc: 1, text: "Incontro con Nihila, la Principessa del Nulla (avvolta in veli di spazio negativo)." },
    { ch: 16, sc: 2, text: "Gunner difende la principessa da entità esterne che tentano di divorare il piano." },
    { ch: 16, sc: 3, text: "Perdita di un incantesimo chiave; rivelazione: il fulcro deve soffrire più degli altri." },
    { ch: 17, sc: 1, text: "La Brace bagliore per un istante; Crystal scopre che reagisce alle principesse liberate." },
    { ch: 17, sc: 2, text: "Un simbolo di Set appare sulle mura; rivolta politica sedata dal controllo militare." },
    { ch: 18, sc: 1, text: "Incontro con Thalassia, la Principessa delle Correnti (fatta d'acqua che riflette il passato)." },
    { ch: 18, sc: 2, text: "Gunner rinuncia a un ricordo d'infanzia per superare la prova di controllo emotivo." },
    { ch: 18, sc: 3, text: "Rivelazione: il potere deve fluire; il sole nel mondo reale appare più distante." },
    { ch: 19, sc: 1, text: "Un emissario straniero osserva la debolezza del trono; voci sinistre nel vento." },
    { ch: 19, sc: 2, text: "La bambina peggiora; Crystal cerca risposte nel Tempio di Horus-Re." },
    { ch: 20, sc: 1, text: "Incontro con Voltara, la Principessa dell'Istante (una figura elettrica che si muove tra i lampi)." },
    { ch: 20, sc: 2, text: "Gunner deve decidere istantaneamente ogni incantesimo per non essere disintegrato." },
    { ch: 20, sc: 3, text: "Gunner sceglie di perdere un ricordo di Lail; rivelazione sulla gestione del caos." },
    { ch: 21, sc: 1, text: "Crisi dei raccolti; Naim impone razionamenti duri; le ombre iniziano a staccarsi dai corpi." },
    { ch: 21, sc: 2, text: "Una fazione nobile propone formalmente il Consiglio di Reggenza." },
    { ch: 22, sc: 1, text: "Incontro con Clarissia, la Principessa del Prisma (composta da sfaccettature perfette)." },
    { ch: 22, sc: 2, text: "Ogni esitazione crea fratture nel corpo di Gunner; prova di verità assoluta." },
    { ch: 22, sc: 3, text: "Una delle regine sviene per debolezza fisica; rivelazione sulla sofferenza necessaria." },
    { ch: 23, sc: 1, text: "Elyanore sviluppa febbri critiche; sussurri maligni nel vento minano la fede dei servitori." },
    { ch: 23, sc: 2, text: "Lail diventa più fredda e inizia a eliminare le pedine del Consiglio di Reggenza." },
    { ch: 24, sc: 1, text: "Incontro con Ashaya, la Principessa del Rimpianto (fatta di fumo e memorie sbiadite)." },
    { ch: 24, sc: 2, text: "Gunner deve trovare la forza nei suoi errori passati per procedere." },
    { ch: 24, sc: 3, text: "Rivelazione: il potere è circolazione; la Brace smette di rispondere del tutto." },
    { ch: 25, sc: 1, text: "Un culto di Set dichiara Gunner morto; scoppia una rivolta contenuta dalla guardia di Naim." },
    { ch: 25, sc: 2, text: "Le ombre non seguono più i corpi nel palazzo, creando un clima di puro terrore." },
    { ch: 26, sc: 1, text: "Incontro con Glaciara, la Principessa della Conservazione (statua vivente di ghiaccio eterno)." },
    { ch: 26, sc: 2, text: "Gunner deve accettare una verità sulla sua solitudine come dio-faraone." },
    { ch: 26, sc: 3, text: "Perdita di un ricordo di una regina; rivelazione sul legame come bilanciamento." },
    { ch: 27, sc: 1, text: "La Brace emette un lampo; Naim crea la guardia d'élite fedele solo a lei." },
    { ch: 27, sc: 2, text: "Sabbia nera nei pozzi; i nobili tremano davanti alla ferocia di Naim." },
    { ch: 28, sc: 1, text: "Incontro con Chronos-Hekat, la Principessa della Memoria (fatta di clessidre dorate)." },
    { ch: 28, sc: 2, text: "Gunner attraversa un deserto che consuma l'identità ad ogni passo compiuto." },
    { ch: 28, sc: 3, text: "Rivelazione: non puoi salvare tutti; perdita di un incantesimo fondamentale." },
    { ch: 29, sc: 1, text: "Naim raziona le ultime scorte; i bambini hanno sogni costanti di serpi." },
    { ch: 29, sc: 2, text: "Lail muove le ultime pedine per bloccare il Consiglio di Reggenza." },
    { ch: 30, sc: 1, text: "Incontro con Luxia, la Principessa della Fede (un sole ardente con fattezze celestiali)." },
    { ch: 30, sc: 2, text: "Gunner deve spegnere la sua luce esterna per trovarne una interna; prova di fede." },
    { ch: 30, sc: 3, text: "Gunner comprende che il fulcro deve soffrire; la Brace tace nel mondo reale." },
    { ch: 31, sc: 1, text: "Il sole è sempre più freddo; il Consiglio tenta di forzare i sigilli reali." },
    { ch: 31, sc: 2, text: "Le ombre ribelli camminano libere per le strade del Calimshan." },
    { ch: 32, sc: 1, text: "Incontro con Zephyria, la Principessa della Libertà (uno spirito d'aria inafferrabile)." },
    { ch: 32, sc: 2, text: "Gunner rinuncia alle sue ultime ancore col passato per poter volare nel piano." },
    { ch: 32, sc: 3, text: "Nuova cicatrice elementale; rivelazione finale sulla circolazione dell'energia." },
    { ch: 33, sc: 1, text: "Scoperto un sacerdote corrotto; rivolta politica contenuta con estrema durezza." },
    { ch: 33, sc: 2, text: "Fuori è passato un mese; gli equilibri sono cambiati drasticamente in favore delle regine." },
    { ch: 34, sc: 1, text: "Incontro con Skia, la Principessa dell'Identità (un riflesso nero che sfida l'ego di Gunner)." },
    { ch: 34, sc: 2, text: "Gunner difende Skia da un parassita di Set che vuole divorare l'identità del piano." },
    { ch: 34, sc: 3, text: "Rivelazione finale: l'ombra è sistema; perdita dell'ultimo incantesimo chiave." },
    { ch: 35, sc: 1, text: "Gunner emerge dalla Tela. Ritorno traumatico; il tempo salta avanti e indietro; incontri ripetuti e déjà-vu." },
    { ch: 35, sc: 2, text: "Gunner affronta il Consiglio di Reggenza; scioglimento con il peso della Compensazione." },
    { ch: 36, sc: 1, text: "Gunner punisce i nobili e osserva Branko umano; annuncio del viaggio al 16° Cerchio." }
  ];

  try {
    for (const item of data) {
      // 1. Trova il capitolo corrispondente nel libro
      const chapter = await prisma.chapter.findFirst({
        where: { bookId, chapterNumber: item.ch }
      });

      if (!chapter) {
        console.warn(`Chapter ${item.ch} not found. skipping.`);
        continue;
      }

      // 2. Trova la scena corrispondente nel capitolo
      const scene = await prisma.scene.findFirst({
        where: { chapterId: chapter.id, sceneNumber: item.sc }
      });

      if (scene) {
        await prisma.scene.update({
          where: { id: scene.id },
          data: { promptGoals: item.text }
        });
        console.log(`Updated Ch ${item.ch} Sc ${item.sc}`);
      } else {
        console.warn(`Scene ${item.sc} not found in Chapter ${item.ch}.`);
      }
    }

    console.log("--- FORCE UPDATE COMPLETED ---");
  } catch (error) {
    console.error("Critical Error during force update:", error);
  } finally {
    await prisma.$disconnect();
  }
}

forceUpdateBeats();
