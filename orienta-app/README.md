# Orienta per iOS e Android

L'app nativa di Orienta, fatta con [Expo](https://expo.dev) (SDK 57, React Native 0.86, Expo Router). È la stessa Orienta della web app in [`../orienta`](../orienta): **orienta, non diagnostica**.

La logica senza interfaccia non è copiata: l'app importa direttamente dalla web app le schede delle condizioni, i vocabolari, i segnali d'allarme, il riconoscimento dei sintomi, il motore a regole, gli schemi Zod e le illustrazioni. Una correzione fatta lì vale subito anche qui.

## Avvio

```bash
cd orienta-app
npm install
npx expo start      # apri l'app con Expo Go sul telefono (QR code) o in un simulatore
```

Serve anche la cartella `../orienta` con le sue dipendenze installate (`npm install` lì), perché il controllo dei tipi segue il codice condiviso.

| Comando | Cosa fa |
| --- | --- |
| `npx expo start` | Server di sviluppo: Expo Go, simulatori, oppure `w` per il browser |
| `npm test` | Test con Jest e Testing Library (`tests/`) |
| `npm run typecheck` / `npm run lint` | Controlli statici |
| `npm run export:web` | Esporta la versione web in `dist/` (utile per controllare le schermate) |
| `npx expo-doctor` | Controlla configurazione e versioni dei pacchetti |

## Struttura

- `src/app/`: le schermate (Expo Router). `(tabs)/` contiene le cinque schede (Sintomi, Condizioni, Medici, Mercato, Profilo); `(tabs)/condizioni/` ha elenco e scheda nella stessa pila, così la barra delle sezioni resta visibile; `emergenza.tsx` è sempre raggiungibile dal pulsante rosso in alto. `vetrino.tsx` è la galleria di tutte le scene per chi rivede i contenuti: non ha link nell'app, si apre con `orienta://vetrino` (o `/vetrino` nella versione web).
- `src/components/`: componenti dell'app (`ui/` per testo, pulsanti, schede, selettori; `conditions/` per elenco e scheda; `slide/` per il vetrino).
- `src/lib/illustrations.ts`: le illustrazioni della web app per condizioni, specialisti e aree del corpo. È generato: dopo aver aggiunto o tolto un'illustrazione in `../orienta/src/assets/illustrations` lancia `node scripts/gen-illustrations.mjs`.
- `src/theme/`: colori della web app in chiaro e scuro, scala tipografica con Atkinson Hyperlegible, preferenze di tema e dimensione del testo (salvate sul telefono con lo stesso schema della web app).
- Alias: `~/` è il codice dell'app, `@/` e `@data/` sono `../orienta/src` e `../orienta/data`. `metro.config.js` fa vedere a Metro i file condivisi e risolve i pacchetti che usano (per esempio `zod`) dai `node_modules` dell'app, così ogni pacchetto esiste in una sola copia. I moduli `server-only` della web app non si importano mai: la base di conoscenza sta in `lib/conditions/knowledge-base.ts`.

## Il vetrino animato

Le 25 scene del vetrino sono le stesse della web app, disegnate con `react-native-svg` e animate con Reanimated: stessi passi, stesse didascalie, stessi colori. Il motore è in `src/components/slide/`:

- `motion.tsx` fa le veci di `motion` della web app (`animate`, `initial={false}`, `transition`): sposta, scala e ruota gli elementi con una matrice SVG calcolata sul thread dell'interfaccia. Come in motion, scala e rotazione girano intorno al centro della figura: dove la figura non è disegnata intorno a 0,0 la scena indica il centro con `pivot` (misurato nella web app).
- `idle.tsx` contiene i movimenti continui leggeri (le classi `idle-*` della web app: fluttuare, pulsare, battere, scorrere…). Partono solo mentre la scena è in riproduzione.
- `slide-viewer.tsx` è il vetrino della scheda: non parte da solo, si guida con Indietro, Riproduci/Pausa e Avanti, si scorre di lato per cambiare passo e si tiene premuto per la lente d'ingrandimento. Per VoiceOver e TalkBack è un controllo regolabile (scorri in su o in giù per cambiare passo).
- Con «Riduci movimento» attivo nelle impostazioni del telefono le scene diventano illustrazioni statiche con tutte le didascalie in elenco.
- Le anteprime dell'elenco usano la scena «ferma» (`still`): niente transizioni, così 40 vetrini insieme restano leggeri; si muovono per qualche secondo quando la riga entra nello schermo.

I test (`tests/slides.test.tsx`) disegnano ogni scheda a ogni passo, ferma e animata. Il confronto visivo con la web app si fa con la versione web esportata (`npm run export:web`, poi `npx expo serve`): la pagina `/vetrino` delle due app mostra le stesse scene passo per passo.

## Accessibilità

Aree di tocco di almeno 44 pt, ruoli ed etichette per VoiceOver e TalkBack (intestazioni, pulsanti, scelte, sezioni che si aprono), colori con contrasto AA nei due temi, urgenza mai indicata dal solo colore. Il testo segue la dimensione scelta nelle impostazioni del telefono e, in più, quella del Profilo.

## Fasi

1. **Base** (fatta): progetto, navigazione a schede, design system, Emergenza con 112 e numeri di aiuto, preferenze.
2. **Condizioni** (fatta): elenco con ricerca per nome o sintomo e filtro per area del corpo, anteprime animate, schede complete (storia, casi, cause, sintomi, cure, quando andare dal medico, prevenzione, specialista, fonti), vetrino animato.
3. Sintomi: intervista, segnali d'allarme, risultati, riepilogo per il medico.
4. Medici: posizione, ricerca, mappa, contatti.
5. Mercato: catalogo AIFA, schede dei farmaci, preferiti e confronto.
6. Profilo e privacy, rifinitura, build installabili con EAS.

Le chiamate esterne (intervista con l'AI, ricerca dei medici, catalogo dei farmaci) passano dalle route server della web app, come chiede il progetto: nessuna chiave finisce nell'app. Per usarle sul telefono la web app andrà pubblicata; per le build da installare servirà un account Expo (EAS Build).

Prima di pubblicare l'app negli store valgono le stesse verifiche della web app: [nota sul Regolamento UE sui dispositivi medici](../orienta/README.md#regolamento-ue-sui-dispositivi-medici-mdr), dati del titolare per l'informativa privacy, revisione medica delle schede.
