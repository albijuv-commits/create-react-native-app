# Orienta

Web app in italiano, mobile-first e installabile come PWA, che aiuta a capire i propri sintomi e a trovare il professionista giusto.
**Orienta, non diagnostica**: ogni risultato è una possibilità e porta sempre verso un medico o un farmacista.

Piano, struttura delle cartelle e design system: [docs/PIANO.md](docs/PIANO.md). Prima di pubblicare l'app leggi la [nota sul Regolamento UE sui dispositivi medici](#regolamento-ue-sui-dispositivi-medici-mdr).

## Avvio rapido

```bash
cd orienta
npm install
cp .env.example .env.local   # facoltativo: senza chiavi l'app usa i ripieghi
npm run dev                  # http://localhost:3000
```

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Server di sviluppo |
| `npm run build && npm start` | Build di produzione (il service worker si attiva solo qui) |
| `npm run lint` / `npm run typecheck` | Controlli statici |
| `npm test` | Test unitari (Vitest) |
| `npm run test:e2e` | Test end-to-end (Playwright) su una build di produzione, con medici e farmaci di esempio e senza scaricare tile: Sintomi, Specialista, Mercato, Profilo, privacy e accessibilità (axe, tema chiaro e scuro). Se il browser di Playwright non è installato, indica un Chromium con `CHROMIUM_PATH=/percorso/chromium`; con `E2E_BASE_URL=http://localhost:3000` i test usano un server già avviato |
| `npm run import:aifa` | Importa il catalogo dei medicinali dagli Open Data dell'AIFA (vedi [Mercato](#mercato)) |
| `npm run import:ema` | Aggiorna i marchi europei dall'elenco dell'EMA (vedi [Mercato](#mercato)) |
| `npm run check:sources` | Verifica che i link delle fonti delle schede esistano; con `-- --write` aggiorna `data/conditions/sources-report.json` |
| `npm run icons` | Rigenera le icone PWA dall'illustrazione `scripts/icon-source.webp` (favicon vettoriale da `scripts/icon-source.svg`) |
| `node scripts/gen-illustration-maps.mjs` | Aggiorna le mappe delle illustrazioni di condizioni e specialisti dopo aver aggiunto o tolto un file |

## Base di conoscenza e vetrino

- Le schede delle condizioni sono file TypeScript tipizzati in `data/conditions/`, validati con Zod all'avvio e nei test. Ogni scheda resta «da revisionare» finché un medico non la controlla, e l'app lo segnala.
- Le animazioni del vetrino sono scene SVG originali in `src/components/slide/scenes/`, descritte in `src/lib/slides/catalog.ts`. La pagina `/vetrino` (non indicizzata) mostra tutte le scene passo per passo, utile per la revisione.

### Come aggiungere una condizione

1. **Scrivi la scheda** in `data/conditions/<id>.ts` con `defineCondition({ ... })`. L'ID è in minuscolo con i trattini (ad esempio `otite-esterna`); lo schema completo è in `src/lib/conditions/schema.ts` e conviene partire da una scheda esistente, come `cistite.ts`. Servono:
   - nome, sinonimi, aree e zone del corpo (`data/vocab/body.ts`), una panoramica breve;
   - storia (origine del nome e almeno 3 date), 1 o 2 casi clinici (quelli inventati con `kind: "illustrativo"`), cause, fattori di rischio, sintomi tipici e meno comuni, cure possibili, quando sentire il medico, prevenzione;
   - lo specialista di riferimento (`data/vocab/specialties.ts`), con il motivo;
   - almeno 2 fonti autorevoli in https, da editori ammessi (ISSalute, Ministero della Salute, NHS, MedlinePlus e gli altri elencati nello schema);
   - `animation`: una scena del catalogo (`src/lib/slides/catalog.ts`) con i suoi parametri e una didascalia per ogni passo;
   - `triage`: almeno 2 `keySymptoms` e gli `otherSymptoms`, scelti tra gli ID di `data/vocab/symptoms.ts` (se un sintomo manca, aggiungilo lì con i suoi sinonimi: servono a riconoscerlo mentre la persona scrive), le frasi «più probabile se» e «meno probabile se», `typicalUrgency` (`home`, `gp`, `soon`, `er`). Con `matchable: false` la scheda resta consultabile ma non compare tra i risultati dell'intervista;
   - `reviewStatus: "da revisionare"` finché un medico non la controlla, e `updatedAt`.
2. **Registrala** in `data/conditions/index.ts`: importa il file e aggiungilo all'elenco `RAW`.
3. **Illustrazione** (facoltativa): salva `src/assets/illustrations/condizione-<id>.webp` e lancia `node scripts/gen-illustration-maps.mjs`. Senza illustrazione la card usa l'anteprima del vetrino.
4. **Verifica**: `npm test` valida tutte le schede (schema, ID unici, registrazione in `index.ts`, casi illustrativi dichiarati) e `npm run check:sources -- --write` controlla che i link delle fonti esistano.

La nuova scheda compare subito nell'elenco Condizioni, nel motore a regole e tra quelle che l'AI può scegliere: il modello sceglie solo tra gli ID della base di conoscenza, quindi una condizione che non è qui non può mai comparire nei risultati.

## Intervista sui sintomi

- Flusso: consenso → dati di base (sotto i 14 anni serve un genitore o un tutore, sotto i 18 il tono si adatta) → descrizione a parole, con i sintomi riconosciuti mentre si scrive, e mappa del corpo 3D o semplice → da 5 a 12 domande su carte da sfogliare (c'è sempre «Non so») → risultati.
- I segnali d'allarme sono regole deterministiche (`src/lib/triage/red-flags.ts`, un test per regola): si controllano nel browser a ogni risposta e sul server prima e dopo ogni chiamata all'AI, e portano alla schermata Emergenza (112; per i pensieri di farsi del male anche Telefono Amico e Telefono Azzurro).
- Senza `ANTHROPIC_API_KEY`, o senza il consenso facoltativo all'AI, il motore a regole gira tutto nel browser e nessun dato sanitario lascia il dispositivo. Con la chiave e il consenso, `/api/triage` usa Claude con uscita strutturata validata da Zod: il modello può scegliere solo tra le schede della base di conoscenza, un'uscita non valida viene riprovata una volta e poi si propone il metodo semplificato; l'urgenza non scende mai sotto quella delle regole. Anche con il consenso le domande fisse (segnali d'allarme, durata, intensità) restano nel browser: i dati partono solo quando servono al modello. Il server non registra i dati.
- I risultati mostrano sempre «Questa non è una diagnosi. Solo un medico può valutare i tuoi sintomi.», il livello di urgenza con colore, icona e testo, da 1 a 5 condizioni compatibili con i fattori che le rendono più o meno probabili, e il riepilogo per il medico da copiare, condividere o scaricare in PDF (creato nel browser). Alla fine la persona può salvare la sessione nello storico del dispositivo.

## Medici

- Chi cercare: il medico di base è sempre il primo passo proposto; dai risultati dell'intervista e dalle schede si arriva con lo specialista di riferimento già scelto (per i più piccoli il pediatra). Dove: posizione del browser, con il permesso della persona, oppure città o CAP, oppure la città predefinita scelta nel Profilo.
- La posizione parte dal telefono già arrotondata a circa 100 metri; la route `/api/medici` la usa solo per la ricerca, senza salvarla né scriverla nei log. Il riepilogo dei sintomi per l'email resta nella scheda del browser (`sessionStorage`) e non va mai al server.
- Fonti (`src/lib/doctors/`), dietro l'interfaccia `DoctorProvider`:
  - `GooglePlacesProvider` (Places API, Text Search), se c'è `GOOGLE_PLACES_API_KEY`: nome, indirizzo, distanza, telefono, sito, valutazione e orari. Come chiedono i termini di Google, i risultati non si mettono in cache, si mostrano con l'attribuzione «Google Maps» e non vanno su mappe non Google: con questa fonte la vista mappa si disattiva e le indicazioni usano i link di Google.
  - `OsmProvider` (OpenStreetMap tramite Overpass, gratuito), anche con l'email quando è nei dati. Una richiesta alla volta, pausa di 30 secondi dopo un 429, cache di un'ora e istanze di riserva (`OVERPASS_URL`). Città e CAP si cercano con Nominatim: una richiesta al secondo, risultati in cache, ricerca solo all'invio (niente completamento automatico).
  - `ExampleProvider`: DATI DI ESEMPIO quando i servizi reali non rispondono, sempre etichettati. Nomi fittizi, nessun numero di telefono, email e siti solo su `example.com`.
- La mappa usa Leaflet con le tile di OpenStreetMap, caricate solo quando si apre la vista mappa e con l'attribuzione sempre visibile. I contatti presi da OpenStreetMap diventano link solo se sono davvero un telefono, un'email o un sito http/https.
- Il riquadro «Come prenotare» spiega la visita privata e il percorso con il Servizio sanitario nazionale (ricetta del medico di base, poi CUP), con la fonte del Ministero della Salute.

## Mercato

Catalogo informativo dei medicinali, non un negozio: niente carrello né acquisti. In Italia i medicinali con ricetta non si possono vendere online e quelli senza ricetta solo da farmacie e parafarmacie autorizzate (c'è il link alla verifica del Ministero della Salute). Presentazione neutra, senza «offerte» né classifiche; i risultati dell'intervista sui sintomi non portano mai a un farmaco.

- **Dati.** Open Data dell'AIFA (licenza CC BY 4.0) uniti per codice AIC in SQLite con Drizzle (`src/lib/medicines/`): anagrafica delle confezioni con regime di fornitura e link al foglietto (aggiornata ogni giorno), nomi ATC, liste di Classe A e H (prezzi, ogni mese), lista di trasparenza (prezzo di riferimento SSN). Restano fuori i medicinali omeopatici e le confezioni non autorizzate.
- **Prezzi.** Solo quelli delle liste AIFA, sempre con la data. Per i farmaci senza ricetta il prezzo è «indicativo» e spesso le liste non lo riportano: l'app lo dice invece di inventarlo.
- **Badge** (`regime.ts`, un test per ogni testo AIFA): OTC e SOP «Senza ricetta» (verde), RR, RNR, RRL, RNRL, RMR «Con ricetta», OSP «Solo uso ospedaliero», USPL «Solo dallo specialista»; «Rimborsabile SSN» per la classe A.
- **Marchi, aziende e prezzi.** Ogni principio attivo ha una chiave normalizzata (`ingredient-key.ts`: sali e idrati tolti, associazioni ordinate), così «Cetirizina» e «Cetirizina dicloridrato» risultano la stessa sostanza. Sotto ogni card un riquadro da aprire mostra marchi e aziende con lo stesso principio attivo e la fascia di prezzo a parità di dosaggio e forma (`/api/farmaci/marchi`). La scheda ha l'elenco completo, gli equivalenti dal più economico, il foglietto ufficiale e l'avviso «Chiedi consiglio al medico o al farmacista»; il confronto arriva a 3 farmaci. Preferiti e confronto restano sul dispositivo.
- **Principi attivi** (`ingredients.ts`, 32 schede): breve descrizione chimica, come agisce e quali effetti ha, effetti indesiderati più frequenti con la loro frequenza, un'avvertenza quando l'RCP ne indica una importante. Il testo riassume il Riassunto delle Caratteristiche del Prodotto (RCP) pubblicato dall'AIFA (sezioni 4.8 e 5.1); formula e massa molare vengono da PubChem. Ogni scheda linka le sue fonti; niente dosi né consigli d'uso.
- **In Europa.** Dall'elenco pubblico dell'EMA dei medicinali autorizzati nell'UE e nel SEE (Article 57 database), i marchi dello stesso principio attivo Paese per Paese, utili in viaggio. Dello schedario si leggono solo nome, sostanza, via di somministrazione, Paese e titolare, non email e telefoni. Fonte: © European Medicines Agency, riprodotto citando la fonte.
- **Immagini.** Le foto delle confezioni sono protette da copyright: di base ogni forma ha un'illustrazione originale (compresse, capsule, sciroppo, spray nasale, collirio, crema, bustine). Le foto si aggiungono in `data/medicines/photos.json` solo con licenza libera (CC0, pubblico dominio, CC BY, CC BY-SA), con autore, licenza, pagina della fonte e Paese della confezione fotografata; un test lo controlla. Le confezioni vendute in altri Paesi europei sono ammesse e lo si scrive accanto alla foto. Si scartano le foto con scritte promozionali. Il file va in `public/farmaci/foto/` (WebP), poi si rilancia l'import.

```bash
npm run import:aifa                                  # scarica i file AIFA e scrive data/medicines/orienta.db
npm run import:aifa -- --dir data/medicines/aifa     # rifà l'import dai file già scaricati
npm run import:aifa -- --dir data/medicines/aifa --seed   # rigenera il campione (data/medicines/seed.json) dalle confezioni di seed-aic.json
npm run import:ema                                   # marchi europei: scrive data/medicines/eu-brands.json
```

Il database (circa 86.000 confezioni) non è nel repository: si crea con l'import e va distribuito insieme all'app, oppure indicato con `MEDICINES_DB_PATH`. Senza database, o con `MEDICINES_SOURCE=esempio`, l'app usa il campione di 44 confezioni, sempre etichettato «DATI DI ESEMPIO». Ogni pagina del Mercato riporta l'attribuzione richiesta dalla licenza: «Fonte: AIFA, Open Data (licenza CC BY 4.0)».

## Profilo e privacy

Nessun account: i dati restano sul dispositivo, tranne quello che parte verso l'AI durante l'intervista, e solo con il consenso esplicito.

- **Preferenze** (`src/lib/prefs/`): tema chiaro, scuro o automatico, dimensione del testo e città predefinita per la ricerca dei medici, in `localStorage`. Uno script nell'`<head>` le applica prima del primo disegno, così la pagina non lampeggia.
- **Storico delle sessioni** (`src/lib/storage/history.ts`): in IndexedDB (database `orienta`), al massimo 50 sessioni. Si salva solo se la persona preme «Salva nello storico» alla fine dell'intervista, perché il consenso dell'intervista vale solo per l'intervista. Ogni voce contiene data, età, metodo, urgenza, condizioni compatibili e riepilogo per il medico; quando si rilegge passa di nuovo da Zod. Dal Profilo si apre il riepilogo (copia o PDF), si elimina una sessione o tutto lo storico.
- **«Elimina tutti i miei dati»** (`src/lib/storage/erase.ts`), con una conferma: cancella il database IndexedDB, le chiavi `orienta:` di `localStorage` e `sessionStorage` (preferenze, preferiti e confronto del Mercato, riepilogo per l'email), le pagine salvate dal service worker per l'uso senza rete, e riporta le preferenze ai valori iniziali. Restano solo l'app e le pagine Emergenza e offline, che non contengono dati personali. Se una parte non si cancella, l'app lo dice e spiega come farlo dalle impostazioni del browser.
- **Service worker** (`public/sw.js`): salva le pagine visitate senza la parte dopo «?», così ricerche, specialità e condizioni scritte nell'indirizzo non finiscono nella cache. Le risposte delle API non si salvano mai.
- **Dati sulla salute (GDPR, art. 9).** Arrivano al server solo con il consenso facoltativo all'AI: `/api/triage` rifiuta ogni richiesta senza `consent: true` (controllato con Zod), non salva né scrive nei log il contenuto (i log del server contengono solo messaggi generici) e risponde con `Cache-Control: no-store`. Nessuno strumento di analisi, nessun cookie, nessun servizio di terze parti sulle pagine dei sintomi. I test lo verificano: `tests/unit/triage-route.test.ts` (consenso e log) e `tests/e2e/privacy.spec.ts` (nessuna richiesta fuori dall'app, nessun cookie, nessun dato inviato senza consenso).
- **Pagine informative** nel Profilo: Informativa privacy (`/profilo/privacy`, descrive quello che il codice fa davvero), Avvertenze mediche (`/profilo/avvertenze`) e Fonti (`/profilo/fonti`, generata dai dati: fonti delle schede, numeri utili con la data di verifica, date dei dati AIFA ed EMA, crediti delle foto, mappe, caratteri e icone). Prima di pubblicare l'app indica il titolare del trattamento e il contatto per la privacy con `PRIVACY_CONTROLLER` e `PRIVACY_CONTACT` (si leggono durante la build): finché mancano, l'informativa mostra l'avviso «Da completare prima della pubblicazione».

## Accessibilità e movimento

- Contrasto WCAG AA in tema chiaro e scuro, focus sempre visibile, aree di tocco di almeno 44 px, etichette per gli screen reader, urgenza sempre con colore, icona e testo. `tests/e2e/accessibilita.spec.ts` controlla con axe tutte le pagine principali e i risultati dell'intervista, nei due temi.
- Il movimento risponde a un'azione: la carta della domanda che scorre dopo una risposta, la zona del corpo che si illumina al tocco, la barra di avanzamento, la scena del vetrino quando premi play. Le anteprime delle card delle condizioni si muovono per pochi secondi quando arrivano sullo schermo, poi si fermano.
- Con `prefers-reduced-motion` le scene diventano illustrazioni statiche con le stesse didascalie e non ci sono animazioni automatiche.

## Illustrazioni e oggetti 3D

- Le illustrazioni in stile argilla (`src/assets/illustrations/`, WebP con trasparenza) e gli oggetti 3D (`public/models/`, GLB compressi con meshopt e texture WebP) sono stati generati con Higgsfield (immagini con GPT Image 2.5, modelli 3D con Tripo H3.1) partendo da un'unica immagine di riferimento per avere uno stile coerente, poi ritagliati e ottimizzati con sharp e glTF-Transform. Non contengono testo né persone.
- Sono decorative (testo alternativo vuoto): il significato sta sempre nel testo accanto. `TiltIllustration` le rende «tattili» (si inclinano seguendo il dito e si schiacciano al tocco); `ModelViewer` carica un oggetto 3D solo quando entra nello schermo e il browser è libero, mostra l'illustrazione finché il modello non è pronto e si ruota trascinando o con le frecce. Senza WebGL, con «Risparmio dati» o con meno movimento restano le illustrazioni o i comandi diretti, senza animazioni automatiche.
- La mappa del corpo usa un manichino scolpito (`public/models/manichino.glb`), normalizzato con piedi a terra, altezza 1,76 e sguardo verso +z. Le zone si calcolano dalla posizione (`src/components/body-map/mannequin-zones.ts`): la stessa regola, con le stesse soglie, serve in TypeScript per capire cosa si è toccato e in GLSL per colorare la superficie pixel per pixel. Se il modello cambia, le soglie vanno rimisurate. Finché il modello non arriva, o se non si carica, resta il manichino geometrico.

## Variabili d'ambiente

Si impostano in `.env.local` (vedi `.env.example`). Nessuna chiave arriva al browser: le chiamate esterne passano tutte dalle route server.

| Variabile | A cosa serve |
| --- | --- |
| `ANTHROPIC_API_KEY` | Intervista con Claude; senza, motore a regole nel browser |
| `CLAUDE_MODEL` | Modello per l'intervista (predefinito `claude-sonnet-5-5`) |
| `GOOGLE_PLACES_API_KEY` | Facoltativa: ricerca dei medici con Google Places; senza, OpenStreetMap |
| `DOCTORS_PROVIDER` | Facoltativa: forza la fonte dei medici (`google`, `osm`, `esempio`) |
| `OVERPASS_URL` | Facoltativa: istanze Overpass separate da virgole (per un uso reale, un'istanza propria) |
| `NOMINATIM_URL` | Facoltativa: servizio per cercare città e CAP |
| `OSM_CONTACT` | Facoltativa: contatto del gestore nel User-Agent verso Overpass e Nominatim |
| `NEXT_PUBLIC_SITE_URL` | Indirizzo pubblico dell'app, per i link assoluti delle anteprime di condivisione |
| `MEDICINES_DB_PATH` | Facoltativa: percorso del database dei medicinali (predefinito `data/medicines/orienta.db`) |
| `MEDICINES_SOURCE` | Facoltativa: `esempio` forza il campione di esempio anche se c'è il database (i test end-to-end lo usano) |
| `PRIVACY_CONTROLLER` | Da impostare prima di pubblicare: titolare del trattamento mostrato nell'informativa privacy (nome o ragione sociale e indirizzo) |
| `PRIVACY_CONTACT` | Da impostare prima di pubblicare: contatto per la privacy e per esercitare i diritti (email o pagina web) |

Solo per i test end-to-end: `CHROMIUM_PATH` (un Chromium già installato) ed `E2E_BASE_URL` (un server già avviato invece della build di produzione).

## Regolamento UE sui dispositivi medici (MDR)

**Se l'app venisse pubblicata, un software che aiuta a orientare una diagnosi può rientrare nel Regolamento (UE) 2017/745 sui dispositivi medici (MDR) e richiede una verifica legale prima del lancio.**

Orienta è un prototipo. Un software destinato a dare informazioni usate per decisioni a scopo diagnostico o terapeutico può essere un dispositivo medico, con la classificazione della regola 11 dell'allegato VIII del Regolamento: in quel caso servono, tra l'altro, la marcatura CE, la valutazione clinica e un sistema di gestione della qualità. Frasi come «non è una diagnosi» non bastano da sole a escluderlo: conta lo scopo dichiarato e come il software viene presentato e usato. Prima di una pubblicazione serve quindi una verifica con un esperto legale e regolatorio, che valuti anche il GDPR (dati sanitari, trasferimento dei dati al fornitore dell'AI) e le regole sull'intelligenza artificiale.

Riferimenti: [Regolamento (UE) 2017/745 su EUR-Lex](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32017R0745), [linee guida MDCG 2019-11 sulla qualificazione e classificazione del software](https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en), [dispositivi medici sul sito del Ministero della Salute](https://www.salute.gov.it/new/it/tema/dispositivi-medici/).
