import { TELEFONO_AMICO, TELEFONO_AZZURRO, type Helpline } from "./helplines";

/**
 * I segnali d'allarme e cosa fare mentre arrivano i soccorsi. Le istruzioni sono brevi,
 * all'imperativo e non indicano farmaci né dosi (tranne l'uso di un dispositivo d'emergenza
 * già prescritto, come indicano le fonti). Fonti verificate il 2026-10-07.
 */
export const RED_FLAG_IDS = [
  "dolore-petto",
  "respiro",
  "ictus",
  "gonfiore-gola",
  "mal-di-testa-improvviso",
  "febbre-meningite",
  "svenimento-convulsioni",
  "sanguinamento",
  "autolesionismo",
  "monossido",
] as const;

export type RedFlagId = (typeof RED_FLAG_IDS)[number];

export interface RedFlag {
  id: RedFlagId;
  /** Voce dell'elenco «Hai uno di questi segnali?» */
  checklist: string;
  /** Titolo della schermata Emergenza */
  title: string;
  /** Cosa fare, in ordine */
  steps: string[];
  /** Numeri di ascolto da mostrare oltre al 112 */
  helplines: Helpline[];
  source: { title: string; url: string };
}

export const RED_FLAGS: Record<RedFlagId, RedFlag> = {
  "dolore-petto": {
    id: "dolore-petto",
    checklist: "Dolore al petto che opprime o stringe, o che si allarga a braccio, mandibola, collo o schiena",
    title: "Dolore al petto: può essere un problema al cuore",
    steps: [
      "Chiama subito il 112.",
      "Siediti e resta a riposo nella posizione più comoda.",
      "Non guidare e non metterti in viaggio da solo.",
      "Se sei solo, apri la porta di casa per i soccorsi, se ci riesci.",
    ],
    helplines: [],
    source: { title: "Heart attack (NHS, in inglese)", url: "https://www.nhs.uk/conditions/heart-attack/" },
  },
  respiro: {
    id: "respiro",
    checklist: "Fatica a respirare anche a riposo, o labbra e viso bluastri",
    title: "Difficoltà a respirare",
    steps: [
      "Chiama subito il 112.",
      "Stai seduto con la schiena dritta e allenta i vestiti stretti.",
      "Se hai un farmaco d'emergenza prescritto per il respiro, usalo come ti ha spiegato il medico.",
      "Non restare da solo.",
    ],
    helplines: [],
    source: { title: "Shortness of breath (NHS, in inglese)", url: "https://www.nhs.uk/symptoms/shortness-of-breath/" },
  },
  ictus: {
    id: "ictus",
    checklist: "Viso storto, braccio o gamba deboli da un lato, difficoltà improvvisa a parlare",
    title: "Possibile ictus: ogni minuto conta",
    steps: [
      "Chiama subito il 112 e di' che sospetti un ictus.",
      "Annota l'ora in cui sono comparsi i sintomi.",
      "Non dare da mangiare né da bere.",
      "Non aspettare che i sintomi passino da soli, anche se migliorano.",
    ],
    helplines: [],
    source: { title: "Symptoms of a stroke (NHS, in inglese)", url: "https://www.nhs.uk/conditions/stroke/symptoms/" },
  },
  "gonfiore-gola": {
    id: "gonfiore-gola",
    checklist: "Gonfiore di labbra, lingua o gola, o la sensazione che la gola si chiuda",
    title: "Possibile reazione allergica grave",
    steps: [
      "Chiama subito il 112.",
      "Se hai un autoiniettore di adrenalina prescritto, usalo come ti è stato insegnato.",
      "Se respiri male stai seduto; se ti senti svenire sdraiati con le gambe sollevate.",
      "Allontanati da ciò che potrebbe aver causato la reazione.",
    ],
    helplines: [],
    source: { title: "Anaphylaxis (NHS, in inglese)", url: "https://www.nhs.uk/conditions/anaphylaxis/" },
  },
  "mal-di-testa-improvviso": {
    id: "mal-di-testa-improvviso",
    checklist: "Mal di testa improvviso e fortissimo, il peggiore che tu abbia mai avuto",
    title: "Mal di testa improvviso e fortissimo",
    steps: [
      "Chiama subito il 112.",
      "Non guidare e non restare da solo.",
      "Stai a riposo in un luogo tranquillo finché arrivano i soccorsi.",
    ],
    helplines: [],
    source: { title: "Headaches (NHS, in inglese)", url: "https://www.nhs.uk/symptoms/headaches/" },
  },
  "febbre-meningite": {
    id: "febbre-meningite",
    checklist: "Febbre alta con collo rigido, o macchie sulla pelle che non scompaiono premendo",
    title: "Febbre con collo rigido o macchie: può essere un'infezione grave",
    steps: [
      "Chiama subito il 112 o vai al pronto soccorso più vicino.",
      "Premi un bicchiere di vetro sulle macchie: se restano visibili attraverso il vetro, è un'emergenza.",
      "Non aspettare che compaiano altri sintomi.",
    ],
    helplines: [],
    source: { title: "Meningitis (NHS, in inglese)", url: "https://www.nhs.uk/conditions/meningitis/symptoms/" },
  },
  "svenimento-convulsioni": {
    id: "svenimento-convulsioni",
    checklist: "Svenimento, perdita di coscienza o convulsioni",
    title: "Svenimento o convulsioni",
    steps: [
      "Chiama subito il 112.",
      "Durante le convulsioni allontana gli oggetti pericolosi e non mettere nulla in bocca alla persona.",
      "Quando finiscono, mettila sul fianco e controlla che respiri.",
      "Se non risponde e non respira normalmente, segui le istruzioni dell'operatore del 112.",
    ],
    helplines: [],
    source: { title: "Fainting (NHS, in inglese)", url: "https://www.nhs.uk/symptoms/fainting/" },
  },
  sanguinamento: {
    id: "sanguinamento",
    checklist: "Sanguinamento abbondante che non si ferma, vomito con sangue o feci nere",
    title: "Sanguinamento importante",
    steps: [
      "Chiama subito il 112.",
      "Se c'è una ferita, premi con forza con un panno pulito e non sollevarlo per controllare.",
      "Stai sdraiato e non mangiare né bere.",
    ],
    helplines: [],
    source: { title: "Vomiting blood (NHS, in inglese)", url: "https://www.nhs.uk/symptoms/vomiting-blood/" },
  },
  autolesionismo: {
    id: "autolesionismo",
    checklist: "Pensieri di farti del male o di toglierti la vita",
    title: "Non sei solo: chiedi aiuto adesso",
    steps: [
      "Se sei in pericolo immediato, chiama il 112.",
      "Parla con qualcuno adesso: puoi chiamare Telefono Amico Italia a qualsiasi ora.",
      "Se hai meno di 18 anni puoi chiamare Telefono Azzurro, anche solo per parlare.",
      "Allontana ciò che potresti usare per farti del male e resta vicino a una persona di fiducia.",
    ],
    helplines: [TELEFONO_AMICO, TELEFONO_AZZURRO],
    source: { title: "Telefono Amico Italia: come contattarci", url: TELEFONO_AMICO.source },
  },
  monossido: {
    id: "monossido",
    checklist: "In casa anche altre persone hanno mal di testa, nausea o sonnolenza",
    title: "Possibile intossicazione da monossido di carbonio",
    steps: [
      "Esci subito all'aria aperta con tutte le persone e gli animali.",
      "Se puoi farlo senza fermarti, lascia aperte porte e finestre.",
      "Chiama il 112 da fuori casa.",
      "Non rientrare finché un tecnico non ha controllato stufe, caldaie e camini.",
    ],
    helplines: [],
    source: { title: "Carbon monoxide poisoning (NHS, in inglese)", url: "https://www.nhs.uk/conditions/carbon-monoxide-poisoning/" },
  },
};
