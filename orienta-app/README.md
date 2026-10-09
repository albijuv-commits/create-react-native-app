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

- `src/app/`: le schermate (Expo Router). `(tabs)/` contiene le cinque schede (Sintomi, Condizioni, Medici, Mercato, Profilo); `emergenza.tsx` è sempre raggiungibile dal pulsante rosso in alto.
- `src/components/`: componenti dell'app (`ui/` per testo, pulsanti, schede, selettori).
- `src/theme/`: colori della web app in chiaro e scuro, scala tipografica con Atkinson Hyperlegible, preferenze di tema e dimensione del testo (salvate sul telefono con lo stesso schema della web app).
- Alias: `~/` è il codice dell'app, `@/` e `@data/` sono `../orienta/src` e `../orienta/data`. `metro.config.js` fa vedere a Metro i file condivisi e risolve i pacchetti che usano (per esempio `zod`) dai `node_modules` dell'app, così ogni pacchetto esiste in una sola copia. I moduli `server-only` della web app non si importano mai: la base di conoscenza sta in `lib/conditions/knowledge-base.ts`.

## Accessibilità

Aree di tocco di almeno 44 pt, ruoli ed etichette per VoiceOver e TalkBack (intestazioni, pulsanti, scelte, sezioni che si aprono), colori con contrasto AA nei due temi, urgenza mai indicata dal solo colore. Il testo segue la dimensione scelta nelle impostazioni del telefono e, in più, quella del Profilo.

## Fasi

1. **Base** (fatta): progetto, navigazione a schede, design system, Emergenza con 112 e numeri di aiuto, preferenze.
2. Condizioni: elenco con ricerca e filtro, schede, vetrino animato.
3. Sintomi: intervista, segnali d'allarme, risultati, riepilogo per il medico.
4. Medici: posizione, ricerca, mappa, contatti.
5. Mercato: catalogo AIFA, schede dei farmaci, preferiti e confronto.
6. Profilo e privacy, rifinitura, build installabili con EAS.

Le chiamate esterne (intervista con l'AI, ricerca dei medici, catalogo dei farmaci) passano dalle route server della web app, come chiede il progetto: nessuna chiave finisce nell'app. Per usarle sul telefono la web app andrà pubblicata; per le build da installare servirà un account Expo (EAS Build).

Prima di pubblicare l'app negli store valgono le stesse verifiche della web app: [nota sul Regolamento UE sui dispositivi medici](../orienta/README.md#regolamento-ue-sui-dispositivi-medici-mdr), dati del titolare per l'informativa privacy, revisione medica delle schede.
