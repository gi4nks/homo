import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepRestoreBeats() {
  const bookId = 'b7655319-df64-49c2-a275-4853efa773f2';
  console.log(`--- DEEP RESTORING BEATS BY TITLE ---`);

  const map: Record<string, string> = {
    "L'Addio alle Regine": "Purificazione del varco e addio straziante alle regine.",
    "Incontro con Pyrilla": "Incontro con Pyrilla, la Principessa di Roccia Fusa (una figura monumentale la cui pelle trasuda dolore liquido).",
    "La Prova del Magma": "Gunner risolve l'Enigma Cosmico sulla natura della resistenza interiore.",
    "Il Prezzo del Fuoco": "Apparizione della cicatrice elementale sul corpo reale; rivelazione: ogni legame è bilanciamento.",
    "Febbri Magiche": "Elyanore è colpita da febbri magiche; Crystal percepisce il legame pulsante.",
    "La Corruzione dell'Acqua": "Sabbia nera nei pozzi; Lail adotta una strategia fredda per contenere il panico.",
    "La Distorsione Temporale": "Il tempo accelera: nel mondo reale è passato un mese intero.",
    "Incontro con Aethelgard": "Incontro con Aethelgard, la Principessa dei rampicanti (un'entità vegetale che avvolge il tempo).",
    "La Prova della Responsabilità": "Risoluzione di un enigma sulla stabilità delle proprie fondamenta morali.",
    "Tensione Controllata": "Gunner invecchia soggettivamente; rivelazione: l'equilibrio è tensione.",
    "Sogni di Scaglie": "Branko è tormentato da incubi sui serpenti; Lail teme per la sua sanità mentale.",
    "Il Silenzio della Reliquia": "La Brace smette di rispondere; Naim militarizza il palazzo contro minacce occulte.",
    "Incontro con Nihila": "Incontro con Nihila, la Principessa del Nulla (avvolta in veli di spazio negativo).",
    "La Difesa del Vuoto": "Gunner difende la principessa da entità esterne che tentano di divorare il piano.",
    "Il Martirio del Fulcro": "Perdita di un incantesimo chiave; rivelazione: il fulcro deve soffrire più degli altri.",
    "Mura Profanate": "La Brace bagliore per un istante; Crystal scopre che reagisce alle principesse liberate.",
    "Il Simbolo del Serpente": "Un simbolo di Set appare sulle mura; rivolta politica sedata dal controllo militare.",
    "L'Oceano dei Ricordi": "Incontro con Thalassia, la Principessa delle Correnti (fatta d'acqua che riflette il passato).",
    "Il Sacrificio Personale": "Gunner rinuncia a un ricordo d'infanzia per superare la prova di controllo emotivo.",
    "Circolazione del Potere": "Rivelazione: il potere deve fluire; il sole nel mondo reale appare più distante.",
    "Spie e Venti Sussurranti": "Un emissario straniero osserva la debolezza del trono; voci sinistre nel vento.",
    "L'Incertezza di Elyanore": "La bambina peggiora; Crystal cerca risposte nel Tempio di Horus-Re.",
    "La Folgore Decisionale": "Incontro con Voltara, la Principessa dell'Istante (una figura elettrica che si muove tra i lampi).",
    "Duello Magico Puro": "Gunner deve decidere istantaneamente ogni incantesimo per non essere disintegrato.",
    "Sacrificio Scelto": "Gunner sceglie di perdere un ricordo di Lail; rivelazione sulla gestione del caos.",
    "Razionamenti d'Acciaio": "Crisi dei raccolti; Naim impone razionamenti duri; le ombre iniziano a staccarsi dai corpi.",
    "La Fronda dei Nobili": "Una fazione nobile propone formalmente il Consiglio di Reggenza.",
    "La Geometria della Verità": "Incontro con Clarissia, la Principessa del Prisma (composta da sfaccettature perfette).",
    "Duello di Sincerità": "Ogni esitazione crea fratture nel corpo di Gunner; prova di verità assoluta.",
    "Il Peso del Fulcro": "Una delle regine sviene per debolezza fisica; rivelazione sulla sofferenza necessaria.",
    "Sussurri tra le Mura": "Elyanore sviluppa febbri critiche; sussurri maligni nel vento minano la fede dei servitori.",
    "Il Potere di Lail": "Lail diventa più fredda e inizia a eliminare le pedine del Consiglio di Reggenza.",
    "L'Eclissi di Cenere": "Incontro con Ashaya, la Principessa del Rimpianto (fatta di fumo e memorie sbiadite).",
    "Enigma del Fallimento": "Gunner deve trovare la forza nei suoi errori passati per procedere.",
    "Il Ritorno del Flusso": "Rivelazione: il potere è circolazione; la Brace smette di rispondere del tutto.",
    "La Menzogna del Serpente": "Un culto di Set dichiara Gunner morto; scoppia una rivolta contenuta dalla guardia di Naim.",
    "L'Assedio delle Ombre": "Le ombre non seguono più i corpi nel palazzo, creando un clima di puro terrore.",
    "Il Gelo Assoluto": "Incontro con Glaciara, la Principessa della Conservazione (statua vivente di ghiaccio eterno).",
    "Accettazione Dolorosa": "Gunner deve accettare una verità sulla sua solitudine come dio-faraone.",
    "Frammenti Perduti": "Perdita di un ricordo di una regina; rivelazione sul legame come bilanciamento.",
    "La Guardia della Roccia": "La Brace emette un lampo; Naim crea la guardia d'élite fedele solo a lei.",
    "Contaminazione": "Sabbia nera nei pozzi; i nobili tremano davanti alla ferocia di Naim.",
    "Clessidre di Polvere": "Incontro con Chronos-Hekat, la Principessa della Memoria (fatta di clessidre dorate).",
    "Viaggio Letale": "Gunner attraversa un deserto che consuma l'identità ad ogni passo compiuto.",
    "Il Sacrificio della Salvezza": "Rivelazione: non puoi salvare tutti; perdita di un incantesimo fondamentale.",
    "Il Sonno dei Serpenti": "Naim raziona le ultime scorte; i bambini hanno sogni costanti di serpi.",
    "L'Attesa Strategica": "Lail muove le ultime pedine per bloccare il Consiglio di Reggenza.",
    "La Fiamma Originaria": "Incontro con Luxia, la Principessa della Fede (un sole ardente con fattezze celestiali).",
    "Sacrificio della Luce": "Gunner deve spegnere la sua luce esterna per trovarne una interna; prova di fede.",
    "Invecchiamento soggettivo": "Gunner comprende che il fulcro deve soffrire; la Brace tace nel mondo reale.",
    "L'Ombra della Reggenza": "Il sole è sempre più freddo; il Consiglio tenta di forzare i sigilli reali.",
    "Panico Urbano": "Le ombre ribelli camminano libere per le strade del Calimshan.",
    "Le Ali del Distacco": "Incontro con Zephyria, la Principessa della Libertà (uno spirito d'aria inafferrabile).",
    "Sacrificio d'Identità": "Gunner rinuncia alle sue ultime ancore col passato per poter volare nel piano.",
    "Potere Circolare": "Nuova cicatrice elementale; rivelazione finale sulla circolazione dell'energia.",
    "Il Tradimento dell'Incenso": "Scoperto un sacerdote corrotto; rivolta politica contenuta con estrema durezza.",
    "Mese di Silenzio": "Fuori è passato un mese; gli equilibri sono cambiati drasticamente in favore delle regine.",
    "Lo Specchio Oscuro": "Incontro con Skia, la Principessa dell'Identità (un riflesso nero che sfida l'ego di Gunner).",
    "Difesa dell'Anima": "Gunner difende Skia da un parassita di Set che vuole divorare l'identità del piano.",
    "L'Ombra è Parte": "Rivelazione finale: l'ombra è sistema; perdita dell'ultimo incantesimo chiave.",
    "IL RITORNO": "Gunner emerge dalla Tela. Ritorno traumatico; il tempo salta avanti e indietro; incontri ripetuti e déjà-vu.",
    "Confronto Finale": "Gunner affronta il Consiglio di Reggenza; scioglimento con il peso della Compensazione.",
    "Il Faraone di Ferro": "Il destino dei traditori e dei figli. Gunner punisce i nobili e osserva Branko umano; annuncio del viaggio al 16° Cerchio."
  };

  try {
    const chapters = await prisma.chapter.findMany({ where: { bookId }, include: { scenes: true } });
    
    for (const chapter of chapters) {
      for (const scene of chapter.scenes) {
        const text = map[scene.title];
        if (text) {
          await prisma.scene.update({
            where: { id: scene.id },
            data: { promptGoals: text }
          });
          console.log(`Updated Scene: [${scene.title}] in Ch ${chapter.chapterNumber}`);
        } else {
          console.warn(`No mapping found for title: [${scene.title}]`);
        }
      }
    }

    console.log("--- DEEP RESTORE COMPLETED ---");
  } catch (error) {
    console.error("Error during deep restore:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deepRestoreBeats();
