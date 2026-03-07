import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jsonData = {
    "Sinossi": "Gathor Leapmind, un tempo il freddo sacerdote della morte Evrym, torna nel Calimshan come il Faraone Gunner dopo aver risvegliato il mago Martek. Cambiato nel corpo e nello spirito, Gunner deve governare un impero assediato dall'ombra del dio Set mentre lotta con il peso del suo immenso potere psionico e divino. Attraverso la nascita di due figli segnati dal destino e l'apprendimento della brutale legge della Compensazione (Do Ut Des) nel Nagarrakam, Gunner comprende che per salvare la sua famiglia e il suo regno deve compiere l'estremo sacrificio, diventando il fulcro umano necessario a sigillare un varco cosmico distruttivo.",
    "CharactersList": [
      { "Nome": "Gathor 'Gunner' Leapmind", "Ruolo": "Protagonista, Faraone del Calimshan", "Descrizione": "Ex sacerdote di Kelemvor (Evrym), ora chierico di Pelor e potente psionico. Tormentato dal fallimento passato con Aranel e dal terrore di perdere il controllo." },
      { "Nome": "Lail", "Ruolo": "Prima Moglie, Paladina di Sune", "Descrizione": "Guerriera radiosa e pragmatica. Rappresenta la 'Fiamma' e la forza marziale dell'Harem. Madre di Branko." },
      { "Nome": "Crystal", "Ruolo": "Seconda Moglie, Sacerdotessa di Eilistraee", "Descrizione": "Elfa scura (Drow) devota alla redenzione e al canto lunare. Rappresenta l'equilibrio e la saggezza. Madre di Elyanore." },
      { "Nome": "Naim", "Ruolo": "Terza Moglie, Principessa Nanica", "Descrizione": "Sorella di Lavvya e devota di Iside. Inizialmente rifiutata per calcolo politico, diventa il pilastro della 'Pietra' nell'Harem." },
      { "Nome": "Branko il Giovane", "Ruolo": "Figlio di Gunner e Lail", "Descrizione": "Bambino con onniscienza precoce e poteri psionici inquietanti. Vede il futuro e funge da catalizzatore profetico." },
      { "Nome": "Elyanore", "Ruolo": "Figlia di Gunner e Crystal", "Descrizione": "Bambina dalla pelle color cenere, priva di poteri mentali ma portatrice del marchio della fenice. È il fuoco purificatore." },
      { "Nome": "Set", "Ruolo": "Antagonista, Dio Oscuro", "Descrizione": "Entità malevola che agisce attraverso sussurri, possessioni e corruzione astrale. Usa i traumi di Gunner per destabilizzare il regno." },
      { "Nome": "Branko il Vecchio", "Ruolo": "Padre di Gunner, Guardiano del Tempo", "Descrizione": "Mentore e guida che introduce Gunner alla scuola del Do Ut Des e al Nagarrakam." }
    ],
    "Stile di scrittura del libro": {
      "Genere": "Dark High Fantasy / Grimdark Psicologico",
      "Caratteristiche": [
        "Paratassi: Frasi brevi e martellanti per aumentare la tensione.",
        "Sensorialità: Descrizioni basate su odori, temperature e dolore fisico.",
        "Show Don't Tell: Emozioni trasmesse attraverso reazioni corporee (bile, sangue dal naso, tremori).",
        "Magia Transazionale: Il potere ha sempre un costo fisico (Scuola del Do Ut Des)."
      ]
    },
    "Capitoli": [
      {
        "Capitolo nr": 1, "Titolo del Capitolo": "Il Sole e l'Incudine", "Contesto del Capitolo": "Il ritorno di Gunner nella capitale e l'immediato scontro con la realtà politica e il suo logorante potere.",
        "Scene": [
          { "Titolo della scena": "Il peso della corona", "Contesto della Scena": "Gunner osserva la capitale dalla terrazza, schiacciato dal rumore mentale dei sudditi.", "Protagonista/i della Scena": "Gunner", "Testo della scena": "Il vento del Calimshan non accarezzava mai; scuoiava... Appoggiò entrambe le mani sulla balaustra di marmo rovente. Il calore fisico della pietra era quasi un sollievo rispetto al rumore che aveva nel cranio... Per una frazione di secondo, Gunner provò un desiderio orribile: voleva spegnerli. Voleva usare la mente per zittire tutte quelle piccole vite e godersi un minute di fottuto silenzio." },
          { "Titolo della scena": "L'ultimatum di Tordek", "Contesto della Scena": "L'incontro diplomatico con l'emissario nanico che esige il matrimonio con Naim.", "Protagonista/i della Scena": "Gunner, Lord Tordek", "Testo della scena": "«La principessa Naim si è stancata di aspettare,» abbaiò Tordek... Gunner non si voltò subito. Il nome di Naim gli calò nello stomaco come piombo. Perché non riusciva a dire di sì?... «Il matrimonio è sospeso.» Gunner proiettò una leggerissima onda di pressione psionica, appena sufficiente a far ammutolire il nano, ma il gesto gli costò una fitta di nausea." }
        ]
      },
      {
        "Capitolo nr": 2, "Titolo del Capitolo": "I Giardini Chiusi", "Contesto del Capitolo": "Gunner cerca rifugio nell'unico luogo sicuro, svelando la sua vulnerabilità alle mogli.",
        "Scene": [
          { "Titolo della scena": "La maschera che cade", "Contesto della Scena": "Gunner entra nell'harem e crolla fisicamente davanti a Lail e Crystal.", "Protagonista/i della Scena": "Gunner, Lail, Crystal", "Testo della scena": "Non appena scattò il chiavistello, l’infallibile Faraone crollò. Gunner si sfilò la pesante gorgiera d’oro, la lasciò cadere a terra con un rumore metallico e si appoggiò al muro... «Sembri uno straccio, Gunner.» La voce di Lail non aveva niente di sacro in quel momento... Crystal si inginocchiò e gli posò le mani sulle tempie... «L'hai fatto per questioni di stato, o perché hai ancora gli incubi su Aranel?»" },
          { "Titolo della scena": "Il patto con l'acqua", "Contesto della Scena": "Gunner evoca la djinni Safiya per proteggere l'harem.", "Protagonista/i della Scena": "Gunner, Safiya", "Testo della scena": "«Safiya...» chiamò, proiettando il pensiero nell'acqua... «Proteggile,» le parole gli uscirono di bocca secche, disperate. «Quando non ci sarò... se il veleno di Set oserà toccare quest'acqua, annegalo.» Safiya lo studiò. Vide la crepa nell’armatura dell’uomo. Allungò una mano fluida. «Affare fatto, Faraone impaurito.»" }
        ]
      },
      {
        "Capitolo nr": 3, "Titolo del Capitolo": "Sussurri nella Sabbia", "Contesto del Capitolo": "La scoperta dell'infiltrazione di Set e il primo fatale errore di Gunner.",
        "Scene": [
          { "Titolo della scena": "Lo stupro mentale", "Contesto della Scena": "Gunner interroga lo scriba Kaelen nelle celle sotterranee.", "Protagonista/i della Scena": "Gunner, Kaelen", "Testo della scena": "Posare le mani a forza sulla mente di qualcuno era una violenza che lo tormentava... Gunner strinse la sua morsa psionica sul ricordo... Nella visione, il serpente di polvere si voltò verso di lui... Usò una voce femminile. «Fai pena, Evrym,» sussurrò Set, usando il tono deluso di Aranel... Il panico prese il sopravvento... Kaelen era accasciato sulle catene. Morto." },
          { "Titolo della scena": "Il mostro più splendente", "Contesto della Scena": "Gunner rigetta bile e realizza la propria natura brutale, prima di rifugiarsi da Crystal.", "Protagonista/i della Scena": "Gunner, Crystal", "Testo della scena": "Il Faraone cadde in ginocchio, rigettando bile sul pavimento sporco... Il sapore amaro che gli impastava la bocca gli ricordò che la corona non lo aveva reso un dio infallibile, ma solo un mostro più spietato... Trovò Crystal al balcone... «Avremo una figlia,» disse Crystal, un sorriso spaventato ma fiero sulle labbra." }
        ]
      },
      {
        "Capitolo nr": 4, "Titolo del Capitolo": "Cenere Bianca", "Contesto del Capitolo": "La nascita traumatica di Elyanore e la scoperta della sua anomalia.",
        "Scene": [
          { "Titolo della scena": "La stanza della fornace", "Contesto della Scena": "Il parto di Crystal in una stanza satura di calore magico.", "Protagonista/i della Scena": "Gunner, Crystal, Lail", "Testo della scena": "La notte del parto fu puro panico. Il cielo fuori era livido. Crystal gemeva... lottando per ogni respiro in una stanza che sembrava l’interno di una fornace... Poi, la bambina uscì. Non ci fu un vagito trionfale. Sentirono solo un verso secco, come lo scricchiolio di un ramo gettato nel fuoco." },
          { "Titolo della scena": "Il vuoto psionico", "Contesto della Scena": "Gunner prova a toccare la mente della figlia e scopre che è muta alla psionica.", "Protagonista/i della Scena": "Gunner, Elyanore", "Testo della scena": "Disperato, fece la cosa più istintiva per lui: lanciò una piccola, delicata sonda psionica... Rimbalzò contro il vuoto. Nessuna energia... La bambina era un buco nero psionico. «È vuota, Lail. È muta!»... E Gunner lo vide. Sul palmo destro, inciso nella pelle cinerea, un marchio rosso vivo. Una fenice." }
        ]
      },
      {
        "Capitolo nr": 5, "Titolo del Capitolo": "Oro e Veleno", "Contesto del Capitolo": "Il perdono di Aranel e la difesa del pozzo sacro del Tempio.",
        "Scene": [
          { "Titolo della scena": "La Brace del Primo Giorno", "Contesto della Scena": "Marianek consegna a Gunner la reliquia di Pelor e un messaggio dall'aldilà.", "Protagonista/i della Scena": "Gunner, Marianek", "Testo della scena": "«Aranel è venuta da me. In sogno.» Gunner smise di respirare... «Non lo dire,» sussurrò Gunner, chiudendo gli occhi. La maschera del dio sole si sgretolò... Marianek estrasse uno scrigno... un globo perfetto di cristallo caldo: la Brace del Primo Giorno... Quando le sue dita sfiorarono la reliquia, il cristallo si accese. Era la sensazione dell’assoluzione." },
          { "Titolo della scena": "Sangue nella cripta", "Contesto della Scena": "Gunner e Lail sventano l'avvelenamento del pozzo sacro.", "Protagonista/i della Scena": "Gunner, Lail", "Testo della scena": "Gunner sollevò la Brace del Primo Giorno. Not la controllò con eleganza; riversò in essa tutta la sua rabbia, la sua paura... Il cristallo emise un fascio di luce abbacinante... Lail non esitò. Si avventò su di lui, sguainando la spada di mithral e decapitandolo... Gunner crollò contro il muretto del pozzo, il fiato raschiante." }
        ]
      },
      {
        "Capitolo nr": 6, "Titolo del Capitolo": "L'Occhio che Vede", "Contesto del Capitolo": "La nascita del figlio profetico e la minaccia diretta ai figli da parte di Set.",
        "Scene": [
          { "Titolo della scena": "Il giudizio del neonato", "Contesto della Scena": "Nascita di Branko e l'impatto telepatico sulla stanza.", "Protagonista/i della Scena": "Gunner, Lail, Branko il Giovane", "Testo della scena": "Quando il bambino uscì, non ci fu il minimo suono. Invece, un’onda d’urto telepatica si schiantò contro le menti di tutti i presenti... I suoi occhi erano pozzi di ghiaccio azzurro e brillante... Lo fissavano con l’intensità di un magistrato che sta leggendo una condanna. Gunner si sentì nudo, giudicato." },
          { "Titolo della scena": "Il cratere del serpente", "Contesto della Scena": "Set tenta di rapire Branko dai sotterranei, Gunner sigilla il buco fondendo la roccia.", "Protagonista/i della Scena": "Gunner, Set", "Testo della scena": "«Il tuo piccolo occhio di vetro vede troppo. Sarà un onore strappargli la vista e berne il sangue.»... Gunner non provò rabbia divina. Provò un terrore cieco... Allineò i suoi sedici cerchi in una disperata ghigliottina psichica e aprì la reliquia... La pietra viva attorno al buco fuse all’istante, vetrificandosi." }
        ]
      },
      {
        "Capitolo nr": 7, "Titolo del Capitolo": "Segni di Rovina", "Contesto del Capitolo": "Consacrazione della dinastia e l'esecuzione del traditore Lord Vane.",
        "Scene": [
          { "Titolo della scena": "L'eclissi divina", "Contesto della Scena": "Miracolo solare durante il battesimo dei bambini al Tempio.", "Protagonista/i della Scena": "Gunner, Lail, Crystal", "Testo della scena": "Il sole fu coperto da un’ombra perfetta... una pioggia di cenere magica e petali rosati cadde sulla folla... Ma Gunner non sorrise. Guardò quel cielo diviso a metà... e sentì solo nausea. Non era una benedizione. Era un bersaglio disegnato sui suoi figli." },
          { "Titolo della scena": "Il sapore del rame", "Contesto della Scena": "Branko smaschera Lord Vane durante un banchetto, portando alla sua esecuzione.", "Protagonista/i della Scena": "Branko il Giovane, Gunner, Lail", "Testo della scena": "«Lui sa di rame e di scaglie,» disse Branko... Gunner si alzò lentamente... ignorò le sue suppliche e gli incollò due dita sulla fronte. Il tumore era lì... Davanti agli occhi atterriti della corte, nel cortile del Tempio, Lail calò la spada sul collo di Vane." }
        ]
      },
      {
        "Capitolo nr": 8, "Titolo del Capitolo": "Oltre il Velo del Nagarrakam", "Contesto del Capitolo": "L'addestramento quinquennale di Gunner nella scuola del Contrappasso.",
        "Scene": [
          { "Titolo della scena": "La transazione di sangue", "Contesto della Scena": "Gunner entra nel Nagarrakam e impara brutalmente la legge della Compensazione.", "Protagonista/i della Scena": "Gunner, Branko il Vecchio", "Testo della scena": "Gunner provò istintivamente a evocare una piccola fiamma divina... L’incantesimo non si accese. Al contrario, Gunner sentì l’aria nei polmoni sparire di colpo... una fitta lancinante gli trafisse il palmo... «La magia qui non è un dono... È una transazione. Benvenuto nella Compensazione.»" },
          { "Titolo della scena": "Il ritorno del Faraone", "Contesto della Scena": "Gunner torna alla corte dopo cinque anni, trasformato in un blocco di gravità silenziosa.", "Protagonista/i della Scena": "Gunner, Lail, Crystal", "Testo della scena": "L’aura strabordante del Faraone era ancora lì, ma era contenuta, focalizzata. Attorno alle sue mani sfrigolava una sottile opalescenza... Lail arretrò, istintivamente spaventata... «Gunner... sei tu?»... «Ho imparato a non lottare disarmato contro le leggi del cosmo,» rispose Gunner, la voce risoluta." }
        ]
      },
      {
        "Capitolo nr": 9, "Titolo del Capitolo": "La Scelta della Regina di Pietra", "Contesto del Capitolo": "La verità sul dipinto di Martek e l'unione definitiva con Naim.",
        "Scene": [
          { "Titolo della scena": "L'Harem di Iside", "Contesto della Scena": "Naim irrompe nell'harem reclamando il suo posto e Gunner si apre alla sua vulnerabilità.", "Protagonista/i della Scena": "Gunner, Naim", "Testo della scena": "«Volevo solo non essere sola a sopportare questa corona...» Gunner non eresse le solite difese mentali per scacciarla. Guardò Naim e vi trovò lo stesso riflesso della sua stessa estenuante solitudine... «Sarete tre regine. La Fiamma di Sune, il Canto di Eilistraee e la Roccia di Iside.»" },
          { "Titolo della scena": "Il soffio del Quinto Anno", "Contesto della Scena": "Il tempo inizia a rompersi mentre la triade si unisce.", "Protagonista/i della Scena": "Gunner, Lail, Crystal, Naim", "Testo della scena": "Dietro di loro, la galleria fu attraversata da un soffio gelido. Sul dipinto di Martek i colori si spensero in un grigio livido, e le ombre proiettate dalle torce iniziarono ad allungarsi innaturalmente... L’Anno Quinto stava arrivando, e portava con sé la Notte Infinita." }
        ]
      },
      {
        "Capitolo nr": 10, "Titolo del Capitolo": "Le Ombre si Allungano", "Contesto del Capitolo": "L'assedio occulto di Set e la difesa spirituale guidata dalla Brace.",
        "Scene": [
          { "Titolo della scena": "La veglia dorata", "Contesto della Scena": "La reliquia di Pelor brilla per una notte intera respingendo l'orrore sottile.", "Protagonista/i della Scena": "Gunner, Lail, Crystal, Naim", "Testo della scena": "L’unica cosa che si contrappose al buio fu la Brace del Primo Giorno... Iniziò a brillare. Non fu un lampo accecante, ma un bagliore ostinato... Gunner teneva attivi i suoi scudi psionici, faticando a mantenere l’ordine mentale... Crystal intonava un antico canto a Eilistraee." },
          { "Titolo della scena": "Il Contrappasso", "Contesto della Scena": "Gunner assorbe il danno psionico nel ricettacolo per salvare le mogli sfiancate.", "Protagonista/i della Scena": "Gunner", "Testo della scena": "Quattro vipere d’ombra... si tuffarono addosso a lui... Gunner non eresse muri psionici. Aprì le braccia e spense le sue difese. Compensa. Prendi tu il male... Il dolore fisico fu atroce... Gunner emise un urlo strozzato... Lui si era preso il loro dolore in un singolo respiro." }
        ]
      },
      {
        "Capitolo nr": 11, "Titolo del Capitolo": "Dodici Voci Attendono", "Contesto del Capitolo": "Il sacrificio finale di Gunner per chiudere il varco di Set.",
        "Scene": [
          { "Titolo della scena": "Il tocco della cenere", "Contesto della Scena": "Elyanore purifica il dipinto con il suo marchio, aprendo la via pulita.", "Protagonista/i della Scena": "Elyanore, Gunner", "Testo della scena": "Elyanore sfiorò la superficie del quadro... la voglia a forma di fenice sul suo palmo si illuminò di un rosso rubino... la bruma nera di Set fremette e indietreggiò... Il varco era aperto e pulito, ma proprio per questo, ora era una porta spalancata su due mondi... Branko si voltò: «È il momento.»" },
          { "Titolo della scena": "L'ultima esitazione", "Contesto della Scena": "Le mogli cercano di fermarlo; Gunner esita sulla soglia prima di scegliere il sacrificio.", "Protagonista/i della Scena": "Gunner, Lail, Naim, Crystal", "Testo della scena": "Lail lo afferrò per i baveri... «No! Non osare scappare!»... Gunner si voltò a guardarle un'ultima volta... In quel momento esitò. Il terrore assoluto lo paralizzò. Voleva restare. L’egoismo gli esplose nel petto... Poi, un dolore acuto, rovente... Ti ho ripagato, Aranel... Gathor Leapmind fece un passo in avanti." },
          { "Titolo della scena": "Il sole freddo", "Contesto della Scena": "Conseguenze del sacrificio: la Brace si incrina e il mondo cambia.", "Protagonista/i della Scena": "Lail, Crystal, Naim", "Testo della scena": "Una crepa profonda spaccò a metà il cristallo un tempo perfetto... Branko si accasciò...confuso e terrorizzato. «Papà?»... La voglia di Elyanore sfrigolò un’ultima volta, prima di spegnersi... Fuori dal palazzo... L’alba sorse sul Calimshan. Nessuno si accorse che il sole era più freddo." }
        ]
      }
    ]
  };

  try {
    console.log("--- STARTING IMPORT: VOLUME I ---");

    // 1. CREATE BOOK
    const styleString = jsonData["Stile di scrittura del libro"].Caratteristiche.join('\n');
    const book = await prisma.book.create({
      data: {
        title: "LE CRONACHE DELLA COMPENSAZIONE - VOLUME I",
        synopsis: jsonData.Sinossi,
        tone: styleString,
        genre: jsonData["Stile di scrittura del libro"].Genere,
        status: "Drafting"
      }
    });

    const bookId = book.id;
    console.log(`Created Book: ${book.title} (${bookId})`);

    // 2. CREATE CHARACTERS
    const charMap: Record<string, string> = {};
    for (const char of jsonData.CharactersList) {
      const createdChar = await prisma.character.create({
        data: {
          name: char.Nome,
          role: char.Ruolo,
          description: char.Descrizione,
          bookId
        }
      });
      charMap[char.Nome] = createdChar.id;
      
      // Secondary aliases for mapping
      if (char.Nome.includes("'")) {
        const nickname = char.Nome.split("'")[1];
        charMap[nickname] = createdChar.id;
      }
      if (char.Nome.includes(" ")) {
        const firstName = char.Nome.split(" ")[0];
        charMap[firstName] = createdChar.id;
      }
    }

    // 3. CREATE CHAPTERS & SCENES
    for (const chData of jsonData.Capitoli) {
      const chapter = await prisma.chapter.create({
        data: {
          bookId,
          chapterNumber: chData["Capitolo nr"],
          orderIndex: chData["Capitolo nr"],
          title: chData["Titolo del Capitolo"],
          chapterGoal: chData["Contesto del Capitolo"]
        }
      });

      for (let i = 0; i < chData.Scene.length; i++) {
        const scData = chData.Scene[i];
        const protagonists = scData["Protagonista/i della Scena"].split(',').map(s => s.trim());
        const linkIds = protagonists
          .map(name => {
            if (charMap[name]) return charMap[name];
            const key = Object.keys(charMap).find(k => k.includes(name) || name.includes(k));
            return key ? charMap[key] : null;
          })
          .filter(id => !!id) as string[];

        await prisma.scene.create({
          data: {
            chapterId: chapter.id,
            sceneNumber: i + 1,
            orderIndex: i + 1,
            title: scData["Titolo della scena"],
            promptGoals: scData["Contesto della Scena"],
            content: `<p>${scData["Testo della scena"]}</p>`,
            characters: {
              connect: linkIds.map(id => ({ id }))
            }
          }
        });
      }
      console.log(`Imported Chapter ${chData["Capitolo nr"]}`);
    }

    console.log("--- IMPORT COMPLETED SUCCESSFULLY ---");

  } catch (error) {
    console.error("Import Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
