import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "allergia-acari",
  name: "Allergia agli acari della polvere",
  aliases: ["acari", "allergia alla polvere", "rinite da acari"],
  areas: ["orl", "respiro"],
  bodyZones: ["naso", "occhi", "petto"],

  overview:
    "L'allergia agli acari della polvere è una reazione del sistema immunitario a minuscoli aracnidi che vivono in materassi, cuscini, divani e tappeti. Dà sintomi simili a un raffreddore che non passa, spesso peggiori al mattino o in casa, e può accompagnarsi all'asma.",

  animation: {
    scene: "reazione-allergica",
    params: { allergene: "acaro", sede: "naso" },
    captions: [
      "L'acaro della polvere è lungo circa tre decimi di millimetro: invisibile a occhio nudo, vive dove trova pelle morta, calore e umidità.",
      "Le particelle dei suoi escrementi si sollevano rifacendo il letto e arrivano nel naso, dove i mastociti delle persone allergiche hanno anticorpi IgE pronti a riconoscerle.",
      "Il contatto fa liberare istamina dai mastociti.",
      "La mucosa si gonfia e cola: starnuti e naso chiuso e, se l'allergia arriva ai bronchi, a volte respiro sibilante.",
    ],
  },

  history: {
    nameOrigin:
      "Il nome scientifico dell'acaro più diffuso nelle case, Dermatophagoides, significa «mangiatore di pelle»: si nutre delle minuscole squame di pelle che perdiamo ogni giorno.",
    events: [
      {
        when: "Anni '20",
        text: "I medici notano che la polvere di casa scatena reazioni nelle persone allergiche, ma non riescono a capire che cosa contenga di così irritante.",
      },
      {
        when: "1964",
        text: "In Olanda Reindert Voorhorst e Frits Spieksma dimostrano che l'allergene principale della polvere domestica viene dagli acari.",
      },
      {
        when: "1980",
        text: "Martin Chapman e Thomas Platts-Mills isolano Der p 1, la proteina degli acari più importante per le allergie.",
      },
      {
        when: "Oggi",
        text: "Esistono immunoterapie specifiche per l'allergia agli acari, anche in compresse da sciogliere sotto la lingua.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Davide, 9 anni: il raffreddore che non finisce mai",
      story:
        "Davide si sveglia quasi ogni mattina con il naso chiuso e gli starnuti, e di notte a volte tossisce. Non ha febbre. Il pediatra lo invia all'allergologo e i test confermano l'allergia agli acari. Fodere antiacaro, lenzuola lavate a 60 °C e la cura prescritta migliorano molto il suo sonno.",
      lesson:
        "Un raffreddore che dura settimane, peggiore al mattino e senza febbre, può essere un'allergia. Curarla bene aiuta anche a tenere sotto controllo l'asma.",
    },
  ],

  causes: [
    "Una proteina contenuta negli escrementi e nei resti degli acari, che si sollevano nell'aria con la polvere.",
    "Gli acari vivono in materassi, cuscini, divani, tappeti e peluche e prosperano dove fa caldo ed è umido.",
  ],
  riskFactors: [
    "Familiari con allergie o asma.",
    "Avere altre allergie, dermatite atopica o asma.",
    "Casa umida e poco ventilata.",
  ],

  symptoms: {
    typical: [
      "Starnuti e naso che cola o chiuso, spesso al risveglio",
      "Prurito a naso, palato e occhi",
      "Occhi rossi che lacrimano",
      "Tosse, soprattutto di notte",
    ],
    lessCommon: [
      "Respiro sibilante e petto stretto, se c'è asma",
      "Sonno disturbato e stanchezza",
      "Peggioramento della dermatite atopica",
    ],
  },

  treatments: {
    options: [
      { title: "Ridurre gli acari in casa", text: "È la base della cura: trovi i consigli nella sezione Prevenzione." },
      {
        title: "Antistaminici e spray nasali con cortisone",
        text: "Controllano i sintomi di naso e occhi. Chiedi al medico o al farmacista quali usare.",
      },
      { title: "Farmaci per l'asma", text: "Se c'è asma, il medico prescrive farmaci da inalare specifici." },
      {
        title: "Immunoterapia specifica",
        text: "L'allergologo può proporre una terapia desensibilizzante della durata di alcuni anni, anche in compresse da sciogliere sotto la lingua.",
      },
    ],
    selfCare: [
      "Usa fodere antiacaro per materasso e cuscini.",
      "Lava lenzuola e federe ogni settimana ad almeno 60 °C.",
      "Spolvera con un panno umido e usa un aspirapolvere con filtro HEPA.",
      "Arieggia ogni giorno, soprattutto la camera da letto.",
      "In camera riduci tappeti, tende pesanti e peluche.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "I sintomi durano settimane o disturbano il sonno.",
      "Hai tosse notturna o respiro sibilante.",
      "I prodotti da banco non bastano.",
    ],
    urgent: [
      "La difficoltà a respirare peggiora rapidamente.",
      "Non riesci a parlare per la mancanza di fiato o hai le labbra bluastre.",
    ],
  },

  prevention: [
    "Proteggi materasso e cuscini con fodere antiacaro.",
    "Tieni bassa l'umidità di casa, idealmente sotto il 50%.",
    "Arieggia la camera da letto ogni giorno.",
    "Lava la biancheria del letto a 60 °C.",
  ],

  specialist: {
    id: "allergologo",
    why: "L'allergologo conferma l'allergia con i test e valuta l'immunoterapia; se c'è asma, la cura si imposta insieme al medico o al pneumologo.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Allergia agli acari della polvere",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/a/allergia-agli-acari-della-polvere",
      lang: "it",
    },
    { publisher: "NHS", title: "Allergic rhinitis", url: "https://www.nhs.uk/conditions/allergic-rhinitis/", lang: "en" },
    { publisher: "MedlinePlus", title: "Allergy", url: "https://medlineplus.gov/allergy.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["starnuti", "naso-chiuso", "naso-che-cola", "prurito-naso"],
    otherSymptoms: ["prurito-occhi", "lacrimazione", "tosse-secca", "respiro-sibilante", "sonno-non-ristoratore"],
    moreLikelyIf: [
      "I sintomi peggiorano al mattino, a letto o mentre fai le pulizie.",
      "Durano tutto l'anno invece che in una sola stagione.",
      "Non hai febbre.",
    ],
    lessLikelyIf: [
      "I sintomi compaiono solo in primavera e all'aperto: è più tipico dei pollini.",
      "Hai febbre o dolori in tutto il corpo.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
