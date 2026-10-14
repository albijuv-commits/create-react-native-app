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
| `npx expo export --platform ios --platform android` | Prepara i bundle nativi (Hermes) come in una build, senza account: utile per controllare che tutto compili |

Per l'intervista con l'intelligenza artificiale, la ricerca dei medici e il catalogo completo dei farmaci copia `.env.example` in `.env.local` e scrivi in `EXPO_PUBLIC_API_URL` l'indirizzo della web app pubblicata. Senza, l'app funziona lo stesso: l'intervista usa le regole fisse sul telefono (e la casella dell'AI non compare), Medici e Mercato mostrano DATI DI ESEMPIO, sempre etichettati.

## Struttura

- `src/app/`: le schermate (Expo Router). `(tabs)/` contiene le cinque schede (Sintomi, Condizioni, Medici, Mercato, Profilo); `(tabs)/(sintomi)/` ha la pagina Sintomi, l'intervista (`/sintomi/intervista`) e la scheda di una condizione aperta dai risultati (`/sintomi/condizione/[id]`) nella stessa pila, così «Indietro» riporta ai risultati; `(tabs)/condizioni/` ha elenco e scheda nella stessa pila, così la barra delle sezioni resta visibile; `(tabs)/mercato/` ha catalogo, scheda della confezione (`/mercato/[aic]`) e confronto (`/mercato/confronto`), anche loro in una pila; `(tabs)/profilo/` ha il Profilo, le pagine informative (`/profilo/privacy`, `/profilo/avvertenze`, `/profilo/fonti`) e le schede delle condizioni aperte dallo storico (`/profilo/condizione/[id]`); `emergenza.tsx` è sempre raggiungibile dal pulsante rosso in alto. `vetrino.tsx` è la galleria di tutte le scene per chi rivede i contenuti: non ha link nell'app, si apre con `orienta://vetrino` (o `/vetrino` nella versione web).
- `src/components/`: componenti dell'app (`ui/` per testo, pulsanti, schede, selettori; `conditions/` per elenco e scheda; `slide/` per il vetrino; `triage/` per i passi dell'intervista; `body-map/` per la mappa del corpo; `emergency/` per il 112, i numeri di aiuto e la schermata Emergenza dell'intervista; `doctors/` per la sezione Medici; `medicines/` per il Mercato; `profile/` per storico, città predefinita, eliminazione dei dati e pagine informative). Se una schermata si blocca per un errore compare `error-screen.tsx`: nessun dettaglio tecnico, il 112 e «Riprova».
- `src/lib/illustrations.ts`: le illustrazioni della web app per condizioni, specialisti e aree del corpo. È generato: dopo aver aggiunto o tolto un'illustrazione in `../orienta/src/assets/illustrations` lancia `node scripts/gen-illustrations.mjs`.
- `src/theme/`: colori della web app in chiaro e scuro, scala tipografica con Atkinson Hyperlegible, preferenze di tema e dimensione del testo (salvate sul telefono con lo stesso schema della web app).
- Alias: `~/` è il codice dell'app, `@/` e `@data/` sono `../orienta/src` e `../orienta/data`. `metro.config.js` fa vedere a Metro i file condivisi e risolve i pacchetti che usano (per esempio `zod`) dai `node_modules` dell'app, così ogni pacchetto esiste in una sola copia. I moduli `server-only` della web app non si importano mai: la base di conoscenza sta in `lib/conditions/knowledge-base.ts`.
- `patches/`: correzioni alle librerie, applicate da `patch-package` a ogni `npm install`. Per ora una sola: in react-native-svg 15.15.4 un gruppo con opacità animata usava su Android la tela del gruppo che lo contiene, e quando l'opacità tornava sotto 1 l'app si chiudeva («Underflow in restore»). Succedeva con le anteprime del vetrino nell'elenco delle Condizioni. Quando si aggiorna react-native-svg va ricontrollata: se la nuova versione corregge il problema il file si cancella, altrimenti si rifà con `npx patch-package react-native-svg`.

## Il vetrino animato

Le 25 scene del vetrino sono le stesse della web app, disegnate con `react-native-svg` e animate con Reanimated: stessi passi, stesse didascalie, stessi colori. Il motore è in `src/components/slide/`:

- `motion.tsx` fa le veci di `motion` della web app (`animate`, `initial={false}`, `transition`): sposta, scala e ruota gli elementi con una matrice SVG calcolata sul thread dell'interfaccia. Come in motion, scala e rotazione girano intorno al centro della figura: dove la figura non è disegnata intorno a 0,0 la scena indica il centro con `pivot` (misurato nella web app).
- `idle.tsx` contiene i movimenti continui leggeri (le classi `idle-*` della web app: fluttuare, pulsare, battere, scorrere…). Partono solo mentre la scena è in riproduzione.
- `slide-viewer.tsx` è il vetrino della scheda: non parte da solo, si guida con Indietro, Riproduci/Pausa e Avanti, si scorre di lato per cambiare passo e si tiene premuto per la lente d'ingrandimento. Per VoiceOver e TalkBack è un controllo regolabile (scorri in su o in giù per cambiare passo).
- Con «Riduci movimento» attivo nelle impostazioni del telefono le scene diventano illustrazioni statiche con tutte le didascalie in elenco.
- Le anteprime dell'elenco usano la scena «ferma» (`still`): niente transizioni, così 40 vetrini insieme restano leggeri; si muovono per qualche secondo quando la riga entra nello schermo.

I test (`tests/slides.test.tsx`) disegnano ogni scheda a ogni passo, ferma e animata. Il confronto visivo con la web app si fa con la versione web esportata (`npm run export:web`, poi `npx expo serve`): la pagina `/vetrino` delle due app mostra le stesse scene passo per passo.

## L'intervista sui sintomi

La stessa intervista della web app, passo per passo: consenso, età e sesso, descrizione (testo, sintomi da toccare e mappa del corpo fronte e retro, che si gira con «Gira» o trascinando di lato), da 5 a 12 domande, risultati. La logica è quella condivisa in `../orienta/src/lib/triage`; `src/components/triage/interview.tsx` la collega alle schermate.

- **Segnali d'allarme**: il controllo è deterministico, scritto in codice e mai affidato all'AI. Avviene mentre si scrive (con l'avviso e il pulsante per il 112 subito sotto il testo), dopo ogni risposta e alla prima domanda, che è sempre l'elenco dei segnali. Se ce n'è uno si va alla schermata Emergenza: prima il 112, poi cosa fare caso per caso; per i pensieri di farsi del male anche Telefono Amico e Telefono Azzurro, con per primo quello adatto all'età.
- **Le domande** sono carte: le sì/no si possono anche trascinare (a destra sì, a sinistra no), la scala da 0 a 10 ha un quadrante che segue il numero; sì/no, scelte e scala hanno sempre «Non so» e si può tornare indietro ritrovando la risposta data. Dopo una risposta, per un attimo un secondo tocco viene ignorato.
- **Motore**: senza consenso all'AI, o senza `EXPO_PUBLIC_API_URL`, le domande e il confronto con le schede si fanno sul telefono con le regole fisse, senza rete. Con il consenso esplicito i passi successivi alle domande fisse (segnali d'allarme, durata, intensità) vanno a `/api/triage` della web app: la chiave resta sul server, che non salva i dati e non li scrive nei log. Se il servizio non risponde si può riprovare o continuare con le regole fisse. Il modello sceglie solo tra le schede di Orienta e non indica farmaci.
- **Dati**: tutto resta in memoria finché l'intervista è aperta. Sul telefono si salva solo se, nei risultati, la persona tocca «Salva nello storico». Uscire a metà, o da risultati non salvati, chiede conferma; dalla schermata Emergenza no.
- **Risultati**: «Questa non è una diagnosi», il livello di urgenza con colore, icona e testo, cosa fare adesso (con il 116117 dove serve), i quattro livelli da esplorare, le condizioni compatibili con il perché, la scheda completa e lo specialista da cercare. Sotto i 14 anni il riferimento è il pediatra; sotto i 18 c'è l'invito a mostrare i risultati a un adulto.
- **Riepilogo per il medico**: si legge, si copia, si condivide o diventa un PDF creato sul telefono (`expo-print`) e condiviso con il sistema: su iPhone si cancella subito dopo, su Android (dove app come Drive o Quick Share lo leggono più tardi) alla condivisione successiva o con «Elimina tutti i miei dati». Toccando «Trova uno specialista» il riepilogo resta in memoria per sei ore, pronto per l'email al medico della sezione Medici.
- Con «Riduci movimento» le carte si sostituiscono senza volare via, la mappa si gira senza animazione e l'attesa è un'immagine ferma.

## Medici

La sezione Medici della web app, con gli stessi testi e le stesse regole (`src/components/doctors/`):

- **Chi cerchi**: i professionisti in una fila di riquadri illustrati, con il medico di base sempre per primo. Arrivando dai risultati dell'intervista o da una scheda lo specialista è già scelto e segnato come «Consigliato»; per gli specialisti c'è il richiamo al medico di base come primo passo, per il pronto soccorso prima di tutto il 112.
- **Dove**: la posizione del telefono (`expo-location`), chiesta solo quando si tocca «Usa la mia posizione» e con il testo del permesso in italiano, oppure città o CAP. Prima di uscire dal telefono la posizione è arrotondata a circa 100 metri; le distanze si ricalcolano qui con le coordinate esatte. Se il permesso è negato, il pulsante porta alle impostazioni.
- **Risultati**: in lista o su una mappa schematica, con lo stesso numero. La mappa è disegnata nell'app (il punto di ricerca al centro, i cerchi delle distanze, ogni risultato nella sua direzione): niente mappe scaricate da un servizio, quindi nessuna chiave (Google Maps su Android la vorrebbe nell'app) e nessuna richiesta che riveli dove si trova la persona. Per arrivare si usano le «Indicazioni», nell'app di mappe del telefono. Con i risultati di Google la mappa non c'è, come nella web app.
- **Contatti**: chiama, email, sito e indicazioni compaiono solo se il dato esiste davvero. L'email si prepara in un foglio dove si vede a chi si scrive e cosa, si può togliere il riepilogo dei sintomi (se arriva dai risultati, solo in memoria) e poi si apre la propria app di posta: Orienta non invia nulla.
- **Servizio**: la ricerca passa da `/api/medici` e `/api/luoghi` della web app (`EXPO_PUBLIC_API_URL`), che tengono le chiavi. Senza indirizzo l'app mostra solo DATI DI ESEMPIO, sempre etichettati, e la ricerca per città non compare.
- **Come prenotare**: visita privata o con il Servizio sanitario nazionale (ricetta del medico di base, poi CUP), con la fonte del Ministero della Salute.

## Mercato

Il catalogo informativo dei medicinali della web app, con gli stessi dati AIFA e gli stessi testi (`src/components/medicines/`): qui non si compra, e Orienta non suggerisce farmaci per i sintomi.

- **Catalogo**: ricerca per nome o principio attivo (parte quando si smette di scrivere), le forme farmaceutiche come riquadri illustrati, filtri per ricetta, fascia di prezzo e categoria ATC, ordine per nome o per prezzo. Ogni confezione mostra il prezzo con la data delle liste AIFA («indicativo» per i farmaci senza ricetta), il regime di fornitura con colore, icona e testo, e un riquadro da aprire con marchi, aziende e fascia di prezzo dello stesso principio attivo, caricato solo quando lo si apre.
- **Scheda** (`/mercato/[aic]`): prezzo e prezzo di riferimento SSN, dove si trova secondo la ricetta (con il link per verificare i siti di vendita online autorizzati), il foglietto illustrativo ufficiale della Banca Dati Farmaci, le informazioni principali, la scheda del principio attivo, gli equivalenti dal più economico, marchi e aziende e, con il servizio, gli stessi principi attivi negli altri Paesi europei. In cima, i pulsanti per andare a ogni sezione.
- **Preferiti e confronto**: restano solo sul telefono (AsyncStorage, con chiavi che iniziano per `orienta:`), fino a 50 preferiti e 3 confezioni nel confronto. Sul telefono la tabella del confronto diventa una riga per voce con le confezioni affiancate, senza scorrere di lato; VoiceOver e TalkBack leggono ogni valore con il nome della confezione.
- **Servizio**: con `EXPO_PUBLIC_API_URL` il catalogo completo arriva dalle route della web app (`/api/farmaci`, `/api/farmaci/elenco`, `/api/farmaci/marchi` e `/api/farmaci/scheda`), con i termini cercati e i codici nel corpo delle richieste, mai negli indirizzi. Senza, l'app cerca sul telefono il campione di 44 confezioni della web app, sempre etichettato come DATI DI ESEMPIO: `src/lib/catalog-sample.ts` applica le stesse regole delle query SQL (filtri, ordinamenti, equivalenti, marchi); i marchi europei stanno solo sul server. Le foto con licenza libera del campione viaggiano con l'app, le altre arrivano dalla web app; senza foto c'è l'illustrazione della forma.
- **Linguaggio neutro**: niente offerte, classifiche o parole da pubblicità (i test del Mercato lo controllano). I risultati dell'intervista non portano mai a un farmaco: da lì si va alle schede delle condizioni e agli specialisti, non al Mercato.

## Profilo e privacy

Il Profilo della web app (`src/app/(tabs)/profilo/`, `src/components/profile/`), senza account:

- **Preferenze**: tema e dimensione del testo; con il servizio di Orienta anche la città predefinita, che nei Medici diventa «Cerca a …».
- **Storico delle sessioni**: una sessione si salva solo con «Salva nello storico» nei risultati, con lo stesso schema Zod della web app (`historyEntrySchema`), al massimo 50. Per ognuna: data, età, metodo, urgenza, condizioni (che si aprono nella pila del Profilo) e il riepilogo per il medico da leggere, copiare, condividere o trasformare in PDF. Si elimina una alla volta o tutto insieme, sempre con una conferma.
- **«Elimina tutti i miei dati»**: dopo la conferma del sistema cancella tutte le chiavi `orienta:` di AsyncStorage (storico, preferenze, città, preferiti e confronto), il riepilogo in memoria per i Medici, un'intervista lasciata a metà e gli eventuali PDF rimasti nella cartella temporanea (`src/lib/erase.ts`).
- **Pagine informative**: Informativa privacy, Avvertenze mediche e Fonti, con indice che porta alle sezioni. L'informativa descrive ciò che l'app fa davvero: dati solo sul telefono, posizione arrotondata, nessuna analisi. Titolare e contatto non si inventano: si mettono nella build con `EXPO_PUBLIC_PRIVACY_CONTROLLER` ed `EXPO_PUBLIC_PRIVACY_CONTACT`; finché mancano, la pagina lo dice.
- **Sul telefono**: su Android i dati sono esclusi dal backup automatico su Google Drive (`android.allowBackup: false`); l'app chiede i permessi di internet e posizione, mentre quelli del modello di progetto che non servono (finestre sopra le altre app, vibrazione, memoria esterna) sono bloccati con `android.blockedPermissions`.

## Accessibilità

Aree di tocco di almeno 44 pt, ruoli ed etichette per VoiceOver e TalkBack (intestazioni, pulsanti, scelte, sezioni che si aprono), colori con contrasto AA nei due temi, urgenza mai indicata dal solo colore. Il testo segue la dimensione scelta nelle impostazioni del telefono e, in più, quella del Profilo.

## Fasi

1. **Base** (fatta): progetto, navigazione a schede, design system, Emergenza con 112 e numeri di aiuto, preferenze.
2. **Condizioni** (fatta): elenco con ricerca per nome o sintomo e filtro per area del corpo, anteprime animate, schede complete (storia, casi, cause, sintomi, cure, quando andare dal medico, prevenzione, specialista, fonti), vetrino animato.
3. **Sintomi** (fatta): intervista con consenso, mappa del corpo, carte delle domande, segnali d'allarme deterministici, risultati con urgenza e condizioni compatibili, riepilogo per il medico (copia, condivisione, PDF); AI facoltativa tramite la web app.
4. **Medici** (fatta): specialisti illustrati con il consigliato, posizione o città, distanza, lista e mappa schematica, contatti, email con il riepilogo dei sintomi, come prenotare.
5. **Mercato** (fatta): catalogo AIFA con ricerca, forme illustrate e filtri, schede con equivalenti, marchi e principio attivo, preferiti e confronto salvati sul telefono, campione di esempio senza servizio.
6. **Profilo e privacy** (fatta): storico delle sessioni sul telefono, città predefinita, «Elimina tutti i miei dati», Informativa privacy, Avvertenze mediche e Fonti, schermata d'errore con il 112, configurazione delle build con EAS.

Le chiamate esterne (intervista con l'AI, ricerca dei medici, catalogo dei farmaci) passano dalle route server della web app, come chiede il progetto: nessuna chiave finisce nell'app. Per usarle sul telefono la web app va pubblicata e il suo indirizzo messo in `EXPO_PUBLIC_API_URL`.

## Build da installare (EAS)

`eas.json` ha due profili: `preview` (distribuzione interna: un APK da installare direttamente su Android, una build ad hoc per gli iPhone registrati) e `production` (AAB per Google Play e build per l'App Store, con il numero di build che EAS aumenta da solo: `appVersionSource: "remote"`). Servono un account Expo e, per gli store, gli account sviluppatore di Apple e Google; nessuna chiave va nel progetto.

```bash
npm install -g eas-cli         # versione 24.12 o successiva
eas login
eas init                       # collega il progetto: scrive owner e projectId in app.json (da salvare nel repository)
# indirizzo della web app e dati del titolare: non sono segreti, finiscono nell'app
eas env:set --name EXPO_PUBLIC_API_URL --value https://indirizzo-della-web-app --environment preview --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_PRIVACY_CONTROLLER --value "…" --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_PRIVACY_CONTACT --value "…" --environment production --visibility plaintext
eas build --profile preview --platform android    # APK da installare
eas device:create && eas build --profile preview --platform ios
eas build --profile production --platform all
eas submit --profile production --platform android   # e poi ios
```

Gli identificativi dell'app (`ios.bundleIdentifier` e `android.package` in `app.json`) sono `io.github.albijuvcommits.orienta`, presi dall'account GitHub del progetto: se l'app esce con un altro nome o un altro titolare vanno cambiati prima del primo caricamento negli store, perché dopo non si possono più modificare. L'app usa solo la crittografia standard di iOS (`usesNonExemptEncryption: false`).

Prima di pubblicare l'app negli store valgono le stesse verifiche della web app: [nota sul Regolamento UE sui dispositivi medici](../orienta/README.md#regolamento-ue-sui-dispositivi-medici-mdr), dati del titolare per l'informativa privacy, revisione medica delle schede. In più vanno compilate, in modo coerente con l'informativa, la sezione privacy dell'App Store e quella sulla sicurezza dei dati di Google Play.

### APK di prova, senza account

Per provare l'app su un telefono Android senza un account Expo si può costruire l'APK sul proprio computer. Servono il JDK 17 o successivo e l'Android SDK con la piattaforma 36, i build-tools 36.0.0, l'NDK 27.1.12297006 e CMake 3.22.1, cioè le versioni che chiede React Native 0.86.

```bash
npx expo prebuild --platform android     # genera android/, che resta fuori dal repository
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a \
  -Pexpo.useLegacyPackaging=true \
  -Pandroid.enableMinifyInReleaseBuilds=true \
  -Pandroid.enableShrinkResourcesInReleaseBuilds=true
# l'APK è in android/app/build/outputs/apk/release/app-release.apk
```

- `prebuild` cambia anche gli script `android` e `ios` di `package.json`: quella modifica non va salvata.
- `arm64-v8a` limita l'APK ai telefoni a 64 bit, cioè quasi tutti quelli in uso. Le altre tre opzioni comprimono le librerie native e riducono il codice con R8: l'APK passa da circa 50 a meno di 30 MB.
- L'APK è firmato con la chiave di prova del progetto generato: si installa sul telefono (consentendo l'installazione di app sconosciute), ma per Google Play serve la build `production` di EAS.
- Senza `EXPO_PUBLIC_API_URL` l'app usa le regole fisse sul telefono e i DATI DI ESEMPIO.
