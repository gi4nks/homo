# 📖 HOMO: Manuale dell'Architettura AI e Workflow di Scrittura

Questo documento illustra il funzionamento del motore di intelligenza artificiale integrato in HOMO. L'IA di HOMO non è concepita come un "ghostwriter" che genera interi capitoli dal nulla, ma come un **co-pilota contestuale**. Il sistema è basato su un'architettura modulare (Prompt CMS) che divide il processo creativo in fasi distinte, garantendo all'autore il controllo totale su trama, stile e coerenza.

---

## 1. Il Cuore del Sistema: Il Prompt CMS e le Variabili

Il motore di HOMO non usa mai un singolo "prompt universale". Utilizza invece una libreria di **Prompt Template** salvati nel database.

Ogni template è costruito con una serie di "buchi" (variabili racchiuse tra doppie parentesi graffe, es. `{{sceneGoal}}`). Quando l'utente invoca l'IA, il sistema (il file `prompt-builder`) cattura i dati dall'interfaccia utente in tempo reale, li inserisce in queste variabili e spedisce il pacchetto completo al modello AI.

Le variabili principali sono:

* `{{taskInstruction}}`: Il comando testuale digitato dall'utente (es. *"Rendilo più crudo"*).
* `{{taskGoal}}`: Il bersaglio dell'azione. A seconda del contesto, può essere il testo evidenziato nell'editor oppure i "Beats" scritti nell'Inspector.
* `{{sceneGoal}}` / `{{sceneCast}}`: Dati presi direttamente dai campi dell'Inspector (Obiettivo della scena, Personaggi presenti).
* `{{aiPersonaPrompt}}`: Le istruzioni stilistiche del "Regista" attualmente selezionato (es. *The Dark Epic Poet*).

---

## 2. La Pipeline di Scrittura: Le 6 Modalità

Il Prompt CMS è categorizzato in diverse fasi logiche. È fondamentale usare il template corretto per la fase in cui ci si trova.

### 🌍 1. WORLDBUILDING (La Fondazione)

* **Template:** `HOMO Lore Archivist V1`
* **Scopo:** Creare regole del mondo, schede personaggio, religioni, sistemi magici.
* **Input dell'utente:** Una breve idea (es. *"I Djinni soffrono il freddo"*).
* **Output dell'IA:** Un documento enciclopedico e strutturato con titoli e liste, da salvare nelle note di Lore. Non genera prosa narrativa.

### 🏗️ 2. OUTLINING (La Struttura)

* **Template:** `HOMO Scene Architect V1`
* **Scopo:** Sbrogliare la trama e creare la scaletta tattica di una scena.
* **Input dell'utente:** Un riassunto grezzo (es. *"Gunner incontra Tordek e litigano per il matrimonio"*).
* **Output dell'IA:** Un elenco puntato di "Beat" narrativi che mostrano l'escalation del conflitto. Da copiare nell'Inspector.

### ✍️ 3. DRAFTING (La Stesura)

* **Template:** `HOMO Standard V1`
* **Scopo:** Generare la prosa letteraria vera e propria.
* **Input dell'utente:** I "Beats" scritti nell'Inspector e la "AI Persona" selezionata.
* **Output dell'IA:** Paragrafi di testo formattato, dialoghi e descrizioni che seguono esattamente le direttive dei Beats e lo stile della Persona.

### 🔪 4. EDITING (La Revisione)

* **Template:** `HOMO Line Editor V1`
* **Scopo:** Pulire e lucidare la prosa già scritta dall'autore. Applica la regola dello *Show, Don't Tell*, taglia gli avverbi e rafforza i verbi.
* **Input dell'utente:** Testo evidenziato nell'editor e un'istruzione di stile.
* **Output dell'IA:** Il testo originale riscritto e migliorato, senza alterare la trama o le decisioni dei personaggi.

### 🧐 5. FEEDBACK (L'Analisi Strutturale)

* **Template:** `HOMO Alpha Reader V1`
* **Scopo:** Fornire una critica spietata e costruttiva su una scena appena scritta.
* **Input dell'utente:** L'intera scena evidenziata.
* **Output dell'IA:** Un'analisi divisa in Punti di Forza, Punti Deboli e Suggerimenti pratici. Segnala buchi di trama, cali di ritmo o dialoghi deboli. Non sovrascrive il testo.

### 🛠️ 6. UTILITY (Il Coltellino Svizzero)

* **Template:** `HOMO Meta & Synopsis Utility V1`
* **Scopo:** Automazione di compiti meta-editoriali (generare titoli, estrarre nomi, creare riassunti).
* **Input dell'utente:** Testo evidenziato o un'istruzione generica.
* **Output dell'IA:** Risposte brevi e funzionali (es. un riassunto di 3 righe da incollare nell'Inspector).

---

## 3. UI, UX e "Flow State": Come invocare l'IA

HOMO offre due metodi distinti per comunicare con l'IA, progettati per non interrompere mai il flusso creativo (Flow State) dell'autore.

### Metodo A: Il Pannello "Immediate Action (Beats)" e il Footer

Questo metodo è utilizzato principalmente per la fase di **DRAFTING (Stesura)**.

1. L'autore compila il campo "Immediate Action (Beats)" nell'Inspector (es. *"Gunner tira un pugno sul tavolo"*).
2. L'autore posiziona il cursore nell'editor vuoto (senza selezionare nulla).
3. L'autore clicca il pulsante grande **"GENERATE AI ✨"** nel footer.
4. **Comportamento:** Il sistema legge automaticamente i Beats, li inserisce nel prompt di Drafting e genera la prosa successiva.

### Metodo B: La Barra Inline e lo "Smart Routing" (Scorciatoia `Cmd+J`)

Questo metodo è utilizzato per l'**EDITING**, il **WORLDBUILDING**, l'**OUTLINING** e le operazioni chirurgiche sul testo.

1. L'autore **evidenzia** una porzione di testo col mouse.
2. L'autore preme `Cmd + J` (Mac) o `Ctrl + J` (Win) sulla tastiera. Si apre immediatamente una barra di comando fluttuante.
3. L'autore digita l'istruzione (es. *"Rendilo più aggressivo"*) e preme Invio.
4. **Comportamento (Smart Routing):** Il sistema riconosce che c'è del testo evidenziato, auto-seleziona il template di `EDITING` (se non forzato diversamente dall'utente), invia il testo all'IA e sostituisce la selezione con il risultato.

> ⚠️ **ATTENZIONE ALL'ERRORE COMUNE:** Non usare mai il pulsante grande del Footer se vuoi che l'IA analizzi o modifichi un testo che hai evidenziato. Il Footer leggerà sempre e solo i Beats dell'Inspector. Per lavorare sul testo evidenziato, usa sempre la scorciatoia `Cmd+J` (o il menu a bolla).

---

## 4. Esempio di Workflow Ideale (Dalla pagina bianca alla pagina finita)

Ecco come i vari componenti di HOMO lavorano in sinergia:

1. **L'Idea (Outlining):** Apri una scena vuota. Scrivi: *"Gunner incontra Tordek. Discutono del matrimonio. Gunner rifiuta e Tordek si infuria"*. Evidenzia il testo, premi `Cmd+J`, seleziona *Scene Architect* e premi Invio.
2. **Il Ponte (Inspector):** L'IA ti restituisce 4 punti elenco (Beat). Tagliali dall'editor centrale e incollali nel campo "Immediate Action (Beats)" dell'Inspector.
3. **La Voce (Personas):** Nell'Inspector, imposta la "AI Persona" su *The Suspense Architect* per dare un tono teso alla scena.
4. **La Scrittura (Drafting):** Clicca nell'editor vuoto e premi "GENERATE AI ✨" nel footer. L'IA scrive i primi paragrafi basandosi sui tuoi Beat. Tu continui a scrivere a mano il resto del dialogo.
5. **La Pulizia (Editing):** Rileggi la scena. Trovi un paragrafo noioso. Lo evidenzi, premi `Cmd+J`, scrivi *"Taglia le ripetizioni e mostra la rabbia di Tordek tramite i gesti"*, premi Invio. Il *Line Editor* corregge il paragrafo.
6. **Il Controllo Qualità (Feedback):** A fine scena, seleziona tutto il testo col mouse (Cmd+A). Premi `Cmd+J`, seleziona *Alpha Reader* e chiedi *"Dimmi se il finale funziona"*. Leggi la critica e fai le tue ultime modifiche manuali.
7. **L'Archivio (Utility):** Riseleziona tutto il testo. Premi `Cmd+J`, seleziona *Utility* e chiedi *"Fammi un riassunto di 2 righe"*. Incolla il risultato nel campo "Scene Synopsis" dell'Inspector.

Hai appena completato una scena a livello editoriale professionale, senza mai lasciare la tua applicazione.
