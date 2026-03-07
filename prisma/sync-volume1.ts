import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncVolume1() {
  const bookId = '704f9dc1-968e-49f3-8954-456481edea17';
  console.log(`
--- INIZIO SINCRONIZZAZIONE VOLUME 1: ${bookId} ---
`);

  try {
    // ---------------------------------------------------------
    // 1. UPDATE BOOK METADATA
    // ---------------------------------------------------------
    console.log("Aggiornamento metadati del libro...");
    await prisma.book.update({
      where: { id: bookId },
      data: {
        synopsis: `Gathor Leapmind, noto come Gunner, è il Faraone del Calimshan, un sovrano dotato di immensi poteri psionici e divini che vive tormentato dal senso di colpa per il fallimento della sua vita precedente (come Evrym) e dalla perdita dell'amata Aranel. Mentre cerca di barcamenarsi tra le pressioni politiche dei nani e la minaccia strisciante del dio oscuro Set, Gunner trova rifugio nei "Giardini Chiusi" insieme alle sue compagne: la paladina Lail e l'elfa scura Crystal.

La nascita dei suoi due figli, Elyanore (una creatura cinerea legata al fuoco) e Branko (un veggente onnisciente), accelera la crisi: le loro nature anomale attirano l'attenzione di Set, che tenta di corrompere il regno dall'interno. Dopo un periodo di addestramento forzato nel Nagarrakam (una dimensione fuori dal tempo) sotto la guida del padre, il Guardiano del Tempo, Gunner apprende la "Compensazione", una magia basata sul principio del do ut des. Al suo ritorno, deve affrontare un portale dimensionale aperto in un dipinto corrotto. Per salvare la sua famiglia e il mondo dall'invasione di Set, Gunner comprende di dover essere il "Fulcro" del sacrificio: abbandona la sua realtà ed entra nel portale, sigillandolo per sempre e lasciando le sue tre regine (Lail, Crystal e la principessa nana Naim) a governare un mondo salvo ma privo del suo sole.`,
        tone: `1. Tono e Atmosfera (L'Epica del Logoramento):
Il tono non è mai trionfale o fiabesco. È un'epica della stanchezza, fatalista e malinconica.
Il potere assoluto non è una benedizione, ma un peso, una malattia, una condanna.
Mantieni un'atmosfera oppressiva, dove la minaccia cosmica si riflette nell'ambiente (caldo soffocante, gelo innaturale, oscurità strisciante).

2. Regole di Stile e Sintassi:
Usa la Paratassi: Frasi brevi, incisive, separate da punti fermi. Crea un ritmo martellante, specialmente nelle scene di tensione o d'azione.
Sensorialità Estrema: Non descrivere solo visivamente. Fai sentire gli odori (zolfo, mirra, rame, urina, ozono), la temperatura (caldo che scortica, gelo che brucia) e il tatto.
Show, Don't Tell fisico: Non dire "Gunner era disperato", ma scrivi "Gunner vomitò bile e gli tremarono le ginocchia". Usa reazioni corporee per descrivere le emozioni.
Evita: Lirismo classico, aggettivi superflui, avverbi in "-mente", e spiegoni ("info-dumping").

3. La Magia (Compensazione e Body Horror):
La magia non è mai pulita, gratuita o colorata. Segue la regola del Do Ut Des (Compensazione).
Se un personaggio usa la magia, deve pagare un tributo fisico o mentale.
Descrivi la magia psionica e divina usando termini medici/fisici (emorragia, ustione, fitte, nervi, cancro astrale, aneurisma, ossa spezzate).

4. Dialoghi:
I dialoghi devono essere ruvidi, diretti, stanchi e umani.
Evita il linguaggio teatrale, aulico o arcaico (niente "Mio prode signore"). I personaggi, anche se dèi o re, parlano come persone sfinite dal peso del mondo. Spesso si interrompono o hanno esitazioni.

5. Psicologia del Protagonista (Gunner):
È un ex sacerdote della morte diventato un dio-faraone.
Motivazione: È guidato dal senso di colpa per aver fallito in passato (la morte di Aranel) e dal terrore di distruggere la sua nuova famiglia con il suo stesso immenso potere (le sue mogli Lail, Crystal, Naim, e i figli Elyanore e Branko).
Non si sente un eroe, si sente un mostro costretto a fare il macellaio per proteggere chi ama.

Obiettivo della generazione:
Scrivi in modo crudo, viscerale ed emotivamente pericoloso. Il lettore non deve ammirare i personaggi, deve temere per la loro sanità mentale e fisica.`
      }
    });

    // ---------------------------------------------------------
    // 2. UPSERT CHARACTERS
    // ---------------------------------------------------------
    console.log("Sincronizzazione Personaggi...");
    const charactersToSync = [
      { name: "Gunner", role: "Protagonista", description: "Faraone tormentato, potente psionico e chierico. Ex Evrym." },
      { name: "Lail", role: "Coprotagonista / Moglie", description: "Paladina di Sune, bionda, pragmatica e protettiva." },
      { name: "Crystal", role: "Coprotagonista / Moglie", description: "Elfa scura, sacerdotessa di Eilistraee, calma e saggia." },
      { name: "Naim", role: "Coprotagonista / Alleata", description: "Principessa nana, sacerdotessa di Iside, fiera e massiccia." },
      { name: "Branko", role: "Personaggio Chiave", description: "Figlio di Gunner, occhi azzurri, poteri profetici e onniscienza." },
      { name: "Elyanore", role: "Personaggio Chiave", description: "Figlia di Gunner, grigia, emana calore estremo, 'buco nero' psionico." },
      { name: "Branko il Vecchio", role: "Mentore", description: "Padre di Gunner, Guardiano del Tempo, entità quasi divina." },
      { name: "Set", role: "Antagonista Principale", description: "Divinità oscura, manipolatore di ombre e veleni." },
      { name: "Marianek", role: "Aiutante / Messaggero", description: "Anziana paladina di Pelor, mentore del passato di Gunner." },
      { name: "Lord Tordek", role: "NPC", description: "Emissario nano." },
      { name: "Safiya", role: "NPC", description: "Djinni evocata da Gunner." },
      { name: "Kaelen", role: "NPC", description: "Scriba interrogato nelle celle." },
      { name: "Lord Vane", role: "NPC", description: "Traditore smascherato al banchetto." },
      { name: "Emissario", role: "NPC", description: "Emissario straniero." },
      { name: "Sacerdote", role: "NPC", description: "Sacerdote di palazzo." }
    ];

    const charMap: Record<string, string> = {};
    for (const charData of charactersToSync) {
      // Find existing by name
      let char = await prisma.character.findFirst({
        where: { bookId, name: charData.name }
      });

      if (char) {
        char = await prisma.character.update({
          where: { id: char.id },
          data: { role: charData.role, description: charData.description }
        });
      } else {
        char = await prisma.character.create({
          data: { ...charData, bookId }
        });
      }
      charMap[char.name] = char.id;
    }

    // Custom mappings for aliases used in the outline
    charMap["Gunner (Gathor)"] = charMap["Gunner"];
    charMap["Branko (Bimbo)"] = charMap["Branko"];
    charMap["Set (ombra)"] = charMap["Set"];
    charMap["Gunner (Set nell'illusione)"] = charMap["Gunner"]; // Simplification
    charMap["la corte"] = ""; // Ignored as specific entity

    // ---------------------------------------------------------
    // 3. STRUCTURE DATA (CHAPTERS & SCENES)
    // ---------------------------------------------------------
    const structure = [
      {
        num: 1, title: "IL SOLE E L'INCUDINE", goal: "Presentazione di Gunner e del suo fardello politico e mentale nel palazzo reale del Calimshan.",
        scenes: [
          { num: 1, title: "Sulla terrazza del palazzo", beats: "Gunner riflette sul suo potere psionico che gli causa emicranie costanti.", protagonists: ["Gunner"] },
          { num: 2, title: "Incontro con Lord Tordek", beats: "L'emissario nano preme per il matrimonio con la principessa Naim. Gunner rifiuta e sospende l'alleanza, temendo di ripetere gli errori del passato.", protagonists: ["Gunner", "Lord Tordek"] },
          { num: 3, title: "Costruzione del Tempio", beats: "Gunner ordina al Sacerdote di palazzo la costruzione di un Tempio a Horus-Re come 'ancora' contro l'oscurità di Set.", protagonists: ["Gunner", "Sacerdote"] }
        ]
      },
      {
        num: 2, title: "I GIARDINI CHIUSI", goal: "Introduzione del rifugio privato di Gunner e delle sue compagne.",
        scenes: [
          { num: 1, title: "L'Harem", beats: "Gunner entra nell'harem. Incontra Lail e Crystal. Si discute della decisione politica e del trauma legato ad Aranel.", protagonists: ["Gunner", "Lail", "Crystal"] },
          { num: 2, title: "Il Patto", beats: "Presso la vasca centrale. Gunner evoca la Djinni Safiya per stringere un patto di protezione per le sue donne.", protagonists: ["Gunner", "Safiya"] }
        ]
      },
      {
        num: 3, title: "SUSSURRI NELLA SABBIA", goal: "L'indagine sulla corruzione interna e il primo scontro psichico con Set.",
        scenes: [
          { num: 1, title: "Interrogatorio", beats: "Nelle celle sotterranee. Gunner interroga lo scriba Kaelen usando la forza psionica.", protagonists: ["Gunner", "Kaelen"] },
          { num: 2, title: "Incursione Mentale", beats: "Incursione mentale. Gunner vede Set che usa il volto di Aranel. Perde il controllo e uccide accidentalmente Kaelen bruciandogli il cervello.", protagonists: ["Gunner", "Set"] },
          { num: 3, title: "Fuga e Rivelazione", beats: "Fuga verso i giardini. Crystal consola Gunner e gli rivela di essere incinta.", protagonists: ["Gunner", "Crystal"] }
        ]
      },
      {
        num: 4, title: "CENERE BIANCA", goal: "La difficile gravidanza di Crystal e la nascita di Elyanore (Anno della Cenere Bianca).",
        scenes: [
          { num: 1, title: "Gravidanza Termica", beats: "La gravidanza 'termica'. Crystal emana un calore insopportabile; Gunner deve canalizzare l'energia per non farla bruciare.", protagonists: ["Gunner", "Crystal"] },
          { num: 2, title: "La Nascita", beats: "La notte del parto. Nascita di Elyanore. La bambina è grigia, psionicamente vuota e dotata di un marchio a forma di fenice che emana fuoco.", protagonists: ["Gunner", "Crystal", "Lail", "Elyanore"] }
        ]
      },
      {
        num: 5, title: "ORO E VELENO", goal: "Il ritorno di Marianek e il tentato avvelenamento della città.",
        scenes: [
          { num: 1, title: "La Brace", beats: "Arrivo della delegazione di Werewind. Marianek consegna a Gunner la 'Brace del Primo Giorno' da parte dello spirito di Aranel.", protagonists: ["Gunner", "Marianek"] },
          { num: 2, title: "Il Pozzo", beats: "Il pozzo del Tempio. Gunner percepisce un attentato. Interviene con Lail per fermare un servitore posseduto che stava avvelenando l'acqua.", protagonists: ["Gunner", "Lail"] }
        ]
      },
      {
        num: 6, title: "L'OCCHIO CHE VEDE", goal: "Nascita di Branko e primo attacco diretto di Set al cuore del palazzo.",
        scenes: [
          { num: 1, title: "Visioni", beats: "Gravidanza di Lail. La paladina soffre per le visioni onniscienti del feto.", protagonists: ["Gunner", "Lail"] },
          { num: 2, title: "Nascita di Branko", beats: "Nascita di Branko. Il bambino ha occhi azzurri e poteri telepatici immediati.", protagonists: ["Gunner", "Lail", "Branko"] },
          { num: 3, title: "Attacco nelle Cripte", beats: "Attacco nelle cripte. Branko avverte il padre di un pericolo. Gunner affronta un'emanazione di Set che minaccia i suoi figli e sigilla il buco nel terreno con la forza bruta.", protagonists: ["Gunner", "Set", "Branko"] }
        ]
      },
      {
        num: 7, title: "SEGNI DI ROVINA", goal: "La consacrazione dei figli e la scoperta della tela corrotta.",
        scenes: [
          { num: 1, title: "Cerimonia", beats: "Cerimonia al Tempio. Presentazione di Branko ed Elyanore. Un'eclissi magica segna l'evento.", protagonists: ["Gunner"] },
          { num: 2, title: "Il Banchetto", beats: "Il banchetto. Branko smaschera Lord Vane come traditore. Gunner ne ordina l'esecuzione immediata.", protagonists: ["Branko", "Gunner", "Lord Vane", "Lail"] },
          { num: 3, title: "Il Dipinto", beats: "Ala Est del palazzo. I bambini reagiscono a un dipinto (le Dodici Principesse). Branko rivela che è una prigione rotta usata da Set.", protagonists: ["Branko", "Elyanore", "Gunner"] }
        ]
      },
      {
        num: 8, title: "OLTRE IL VELO DEL NAGARRAKAM", goal: "L'addestramento nel mondo senza tempo.",
        scenes: [
          { num: 1, title: "Il Guardiano", beats: "Apparizione di Branko il Vecchio. Il tempo si ferma. Gunner viene portato nel Nagarrakam per imparare la magia della Compensazione.", protagonists: ["Gunner", "Branko il Vecchio"] },
          { num: 2, title: "Cinque Anni", beats: "Cinque anni di addestramento (percepiti). Gunner impara il do ut des e forgia manufatti psionici.", protagonists: ["Gunner", "Branko il Vecchio"] },
          { num: 3, title: "Il Ritorno", beats: "Ritorno al presente. Gunner riappare nel corridoio esattamente quando era partito, ma trasformato e consapevole.", protagonists: ["Gunner"] }
        ]
      },
      {
        num: 9, title: "LA SCELTA DELLA REGINA DI PIETRA", goal: "Il confronto finale con Naim e l'accettazione della triade di regine.",
        scenes: [
          { num: 1, title: "Analisi", beats: "Gunner analizza il dipinto e rivela la sua origine (Cittadella di Martek).", protagonists: ["Gunner", "Lail", "Crystal"] },
          { num: 2, title: "Irruzione", beats: "Irruzione di Naim. La principessa nana esige rispetto. Gunner le confessa le sue paure e la accoglie come terza regina, unendo Iside, Sune ed Eilistraee.", protagonists: ["Gunner", "Naim", "Lail", "Crystal"] }
        ]
      },
      {
        num: 10, title: "LE OMBRE SI ALLUNGANO", goal: "L'assedio spirituale di Set (Anno Quinto).",
        scenes: [
          { num: 1, title: "Letargo", beats: "La città cade in un letargo grigio. Branko impila cubi e predice la fine della sabbia.", protagonists: ["Branko", "Gunner"] },
          { num: 2, title: "Veglia Notturna", beats: "Veglia notturna. Set attacca mentalmente il palazzo. Gunner e le sue donne resistono usando la Brace del Primo Giorno come scudo di luce.", protagonists: ["Gunner", "Lail", "Crystal", "Naim"] }
        ]
      },
      {
        num: 11, title: "DODICI VOCI ATTENDONO", goal: "Il sacrificio finale di Gunner.",
        scenes: [
          { num: 1, title: "Purificazione", beats: "Ritorno al dipinto. Elyanore tocca la tela: il suo fuoco purifica la corruzione di Set, aprendo il varco.", protagonists: ["Elyanore", "Gunner", "Lail", "Crystal", "Naim"] },
          { num: 2, title: "Il Verdetto", beats: "Il verdetto. Branko annuncia che è il momento. Gunner capisce che per sigillare il varco deve diventare il sacrificio (il Fulcro).", protagonists: ["Branko", "Gunner"] },
          { num: 3, title: "L'Addio", beats: "L'addio straziante. Lail, Crystal e Naim cercano di trattenerlo. Gunner affida loro la Brace e i figli.", protagonists: ["Gunner", "Lail", "Crystal", "Naim"] },
          { num: 4, title: "Il Sacrificio", beats: "Il Sacrificio. Gunner entra nel dipinto. Il portale si chiude. La magia svanisce dai figli (che tornano normali) e il sole del Calimshan sorge, ma più freddo.", protagonists: ["Gunner", "Branko", "Lail", "Crystal", "Naim"] }
        ]
      }
    ];

    // ---------------------------------------------------------
    // 4. UPSERT CHAPTERS & SCENES
    // ---------------------------------------------------------
    console.log("Sincronizzazione Capitoli e Scene...");
    for (const chData of structure) {
      // Upsert Chapter
      let chapter = await prisma.chapter.findFirst({
        where: { bookId, chapterNumber: chData.num }
      });

      if (chapter) {
        chapter = await prisma.chapter.update({
          where: { id: chapter.id },
          data: { title: chData.title, chapterGoal: chData.goal, orderIndex: chData.num }
        });
      } else {
        chapter = await prisma.chapter.create({
          data: { bookId, chapterNumber: chData.num, title: chData.title, chapterGoal: chData.goal, orderIndex: chData.num }
        });
      }

      console.log(`Capitolo ${chData.num}: ${chData.title}`);

      // Upsert Scenes
      for (const scData of chData.scenes) {
        // Resolve character IDs
        const characterIds = scData.protagonists
          .map(name => charMap[name])
          .filter(id => id !== undefined && id !== "");

        let scene = await prisma.scene.findFirst({
          where: { chapterId: chapter.id, sceneNumber: scData.num }
        });

        // 🚨 CRITICAL SAFEGUARD: UPDATE VS CREATE 🚨
        if (scene) {
          // UPDATE: Modify ONLY metadata. NEVER touch 'content'.
          await prisma.scene.update({
            where: { id: scene.id },
            data: {
              title: scData.title,
              promptGoals: scData.beats,
              orderIndex: scData.num,
              characters: {
                set: characterIds.map(id => ({ id })) // Resets connections to the new array
              }
            }
          });
          console.log(`  -> Update Scene ${scData.num} (Content preserved)`);
        } else {
          // CREATE: Initialize with empty content
          await prisma.scene.create({
            data: {
              chapterId: chapter.id,
              sceneNumber: scData.num,
              title: scData.title,
              promptGoals: scData.beats,
              orderIndex: scData.num,
              content: "", // Initialized empty
              characters: {
                connect: characterIds.map(id => ({ id }))
              }
            }
          });
          console.log(`  -> Create Scene ${scData.num}`);
        }
      }
    }

    console.log(`
--- SINCRONIZZAZIONE VOLUME 1 COMPLETATA CON SUCCESSO ---
`);

  } catch (error) {
    console.error("Errore durante la sincronizzazione:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncVolume1();
