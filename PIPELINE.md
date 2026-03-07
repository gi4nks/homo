# 📖 HOMO: La Pipeline di Scrittura Assistita (AI Prompt CMS)

L'intelligenza artificiale in HOMO non è un "bottone magico" che scrive il libro al posto tuo, ma un co-pilota specializzato. Per ottenere risultati professionali, il processo creativo è stato diviso in **5 Fasi distinte**.

Ogni fase ha il suo **Prompt Template** dedicato, ottimizzato per svolgere *solo* quel compito specifico. Non usare mai uno strumento per fare il lavoro di un altro.

---

## 1. 🌍 WORLDBUILDING (La Fondazione)

**Template Consigliato:** `HOMO Lore Archivist V1`

* **Obiettivo:** Creare le regole del mondo, schede personaggio, sistemi magici, religioni o background politici. Non scrive prosa narrativa, ma produce documenti enciclopedici.
* **Quando usarlo:** Quando hai una mezza idea su un elemento del mondo e hai bisogno di strutturarlo prima di inserirlo nella storia.
* **Come usarlo:** Scrivi un'idea di base nell'editor, selezionala, invoca l'IA e chiedile di espanderla.

> **💡 Esempio pratico:**
> * **Testo selezionato (La tua idea):** *"La magia dei Djinni dell'acqua richiede un patto di sangue e abbassa la temperatura corporea dell'ospite."*
> * **Istruzione (Prompt Inline):** *"Struttura le regole di questo sistema magico. Includi i costi fisici a lungo termine e un tabù culturale."*
> * **Risultato:** Un documento formattato con titoli e proiettili (Origini, Meccanica, Prezzo Fisico, Tabù) pronto da salvare nelle tue note di Lore.
> 
> 

---

## 2. 🏗️ OUTLINING (La Struttura)

**Template Consigliato:** `HOMO Scene Architect V1`

* **Obiettivo:** Trasformare un'idea di trama in una scaletta di "Beat" (azioni sequenziali) per una singola scena. Definisce conflitti e reazioni senza scrivere i dialoghi finali o la prosa.
* **Quando usarlo:** All'inizio di un capitolo, o quando hai il "blocco dello scrittore" e non sai come far muovere i personaggi dal punto A al punto B.
* **Come usarlo:** Scrivi un riassunto grezzo di cosa deve succedere, selezionalo e chiedi all'Architetto di dividerlo in Beat.

> **💡 Esempio pratico:**
> * **Testo selezionato:** *"Gunner incontra Safiya ai giardini. Lei cerca di sedurlo per rubargli informazioni, ma lui capisce la trappola e la minaccia."*
> * **Istruzione (Prompt Inline):** *"Crea 5 beat narrativi con un'escalation di tensione. Fai in modo che Gunner capisca la trappola tramite un dettaglio fisico."*
> * **Risultato:** Un elenco puntato tattico (es. *Beat 1: Safiya offre da bere... Beat 2: Gunner nota che la mano di lei non trema...*) che andrai a copiare nel campo "Immediate Action (Beats)" dell'Inspector.
> 
> 

---

## 3. ✍️ DRAFTING (La Stesura)

**Template Consigliato:** `HOMO Standard V1`

* **Obiettivo:** Scrivere la vera prosa del romanzo. Questo motore unisce i Beat della scena, le informazioni dell'Inspector e la "Voce" del tuo Personaggio IA (es. *The Dark Epic Poet*) per generare testo letterario.
* **Quando usarlo:** Quando hai la scaletta pronta (Outlining) e devi materialmente produrre i paragrafi e i dialoghi.
* **Come usarlo:** Assicurati di aver compilato l'Inspector (Beats, Cast, Obiettivo). Posiziona il cursore nel testo (senza selezionare nulla) e invoca l'IA.

> **💡 Esempio pratico:**
> * **Contesto (Inspector):** Hai inserito il Beat: *"Gunner blocca Safiya contro il muro della fontana"*.
> * **Istruzione (Prompt Inline):** *"Scrivi questo beat. Concentrati sul rumore dell'acqua e sul respiro affannoso di Gunner."*
> * **Risultato:** 2-3 paragrafi di prosa immersiva e stilisticamente coerente con il tuo Personaggio IA selezionato.
> 
> 

---

## 4. 🔪 EDITING (La Revisione)

**Template Consigliato:** `HOMO Line Editor V1`

* **Obiettivo:** Pulire, lucidare e rafforzare la meccanica della prosa. Taglia gli avverbi, elimina la forma passiva e applica lo "Show, Don't Tell". Non altera la trama.
* **Quando usarlo:** Durante la seconda stesura, o subito dopo aver scritto di getto un paragrafo che suona debole o "goffo".
* **Come usarlo:** Seleziona ESATTAMENTE il testo che vuoi migliorare nell'editor TipTap, invoca l'IA e dalle un comando stilistico.

> **💡 Esempio pratico:**
> * **Testo selezionato:** *"Gunner era molto stanco e sentiva caldo. Guardò malamente la servitù che passava velocemente."*
> * **Istruzione (Prompt Inline):** *"Rendi questo paragrafo più crudo. Taglia gli avverbi e usa lo Show, Don't Tell per mostrare il caldo."*
> * **Risultato:** *"Il sudore gli bruciava gli occhi. Gunner strinse i pugni, la polvere del Calimshan che gli grattava la gola a ogni respiro. La servitù si dileguò al suo passaggio, abbassando lo sguardo sul marmo rovente."*
> 
> 

---

## 5. 🛠️ UTILITY (Il Coltellino Svizzero)

**Template Consigliato:** `HOMO Meta & Synopsis Utility V1`

* **Obiettivo:** Eseguire compiti meta-editoriali: riassumere, estrarre dati, generare titoli. Risposte secche e strutturate.
* **Quando usarlo:** A fine sessione, per aggiornare i metadati dell'Inspector (es. la Sinossi del Capitolo) senza dover rileggere tutto a mano.
* **Come usarlo:** Seleziona un blocco di testo (anche una scena intera) e chiedi un'estrazione dati.

> **💡 Esempio pratico:**
> * **Testo selezionato:** [L'intera scena di 2000 parole appena scritta]
> * **Istruzione (Prompt Inline):** *"Fammi un riassunto di massimo 3 righe degli eventi principali di questa scena."*
> * **Risultato:** Un testo breve e conciso, perfetto da incollare nel campo "Scene Synopsis" dell'Inspector.
> 
> 

## ⚡ UX & Flow State: Scorciatoie e Smart Routing

Per garantire che l'interfaccia non interrompa mai il tuo flusso creativo (Flow State), HOMO è progettato per essere **Context-Aware** (consapevole del contesto) e guidato principalmente dalla tastiera. Non dovresti quasi mai aver bisogno di spostare il mouse sull'Inspector durante la fase di stesura attiva.

### 🧠 Smart Routing (Il Pilota Automatico)

Il motore di HOMO decide automaticamente quale "Cassetto" (Prompt Template) aprire in base a quello che stai facendo nell'editor:

* **Testo Evidenziato ➔ Auto-Routing su EDITING:** Se selezioni una o più parole e invochi l'IA, il sistema assume che tu voglia modificare qualcosa di esistente. Selezionerà automaticamente il template *HOMO Line Editor V1* (o il tuo template di Editing predefinito).
* **Cursore Lampeggiante (Nessuna selezione) ➔ Auto-Routing su DRAFTING:** Se sei alla fine di un paragrafo e invochi l'IA, il sistema assume che tu voglia continuare a scrivere la storia. Selezionerà automaticamente il template *HOMO Standard V1*.

> **Nota per i Power User:** L'Inspector sulla destra funge da **Override manuale**. Se hai evidenziato del testo ma vuoi usare la funzione di *Utility* (es. per fare un riassunto) invece di quella di *Editing*, puoi forzare la scelta selezionando il template desiderato dal menu a tendina prima di dare l'Invio.

### ⌨️ Scorciatoie da Tastiera (Notion-Style)

Tieni le mani sulla tastiera. Usa questi comandi per comandare l'IA alla velocità del pensiero:

| Comando (Mac / Win) | Azione | Descrizione |
| --- | --- | --- |
| `Cmd + J` / `Ctrl + J` | **Evoca l'IA Inline** | Apre immediatamente la barra dei comandi AI (Bubble Menu) esattamente dove si trova il cursore, già a fuoco e pronta per digitare l'istruzione. |
| `/` (Slash Command) | **Menù Rapido TipTap** | Digitando `/` all'inizio di una riga vuota (o `/ai`) si apre il menu a tendina per selezionare rapidamente le opzioni base (es. "✨ Continua a scrivere"). |
| `Invio` / `Enter` | **Esegui Prompt** | Lancia il comando AI digitato nella barra inline senza dover cliccare il bottone "Generate". |
| `Esc` | **Annulla / Chiudi** | Chiude istantaneamente la barra dei comandi AI o annulla la generazione in corso, restituendo il focus al testo. |

#### Esempio di Workflow Fluido (Zero Clic):

1. Stai scrivendo e ti accorgi che la frase è debole.
2. Tieni premuto `Shift` e usi le frecce per evidenziare la frase.
3. Premi `Cmd + J`. (Si apre la barra, lo Smart Routing seleziona l'Editing).
4. Scrivi *"Più aggressivo"* e premi `Invio`.
5. Il testo viene sostituito. Continui a scrivere.
