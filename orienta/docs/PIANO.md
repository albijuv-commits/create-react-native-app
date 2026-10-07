# Orienta: piano di lavoro

Orienta aiuta a capire i propri sintomi e a trovare il professionista giusto.
**Orienta, non diagnostica**: ogni risultato è una possibilità e porta sempre verso un medico o un farmacista.

## Decisioni di architettura

| Tema | Scelta | Perché |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), TypeScript strict | Route server per tutte le chiamate esterne; nessuna chiave nel client |
| Stile | Tailwind CSS v4 con token CSS su `:root` | Un solo posto per palette e tema scuro |
| Animazioni | Motion (`motion/react`) + SVG originali | Scene del "vetrino" leggere, rispettano `prefers-reduced-motion` |
| Validazione | Zod ovunque: input API, risposte AI, dati della base di conoscenza, preferenze locali | Un dato non valido non arriva mai all'interfaccia |
| Condizioni | File TypeScript tipizzati in `/data/conditions`, validati da uno schema Zod in un test | Contenuti curati e revisionabili, mai generati al volo |
| Medicinali | SQLite + Drizzle ORM (`better-sqlite3`), importazione da Open Data AIFA | Catalogo interrogabile con filtri ed equivalenti |
| Intervista | `@anthropic-ai/sdk` solo lato server in `/api/triage`; ripiego a regole senza chiave | Il modello sceglie solo tra ID noti |
| Segnali d'allarme | Funzioni pure deterministiche in `src/lib/triage/red-flags.ts`, eseguite prima e dopo ogni turno AI | Mai delegati all'AI; un test per regola |
| Medici | Interfaccia `DoctorProvider` con `GooglePlacesProvider`, `OsmProvider`, `MockProvider` | Funziona anche senza chiavi |
| Mappe | Leaflet + tile OpenStreetMap con attribuzione | Gratuito, rispettando la tile usage policy |
| Dati locali | IndexedDB (storico) e `localStorage` (preferenze), nessun account | Dati sanitari restano sul dispositivo |
| PWA | `app/manifest.ts`, icone generate da SVG, service worker in `public/sw.js` | Installabile su iPhone e Android; le API non vengono mai messe in cache |
| Test | Vitest (unitari) + Playwright (end-to-end) | Copertura dove un errore fa più danni |

## Struttura delle cartelle

```
orienta/
├── data/
│   ├── conditions/          # Base di conoscenza: una condizione per file + index.ts (fase 2)
│   └── medicines/           # Seed di esempio dei farmaci (fase 5)
├── docs/                    # Piano, note di design
├── public/
│   ├── icons/               # Icone PWA generate
│   └── sw.js                # Service worker
├── scripts/
│   ├── generate-icons.mjs   # SVG -> PNG per manifest e iOS
│   └── import-medicines.ts  # Import Open Data AIFA (fase 5)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Shell: barra in alto con Emergenza, barra inferiore
│   │   ├── page.tsx         # Sintomi (home)
│   │   ├── sintomi/         # Intervista e risultati (fase 3)
│   │   ├── emergenza/       # Schermata Emergenza
│   │   ├── condizioni/      # Elenco e scheda [id] (fase 2)
│   │   ├── medici/          # Lista e mappa (fase 4)
│   │   ├── mercato/         # Catalogo, scheda [aic], confronto (fase 5)
│   │   ├── profilo/         # Preferenze, privacy, avvertenze, fonti (fase 6)
│   │   ├── offline/         # Pagina mostrata dal service worker senza rete
│   │   ├── api/             # triage, doctors, medicines (route server)
│   │   └── manifest.ts
│   ├── components/
│   │   ├── ui/              # Button, Badge, Callout, ProgressBar, UrgencyIndicator, ...
│   │   ├── layout/          # TopBar, BottomNav, EmergencyButton
│   │   ├── pwa/             # Registrazione service worker
│   │   ├── slide/           # Il "vetrino" e le scene animate (fase 2)
│   │   ├── body-map/        # Mappa del corpo fronte/retro (fasi 2-3)
│   │   ├── triage/ doctors/ market/
│   └── lib/
│       ├── design/          # Token di design condivisi con SVG e codice
│       ├── prefs/           # Preferenze (tema, testo, città) validate con Zod
│       ├── triage/          # red-flags, schema risposte AI, motore a regole, prompt
│       ├── doctors/         # DoctorProvider e implementazioni
│       ├── medicines/       # Schema Drizzle, mappatura regime di fornitura
│       └── storage/         # IndexedDB
└── tests/
    ├── unit/                # Vitest
    └── e2e/                 # Playwright
```

## Fasi

1. **Setup, design system, navigazione e PWA.**
2. Base di conoscenza (40+ condizioni), schede Condizioni, libreria di animazioni del vetrino.
3. Intervista, segnali d'allarme deterministici con test, schermata Emergenza, Risultati, riepilogo per il medico.
4. Medici: tre provider, lista e mappa, email precompilata, box su come prenotare.
5. Mercato: import AIFA, seed di esempio, catalogo, filtri, scheda, equivalenti, confronto, preferiti.
6. Profilo e privacy, rifinitura animazioni e accessibilità, test end-to-end, README.

## Design system

### Palette (vetrini di istologia)

| Token | Chiaro | Scuro | Uso |
| --- | --- | --- | --- |
| Ematossilina | `#3B2C85` | `#B3A8FF` | Titoli, azioni principali |
| Eosina | `#C2185B` | `#FF8DB8` | Accenti, evidenziazioni |
| Vetro | `#F6F8FB` | `#12121F` | Fondo |
| Inchiostro | `#1A1B2E` | `#EDEBF7` | Testo |
| Verde | `#1B7A47` | `#6FD49D` | Solo "Senza ricetta" |
| Ambra | `#8A5300` | `#F2B661` | Urgenza media |
| Rosso | `#B42318` | `#FF8A80` | Urgenza alta, Emergenza |

I livelli di urgenza usano sempre colore + icona + testo:

| Livello | Colore | Icona | Testo |
| --- | --- | --- | --- |
| `home` | Ardesia `#2D5F80` | Casa | Puoi gestirlo a casa |
| `gp` | Ambra | Stetoscopio | Senti il medico di base o la guardia medica (116117 dove attivo) |
| `soon` | Arancio scuro `#B4400C` | Orologio | Fatti visitare a breve |
| `er` | Rosso | Sirena | Vai subito al pronto soccorso |

### Tipografia

Atkinson Hyperlegible (400, 700). Scala: display 32px, titolo 24px, sezione 20px, corpo 17px, piccolo 15px.
Nessuna etichetta tutta in maiuscolo, con un'unica eccezione voluta: il marchio "DATI DI ESEMPIO" richiesto per i dati fittizi.

### Accessibilità

Contrasto WCAG AA per tutte le coppie testo/fondo, focus visibile (anello eosina), aree di tocco ≥ 44 px,
`prefers-reduced-motion` rispettato da tutte le animazioni.
