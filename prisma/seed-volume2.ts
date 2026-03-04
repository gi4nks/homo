import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- STARTING VOLUME 2 MASS SEED ---");

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

  // 2. UPSERT MASTER CHARACTERS
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
    const c = await prisma.character.create({ data: { ...char, bookId } });
    characterMap[char.name] = c.id;
  }

  // 3. FULL STRUCTURE CHAPTERS 12 - 35
  const chapters = [
    {
      number: 12, title: "La Fornace del Cuore", goal: "Gunner entra nel dominio del Magma e accetta il dolore fisico come valuta.",
      scenes: [
        { number: 1, title: "L'Incontro con la Fiamma", protagonists: ["Gunner", "Ignis-Pyra"], prompt: "Incontro con Ignis-Pyra. Descrivi il calore insopportabile e la tragicità della gigantessa di roccia fusa." },
        { number: 2, title: "L'Enigma della Resistenza", protagonists: ["Gunner"], prompt: "Gunner affronta l'Enigma Cosmico sulla natura della resistenza: consumarsi lentamente." },
        { number: 3, title: "Il Prezzo della Carne", protagonists: ["Gunner"], prompt: "Apparizione della cicatrice elementale. Rivelazione: il legame è bilanciamento." }
      ]
    },
    {
      number: 13, title: "Sabbia Nera e Febbre", goal: "Instabilità del regno e ascesa politica di Lail.",
      scenes: [
        { number: 1, title: "Febbri Magiche", protagonists: ["Crystal", "Elyanore"], prompt: "Elyanore è malata. Crystal percepisce il battito di Gunner attraverso la Brace." },
        { number: 2, title: "Ombre sulla Capitale", protagonists: ["Lail", "Naim"], prompt: "Sabbia nera nei pozzi. Lail diventa fredda e strategica per gestire la crisi." }
      ]
    },
    {
      number: 14, title: "Le Radici del Potere", goal: "Dominio della Radice e prova della responsabilità.",
      scenes: [
        { number: 1, title: "Incontro con Veridiana", protagonists: ["Gunner", "Veridiana"], prompt: "Incontro con la driade millenaria il cui sistema nervoso è il piano stesso." },
        { number: 2, title: "La Prova delle Fondamenta", protagonists: ["Gunner"], prompt: "Risoluzione dell'enigma sulla stabilità delle proprie fondamenta morali." },
        { number: 3, title: "Invecchiamento Soggettivo", protagonists: ["Gunner"], prompt: "Gunner invecchia nel piano. L'equilibrio è tensione controllata." }
      ]
    },
    {
      number: 15, title: "Sogni di Serpi", goal: "Terrore per la fragilità dei figli e preparativi militari.",
      scenes: [
        { number: 1, title: "Incubi di Branko", protagonists: ["Lail", "Branko"], prompt: "Branko sogna serpenti. Lail è terrorizzata dalla vulnerabilità del figlio." },
        { number: 2, title: "Il Silenzio della Brace", protagonists: ["Naim", "Crystal"], prompt: "La reliquia di Pelor tace. Naim mobilita le riserve militari." }
      ]
    },
    {
      number: 16, title: "L'Abisso Stellare", goal: "Vuoto Astrale e sacrificio del fulcro.",
      scenes: [
        { number: 1, title: "Incontro con Aethelra", protagonists: ["Gunner", "Aethelra"], prompt: "Incontro nel Vuoto Astrale con l'entità di spazio negativo avvolta in nebulose." },
        { number: 2, title: "Difesa del Vuoto", protagonists: ["Gunner"], prompt: "Difesa di Aethelra da entità esterne che vogliono consumare il vuoto." },
        { number: 3, title: "Sacrificio del Fulcro", protagonists: ["Gunner"], prompt: "Perdita di un incantesimo chiave. Il fulcro deve soffrire per reggere." }
      ]
    },
    {
      number: 17, title: "Mura Incise", goal: "Apparizione di simboli di Set e rivolta politica.",
      scenes: [
        { number: 1, title: "Segni sulla Reliquia", protagonists: ["Crystal"], prompt: "La Brace emette bagliori. Crystal studia i segni elementali apparsi." },
        { number: 2, title: "Il Marchio di Set", protagonists: ["Naim"], prompt: "Simboli del serpente sulle mura. Naim contiene la rivolta dei nobili." }
      ]
    },
    {
      number: 18, title: "L'Oceano del Rimorso", goal: "Mare Profondo e rinuncia alle ancore emotive.",
      scenes: [
        { number: 1, title: "Incontro con Thalassa", protagonists: ["Gunner", "Thalassa"], prompt: "Incontro con la creatura d'acqua che riflette le emozioni represse." },
        { number: 2, title: "Circolazione del Potere", protagonists: ["Gunner"], prompt: "Rinuncia a un'ancora emotiva. Il potere è circolazione, non accumulo." },
        { number: 3, title: "Il Sole Sbiadito", protagonists: ["Gunner"], prompt: "Il sole si raffredda. Gunner percepisce l'agonia del Calimshan." }
      ]
    },
    {
      number: 19, title: "Osservatori Stranieri", goal: "Arrivo di emissari e morale in caduta.",
      scenes: [
        { number: 1, title: "L'Emissario", protagonists: ["Lail"], prompt: "Arrivo di un emissario straniero. Le voci nel vento logorano la corte." },
        { number: 2, title: "Comunicazione Fallita", protagonists: ["Crystal"], prompt: "Crystal tenta di contattare Gunner nel Mare Profondo. Fallimento totale." }
      ]
    },
    {
      number: 20, title: "La Tempesta Immediata", goal: "Dominio del Fulmine e duello magico fulmineo.",
      scenes: [
        { number: 1, title: "Astra-Vult", protagonists: ["Gunner", "Astra-Vult"], prompt: "Incontro con il fulmine senziente in corazza di bronzo." },
        { number: 2, title: "Duello di Velocità", protagonists: ["Gunner"], prompt: "Duello magico mortale. Ogni decisione deve essere istantanea." },
        { number: 3, title: "Il Ricordo di Lail", protagonists: ["Gunner"], prompt: "Vittoria pagata con un ricordo di Lail. Il prezzo del sacrificio scelto." }
      ]
    },
    {
      number: 21, title: "Ombre Autonome", goal: "Razionamenti e fenomeni soprannaturali nelle strade.",
      scenes: [
        { number: 1, title: "Ombre Staccate", protagonists: ["Naim"], prompt: "Razionamenti duri. Le ombre iniziano a staccarsi dai corpi dei cittadini." },
        { number: 2, title: "Consiglio di Reggenza", protagonists: ["Lail"], prompt: "I nobili tentano il colpo di stato sfruttando il caos climatico." }
      ]
    },
    {
      number: 22, title: "La Verità Rifratta", goal: "Piano del Cristallo e duello contro la menzogna.",
      scenes: [
        { number: 1, title: "Krystallia", protagonists: ["Gunner", "Krystallia"], prompt: "Incontro con la principessa geometrica che parla con la luce." },
        { number: 2, title: "Duello di Verità", protagonists: ["Gunner"], prompt: "Duello dove ogni bugia crea una frattura fisica nel corpo di Gunner." },
        { number: 3, title: "Svenimento Reale", protagonists: ["Gunner"], prompt: "Comprendere che il fulcro deve soffrire. Una delle regine sviene nel mondo reale." }
      ]
    },
    {
      number: 23, title: "Voci nel Vento", goal: "Febbre ricorrente e sussurri maligni a corte.",
      scenes: [
        { number: 1, title: "Sussurri tra la Servitù", protagonists: ["Crystal", "Elyanore"], prompt: "Elyanore di nuovo febbricitante. Sussurri maligni corrono tra i servi." },
        { number: 2, title: "Pedine Fredde", protagonists: ["Lail"], prompt: "Il Consiglio guadagna terreno. Lail deve muovere pedine politiche con freddezza." }
      ]
    },
    {
      number: 24, title: "Ceneri del Passato", goal: "Piano della Cenere e valore del fallimento.",
      scenes: [
        { number: 1, title: "Ashen-Ra", protagonists: ["Gunner", "Ashen-Ra"], prompt: "Incontro con lo spirito di fumo e rimpianto tra le rovine." },
        { number: 2, title: "Enigma del Fallimento", protagonists: ["Gunner"], prompt: "Trovare il valore negli errori passati per sbloccare la circolazione." },
        { number: 3, title: "Silenzio Totale", protagonists: ["Gunner"], prompt: "La Brace tace del tutto. Gunner è solo nel buio assoluto." }
      ]
    },
    {
      number: 25, title: "La Rivolta di Set", goal: "Rivolta del culto e assedio al palazzo.",
      scenes: [
        { number: 1, title: "Dichiarazione di Morte", protagonists: ["Naim"], prompt: "Il culto dichiara Gunner morto. Naim schiaccia la rivolta nelle strade." },
        { number: 2, title: "Ombre Sussurranti", protagonists: ["Crystal", "Lail"], prompt: "Le ombre assediano il palazzo e iniziano a sussurrare segreti oscuri." }
      ]
    },
    {
      number: 26, title: "Il Gelo Conservatore", goal: "Piano del Ghiaccio e accettazione della solitudine.",
      scenes: [
        { number: 1, title: "Signore Kryos", protagonists: ["Gunner", "Kryos"], prompt: "Incontro con la figura di ghiaccio azzurro che congela il tempo." },
        { number: 2, title: "Natura Solitaria", protagonists: ["Gunner"], prompt: "Accettazione della solitudine del potere. Il legame è bilanciamento." },
        { number: 3, title: "Volto Perduto", protagonists: ["Gunner"], prompt: "Gunner dimentica un momento con Crystal per poter avanzare." }
      ]
    },
    {
      number: 27, title: "L'Esercito delle Ombre", goal: "Istituzione della guardia d'élite e terrore dei nobili.",
      scenes: [
        { number: 1, title: "Guardia d'Elite", protagonists: ["Naim"], prompt: "Lampo della Brace. Naim crea una guardia fedele solo a lei." },
        { number: 2, title: "Risolutezza di Naim", protagonists: ["Naim"], prompt: "Seconda ondata di sabbia nera. I nobili tremano davanti a Naim." }
      ]
    },
    {
      number: 28, title: "La Sabbia dell'Anima", goal: "Sabbia del Tempo ed erosione dell'identità.",
      scenes: [
        { number: 1, title: "Principessa Khrone", protagonists: ["Gunner", "Khrone"], prompt: "Incontro con l'entità fatta di clessidre e polvere dorata." },
        { number: 2, title: "Deserto d'Identità", protagonists: ["Gunner"], prompt: "Viaggio in un deserto che divora chi sei ad ogni passo compiuto." },
        { number: 3, title: "Limite del Salvatore", protagonists: ["Gunner"], prompt: "Rivelazione: non puoi salvare tutti. Perdita di un incantesimo fondamentale." }
      ]
    },
    {
      number: 29, title: "Sogni e Razioni", goal: "Acqua contaminata e incubi infantili.",
      scenes: [
        { number: 1, title: "Razionamento", protagonists: ["Naim", "Branko"], prompt: "Naim raziona l'acqua nera. I bambini sognano i servi di Set." },
        { number: 2, title: "L'Attesa di Lail", protagonists: ["Lail"], prompt: "Lail osserva l'orizzonte. Discrepanza temporale tra Gunner e il mondo." }
      ]
    },
    {
      number: 30, title: "L'Origine della Luce", goal: "Luce Primordiale e sacrificio finale della fede.",
      scenes: [
        { number: 1, title: "Lux-Anima", protagonists: ["Gunner", "Lux-Anima"], prompt: "Incontro con il sole angelico in miniatura." },
        { number: 2, title: "Luce Interna", protagonists: ["Gunner"], prompt: "Rinuncia alla luce esterna per quella interna. La Brace tace fuori." },
        { number: 3, title: "Invecchiamento Finale", protagonists: ["Gunner"], prompt: "Gunner invecchia ancora. Il fulcro deve soffrire per reggere il piano." }
      ]
    },
    {
      number: 31, title: "Distacco Totale", goal: "Caduta dei sigilli reali e ombre libere.",
      scenes: [
        { number: 1, title: "Sigilli Reali", protagonists: ["Lail"], prompt: "Il sole è freddo. Il Consiglio tenta di sottrarre i sigilli a Lail." },
        { number: 2, title: "Città Terrorizzata", protagonists: ["Naim"], prompt: "Le ombre dei cittadini vagano libere e terrorizzano Calimshan." }
      ]
    },
    {
      number: 32, title: "L'Ala del Vento", goal: "Piano del Vento e circolazione finale.",
      scenes: [
        { number: 1, title: "Zephyra", protagonists: ["Gunner", "Zephyra"], prompt: "Incontro con lo spirito inafferrabile delle correnti d'aria." },
        { number: 2, title: "Rinuncia al Peso", protagonists: ["Gunner"], prompt: "Rinuncia ai manufatti fisici per volare. Nuova cicatrice elementale." },
        { number: 3, title: "L'Ultima Porta", protagonists: ["Gunner"], prompt: "Rivelazione finale sulla circolazione. Gunner è pronto per la fine." }
      ]
    },
    {
      number: 33, title: "Il Traditore del Tempio", goal: "Scoperta del corrotto e salto temporale.",
      scenes: [
        { number: 1, title: "Sacerdote di Set", protagonists: ["Naim"], prompt: "Scoperto traditore nel tempio. Gridano che il Faraone è morto." },
        { number: 2, title: "Mese di Assenza", protagonists: ["Lail", "Crystal"], prompt: "È passato un mese intero. Gli equilibri politici sono stravolti." }
      ]
    },
    {
      number: 34, title: "L'Identità Nera", goal: "Ombra Elementale e difesa dell'identità.",
      scenes: [
        { number: 1, title: "Umbra-Nix", protagonists: ["Gunner", "Umbra-Nix"], prompt: "Incontro con il riflesso oscuro che mette in dubbio l'ego di Gunner." },
        { number: 2, title: "Parassita di Set", protagonists: ["Gunner"], prompt: "Difesa dell'identità da un parassita che vuole divorare l'anima." },
        { number: 3, title: "L'Ombra Necessaria", protagonists: ["Gunner"], prompt: "L'ombra è parte del sistema. Perdita dell'ultimo incantesimo." }
      ]
    },
    {
      number: 35, title: "Il Ritorno e il Caos Temporale", goal: "Confronto finale con il Consiglio.",
      scenes: [
        { number: 1, title: "Il Ritorno", protagonists: ["Gunner"], prompt: "Gunner esce dalla tela. Fenomeni di Déjà-vu temporali massicci." },
        { number: 2, title: "Confronto Finale", protagonists: ["Gunner"], prompt: "Gunner affronta il Consiglio. Un Mago stanco, invecchiato e segnato." }
      ]
    }
  ];

  // 4. EXECUTE INSERTION
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const createdChapter = await prisma.chapter.create({
      data: {
        bookId,
        title: ch.title,
        chapterNumber: ch.number,
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
          sceneNumber: sc.number,
          orderIndex: j + 1,
          promptGoals: sc.prompt,
          characters: {
            connect: sc.protagonists.map(p => ({ id: characterMap[p] })).filter(p => !!p.id)
          }
        }
      });
    }
  }

  console.log("--- SEED COMPLETED SUCCESSFULLY: VOLUME 2 CREATED ---");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
