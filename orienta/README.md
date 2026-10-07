# Orienta

Web app in italiano, mobile-first e installabile come PWA, che aiuta a capire i propri sintomi e a trovare il professionista giusto.
**Orienta, non diagnostica**: ogni risultato è una possibilità e porta sempre verso un medico o un farmacista.

Piano, struttura delle cartelle e design system: [docs/PIANO.md](docs/PIANO.md).
Il README completo (variabili d'ambiente, import AIFA, come aggiungere una condizione, nota sul Regolamento MDR) arriva nella fase 6.

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
| `npm run test:e2e` | Test end-to-end (Playwright) su una build di produzione. Se il browser di Playwright non è installato, indica un Chromium con `CHROMIUM_PATH=/percorso/chromium` |
| `npm run check:sources` | Verifica che i link delle fonti delle schede esistano; con `-- --write` aggiorna `data/conditions/sources-report.json` |
| `npm run icons` | Rigenera le icone PWA dall'illustrazione `scripts/icon-source.webp` (favicon vettoriale da `scripts/icon-source.svg`) |
| `node scripts/gen-illustration-maps.mjs` | Aggiorna le mappe delle illustrazioni di condizioni e specialisti dopo aver aggiunto o tolto un file |

## Base di conoscenza e vetrino

- Le schede delle condizioni sono file TypeScript tipizzati in `data/conditions/`, validati con Zod all'avvio e nei test. Ogni scheda resta «da revisionare» finché un medico non la controlla, e l'app lo segnala.
- Le animazioni del vetrino sono scene SVG originali in `src/components/slide/scenes/`, descritte in `src/lib/slides/catalog.ts`. La pagina `/vetrino` (non indicizzata) mostra tutte le scene passo per passo, utile per la revisione.

## Intervista sui sintomi

- Flusso: consenso → dati di base (sotto i 14 anni serve un genitore o un tutore, sotto i 18 il tono si adatta) → descrizione a parole, con i sintomi riconosciuti mentre si scrive, e mappa del corpo 3D o semplice → da 5 a 12 domande su carte da sfogliare (c'è sempre «Non so») → risultati.
- I segnali d'allarme sono regole deterministiche (`src/lib/triage/red-flags.ts`, un test per regola): si controllano nel browser a ogni risposta e sul server prima e dopo ogni chiamata all'AI, e portano alla schermata Emergenza (112; per i pensieri di farsi del male anche Telefono Amico e Telefono Azzurro).
- Senza `ANTHROPIC_API_KEY`, o senza il consenso facoltativo all'AI, il motore a regole gira tutto nel browser e nessun dato sanitario lascia il dispositivo. Con la chiave e il consenso, `/api/triage` usa Claude con uscita strutturata validata da Zod: il modello può scegliere solo tra le schede della base di conoscenza, un'uscita non valida viene riprovata una volta e poi si propone il metodo semplificato; l'urgenza non scende mai sotto quella delle regole. Il server non registra i dati.
- I risultati mostrano sempre «Questa non è una diagnosi. Solo un medico può valutare i tuoi sintomi.», il livello di urgenza con colore, icona e testo, da 1 a 5 condizioni compatibili con i fattori che le rendono più o meno probabili, e il riepilogo per il medico da copiare, condividere o scaricare in PDF (creato nel browser).

## Illustrazioni e oggetti 3D

- Le illustrazioni in stile argilla (`src/assets/illustrations/`, WebP con trasparenza) e gli oggetti 3D (`public/models/`, GLB compressi con meshopt e texture WebP) sono stati generati con Higgsfield (immagini con GPT Image 2.5, modelli 3D con Tripo H3.1) partendo da un'unica immagine di riferimento per avere uno stile coerente, poi ritagliati e ottimizzati con sharp e glTF-Transform. Non contengono testo né persone.
- Sono decorative (testo alternativo vuoto): il significato sta sempre nel testo accanto. `TiltIllustration` le rende «tattili» (si inclinano seguendo il dito e si schiacciano al tocco); `ModelViewer` carica un oggetto 3D solo quando entra nello schermo e il browser è libero, mostra l'illustrazione finché il modello non è pronto e si ruota trascinando o con le frecce. Senza WebGL, con «Risparmio dati» o con meno movimento restano le illustrazioni o i comandi diretti, senza animazioni automatiche.
- La mappa del corpo usa un manichino scolpito (`public/models/manichino.glb`), normalizzato con piedi a terra, altezza 1,76 e sguardo verso +z. Le zone si calcolano dalla posizione (`src/components/body-map/mannequin-zones.ts`): la stessa regola, con le stesse soglie, serve in TypeScript per capire cosa si è toccato e in GLSL per colorare la superficie pixel per pixel. Se il modello cambia, le soglie vanno rimisurate. Finché il modello non arriva, o se non si carica, resta il manichino geometrico.

## Variabili d'ambiente

| Variabile | A cosa serve |
| --- | --- |
| `ANTHROPIC_API_KEY` | Intervista con Claude; senza, motore a regole nel browser |
| `CLAUDE_MODEL` | Modello per l'intervista (predefinito `claude-sonnet-5-5`) |
| `GOOGLE_PLACES_API_KEY` | Facoltativa, ricerca dei medici (fase 4) |
| `NEXT_PUBLIC_SITE_URL` | Indirizzo pubblico dell'app, per i link assoluti delle anteprime di condivisione |
