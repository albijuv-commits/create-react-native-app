---
target: pagine Condizioni
total_score: 30
p0_count: 0
p1_count: 2
timestamp: 2026-10-07T17-41-55Z
slug: src-app-condizioni
---
⚠️ DEGRADED: single-context (la sessione usa i sub-agenti solo su richiesta esplicita; manca PRODUCT.md, contesto preso da docs/PIANO.md e dalla specifica del progetto)

Target: pagine Condizioni (`src/app/condizioni`, `src/components/conditions`, visore del vetrino)
Strumenti: Impeccable critique + audit (rilevatore CLI e iniezione nel browser su 5 viste), linee guida web Vercel, skill emil-design-eng e interaction-design.

## Design Health Score (Nielsen)

| # | Euristica | Voto | Problema principale |
|---|---|---|---|
| 1 | Visibilità dello stato del sistema | 3 | Conteggio live dei risultati e passi del visore ok; il filtro non sopravvive a un ricaricamento |
| 2 | Corrispondenza con il mondo reale | 4 | Italiano semplice in seconda persona, altri nomi cercabili, barre di scala con unità reali |
| 3 | Controllo e libertà | 3 | Pulsante per cancellare, chip «Tutte», Indietro; ricerca e filtro persi al reload |
| 4 | Coerenza e standard | 3 | Bordi laterali nei callout contro bordi pieni nei box di urgenza; anello di focus che cambia il raggio |
| 5 | Prevenzione degli errori | 3 | Ricerca tollerante ad accenti e parole parziali |
| 6 | Riconoscimento invece di memoria | 3 | Indice delle sezioni presente, ma la sezione di sicurezza non si distingue |
| 7 | Flessibilità ed efficienza | 2 | Nessun link condivisibile a una ricerca o a un filtro |
| 8 | Estetica e minimalismo | 3 | Palette sobria e vetrino distintivo; troppi riquadri identici in Cure e Fonti |
| 9 | Recupero dagli errori | 3 | Stato vuoto con prossimo passo, 404 in italiano (stato HTTP 200 con noindex) |
| 10 | Aiuto e documentazione | 3 | Fonti verificate, avviso di revisione, nota sui farmaci |
| **Totale** | | **30/40** | **Buono** |

## Verdetto anti-pattern

Valutazione LLM: non sembra generato in serie. Il vetrino al microscopio è un elemento firma vero, la palette è trattenuta, niente gradienti, niente eyebrow maiuscoli. Rischi: troppi riquadri della stessa forma nella scheda e due bordi laterali colorati.

Scansione deterministica: CLI 2 risultati (`side-tab` in `condition-article.tsx:120` e `ui/callout.tsx:38`). Browser: `side-tab` (2), `cramped-padding` su chip e pulsanti (3), `single-font` (intenzionale: Atkinson Hyperlegible è richiesto dalla specifica). `gradient-text` e «X theater» erano falsi positivi: corrispondenze con il codice del rilevatore stesso iniettato inline; caricandolo da URL spariscono. `gray-on-color` in tema scuro sui box primary-soft: contrasto circa 12:1 e testo già tinto verso il viola, nessuna azione.

## Cosa funziona

1. Il vetrino: scene originali, barra di scala reale, didascalie per passo, alternativa statica con movimento ridotto.
2. Le urgenze: colore + icona + testo, pulsante «Chiama il 112» sempre a portata.
3. Stato vuoto che insegna (prova un sintomo, oppure descrivi cosa senti).

## Problemi prioritari

- [P1] Focus coperto dalle barre fisse (WCAG 2.4.11): navigando con Tab un elemento può finire sotto la barra in alto o la navigazione in basso. Correzione: `scroll-padding-top` e `scroll-padding-bottom` sull'html.
- [P1] Bordi laterali colorati (divieto assoluto di Impeccable) nel componente Callout e nell'origine del nome. Correzione: bordo pieno con fondo tinto; origine del nome come sottosezione con titolo.
- [P2] Ricerca e filtro non nell'URL (Vercel): reload e condivisione perdono lo stato. Correzione: sincronizzare `?q=` e `?area=` con `history.replaceState`.
- [P2] Sezione di sicurezza poco trovabile: «Quando andare dal medico» è l'ottava di undici (ordine fissato dalla specifica) e il suo chip è uguale agli altri. Correzione: chip con colore e icona di urgenza.
- [P2] Riquadri identici in serie (Cure, Fonti): monotonia visiva. Correzione: elenchi con divisori.

## Persona red flags

- Casey (mobile, distratta): dopo un'interruzione con ricarica perde la ricerca; l'azione «Trova vicino a me» è in fondo a una pagina lunga.
- Sam (screen reader, tastiera): 15 regioni-landmark «Lettera A…» e titoli delle lettere nascosti; nomi dei link lunghissimi (nome + anteprima); focus che può sparire sotto la navigazione fissa; il caso clinico usa `figcaption` in mezzo alla `figure` (HTML non valido).
- Jordan (prima volta): l'avviso «non revisionato» è discreto come richiesto, ma va bene; nessun blocco.

## Osservazioni minori

- Chip e pulsanti senza padding verticale: con testo grande (125%) le etichette su due righe toccano i bordi.
- Pressione dei pulsanti senza feedback su secondari e ghost; indicatore della navigazione con molla (leggero rimbalzo).
- `backdrop-blur` sulle barre al 95% di opacità: effetto quasi invisibile, costo di composizione sui telefoni economici.
- Titoli senza `text-wrap: balance` (vedova «polvere» in «Allergia agli acari della polvere»), testi senza `text-wrap: pretty`.
- Campo di ricerca: manca `name`, il placeholder non termina con «…», `focus:outline-none` sostituisce l'anello di focus comune.
- `transition-all` sui pallini dei passi; etichette dei controlli a 12px.
- «Abbiamo scritto la scheda…»: prima persona in un'app che parla in seconda persona.
- `:focus-visible` globale imposta `border-radius: 6px` e squadra i chip arrotondati quando ricevono il focus.
- 40 anteprime SVG nell'elenco: `content-visibility: auto` sulle righe evita il rendering fuori schermo.

## Domande

- E se la scheda offrisse in cima un accesso diretto a «Quando andare dal medico», senza cambiare l'ordine delle sezioni?
- Una ricerca condivisibile (`/condizioni?q=tosse`) potrebbe servire anche ai risultati dell'intervista della fase 3?
