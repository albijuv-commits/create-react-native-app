import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "rinite-allergica",
  name: "Rinite allergica",
  aliases: ["febbre da fieno", "allergia ai pollini", "pollinosi", "raffreddore da fieno"],
  areas: ["orl"],
  bodyZones: ["naso", "occhi"],

  overview:
    "La rinite allergica è un'infiammazione del naso dovuta a una reazione esagerata del sistema immunitario a sostanze innocue, come i pollini. Provoca starnuti, naso che cola e prurito, spesso nello stesso periodo ogni anno, e con le cure giuste si tiene bene sotto controllo.",

  animation: {
    scene: "reazione-allergica",
    params: { allergene: "polline", sede: "naso" },
    captions: [
      "Un granulo di polline, grande pochi centesimi di millimetro, arriva nel naso con l'aria che respiri.",
      "Nelle persone allergiche alcune cellule del naso, i mastociti, sono già coperte di anticorpi IgE pronti a riconoscerlo.",
      "Il polline si lega agli anticorpi e i mastociti liberano istamina e altre sostanze.",
      "L'istamina fa gonfiare la mucosa e stimola i nervi: arrivano starnuti, prurito e naso che cola.",
    ],
  },

  history: {
    nameOrigin:
      "«Rinite» viene dal greco «rhis, rhinos», naso. Il nome popolare «febbre da fieno» nasce in Inghilterra nell'Ottocento, quando si pensava che il disturbo venisse dal fieno appena tagliato.",
    events: [
      {
        when: "1819",
        text: "Il medico inglese John Bostock presenta a Londra il proprio caso di disturbo estivo agli occhi e al petto: è la prima descrizione medica moderna.",
      },
      {
        when: "1873",
        text: "Il medico inglese Charles Blackley dimostra, con esperimenti su sé stesso, che la causa è il polline.",
      },
      {
        when: "1906",
        text: "Il pediatra austriaco Clemens von Pirquet conia la parola «allergia», dal greco «allos», altro, ed «ergon», azione.",
      },
      {
        when: "1911",
        text: "Leonard Noon e John Freeman provano le prime iniezioni di estratti di polline: nasce l'immunoterapia.",
      },
      {
        when: "1937",
        text: "Daniel Bovet scopre le prime sostanze antistaminiche. Riceverà il premio Nobel nel 1957.",
      },
      {
        when: "1966-1967",
        text: "Kimishige e Teruko Ishizaka scoprono gli anticorpi IgE, protagonisti delle reazioni allergiche.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Sara, 22 anni: il raffreddore che torna ogni primavera",
      story:
        "Ogni anno ad aprile Sara ha starnuti a raffica, naso che cola e occhi che prudono, ma niente febbre. Il medico le propone i test allergici: risulta allergica alle graminacee. Con la cura consigliata e qualche accorgimento nelle giornate ventose, la primavera diventa molto più sopportabile.",
      lesson:
        "Sintomi che tornano ogni anno nello stesso periodo, senza febbre, fanno pensare a un'allergia. I test aiutano a capire la causa e a scegliere la cura.",
    },
  ],

  causes: [
    "Pollini di alberi, graminacee ed erbe come ambrosia e parietaria.",
    "Acari della polvere, peli e forfora di animali, muffe.",
    "Polveri sul lavoro, ad esempio di farina o di lattice.",
  ],
  riskFactors: [
    "Familiari con allergie, asma o dermatite atopica.",
    "Avere già asma o dermatite atopica.",
    "Esposizione al fumo di sigaretta.",
    "Vivere in zone con molti pollini o molto inquinate.",
  ],

  symptoms: {
    typical: [
      "Starnuti, spesso a raffica",
      "Naso che cola o chiuso",
      "Prurito al naso e al palato",
      "Occhi rossi, che prudono e lacrimano",
    ],
    lessCommon: ["Tosse", "Stanchezza e sonno disturbato", "Olfatto ridotto", "Peggioramento dell'asma"],
  },

  treatments: {
    options: [
      {
        title: "Ridurre il contatto con l'allergene",
        text: "È il primo passo: ad esempio, nelle giornate con molto polline tieni chiuse le finestre nelle ore più ventose.",
      },
      {
        title: "Antistaminici",
        text: "Riducono starnuti, prurito e naso che cola. Alcuni si comprano senza ricetta: chiedi al farmacista quale è adatto a te.",
      },
      {
        title: "Spray nasali con cortisone",
        text: "Riducono l'infiammazione del naso e funzionano meglio se usati con regolarità. Chiedi al medico o al farmacista come usarli.",
      },
      { title: "Lavaggi nasali", text: "La soluzione salina rimuove polline e muco dal naso." },
      {
        title: "Immunoterapia specifica",
        text: "Il cosiddetto vaccino per le allergie: l'allergene viene dato in piccole quantità crescenti, per bocca o con iniezioni, per alcuni anni. La prescrive l'allergologo.",
      },
    ],
    selfCare: [
      "Indossa occhiali da sole avvolgenti nelle giornate con molto polline.",
      "Quando rientri a casa fai la doccia e cambia i vestiti.",
      "Non stendere il bucato all'aperto nei periodi di massima fioritura.",
      "Consulta i bollettini dei pollini della tua regione.",
      "Non usare i decongestionanti nasali per più di 5 giorni di seguito.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "I sintomi disturbano il sonno, lo studio o il lavoro.",
      "I prodotti da banco non bastano.",
      "Non sai che cosa scateni i sintomi.",
      "Hai anche l'asma e sta peggiorando.",
    ],
    urgent: [
      "Respiri con fatica, hai un sibilo che non passa o non riesci a parlare.",
      "Ti si gonfiano labbra, lingua o gola.",
    ],
  },

  prevention: [
    "Riduci il contatto con gli allergeni che ti fanno reagire.",
    "Tieni la casa asciutta e ben ventilata, per limitare muffe e acari.",
    "Non fumare.",
    "Chiedi all'allergologo se l'immunoterapia fa per te: può ridurre i sintomi negli anni.",
  ],

  specialist: {
    id: "allergologo",
    why: "L'allergologo conferma l'allergia con test sulla pelle o del sangue e valuta se proporre l'immunoterapia.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Rinite allergica",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/r/rinite-allergica",
      lang: "it",
    },
    { publisher: "NHS", title: "Allergic rhinitis", url: "https://www.nhs.uk/conditions/allergic-rhinitis/", lang: "en" },
    { publisher: "MedlinePlus", title: "Hay Fever", url: "https://medlineplus.gov/hayfever.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["starnuti", "naso-che-cola", "prurito-naso", "prurito-occhi"],
    otherSymptoms: ["naso-chiuso", "lacrimazione", "occhi-rossi", "tosse-secca", "stanchezza"],
    moreLikelyIf: [
      "I sintomi tornano ogni anno nella stessa stagione.",
      "Peggiorano all'aperto, nelle giornate ventose o vicino a prati e alberi.",
      "Non hai febbre.",
    ],
    lessLikelyIf: ["Hai febbre e dolori in tutto il corpo.", "Il muco è denso e colorato e hai dolore al viso."],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
