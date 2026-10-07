import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "insonnia",
  name: "Insonnia",
  aliases: ["non riesco a dormire", "disturbi del sonno", "sonno disturbato", "risvegli notturni"],
  areas: ["mente"],
  bodyZones: ["testa"],

  overview:
    "L'insonnia è la difficoltà ad addormentarsi, a restare addormentati o a dormire abbastanza, che lascia stanchi e poco lucidi durante il giorno. Spesso è passeggera e legata a stress o cambiamenti; quando dura mesi, la cura più efficace è una forma di psicoterapia dedicata al sonno.",

  animation: {
    scene: "ciclo-sonno",
    params: {},
    captions: [
      "Durante la notte il sonno passa per cicli di circa 90 minuti, alternando sonno leggero, sonno profondo e sonno REM, quello dei sogni.",
      "Con l'insonnia ci vuole molto tempo per addormentarsi: la mente resta in allerta.",
      "Arrivano risvegli frequenti o troppo presto e il sonno profondo si accorcia: al mattino ci si sente stanchi.",
      "Orari regolari, buone abitudini e la terapia cognitivo-comportamentale aiutano a rendere il sonno più compatto.",
    ],
  },

  history: {
    nameOrigin: "Dal latino «insomnia», composto da «in-», che indica negazione, e «somnus», sonno.",
    events: [
      {
        when: "1953",
        text: "All'Università di Chicago, Eugene Aserinsky e Nathaniel Kleitman scoprono il sonno REM, con i suoi rapidi movimenti degli occhi.",
      },
      {
        when: "Anni '60",
        text: "Le benzodiazepine sostituiscono i barbiturici come sonniferi: sono più sicure, ma danno dipendenza se usate a lungo.",
      },
      {
        when: "2017",
        text: "Le linee guida europee indicano la terapia cognitivo-comportamentale per l'insonnia come prima scelta per l'insonnia cronica.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Valeria, 52 anni: la mente che non si spegne",
      story:
        "Da quattro mesi Valeria impiega più di un'ora ad addormentarsi e si sveglia alle quattro con mille pensieri. Di giorno è stanca e irritabile. Il medico esclude altre cause e la indirizza a un percorso di terapia cognitivo-comportamentale per l'insonnia: orari fissi, il letto usato solo per dormire, tecniche per calmare i pensieri. In due mesi il sonno migliora.",
      lesson:
        "L'insonnia che dura si cura soprattutto cambiando abitudini e pensieri legati al sonno. I sonniferi, se servono, si usano per brevi periodi e su indicazione del medico.",
    },
  ],

  causes: [
    "Stress, preoccupazioni e ansia.",
    "Una camera rumorosa, luminosa, troppo calda o fredda, o un letto scomodo.",
    "Turni di lavoro e jet lag.",
    "Alcol, caffeina e nicotina, soprattutto la sera.",
    "Disturbi fisici o mentali, come dolore, reflusso, depressione o apnee notturne.",
    "Alcuni farmaci.",
  ],
  riskFactors: [
    "Età avanzata.",
    "Essere donna, soprattutto in menopausa.",
    "Lavoro a turni.",
    "Ansia o depressione.",
    "Usare schermi a letto.",
  ],

  symptoms: {
    typical: [
      "Fatica ad addormentarti",
      "Risvegli durante la notte",
      "Risveglio troppo presto al mattino",
      "Stanchezza al risveglio",
    ],
    lessCommon: [
      "Sonnolenza e stanchezza durante il giorno",
      "Irritabilità",
      "Difficoltà di concentrazione e di memoria",
    ],
  },

  treatments: {
    options: [
      {
        title: "Igiene del sonno",
        text: "Orari regolari, una camera buia, silenziosa e fresca, niente schermi prima di dormire, meno caffeina e alcol.",
      },
      {
        title: "Terapia cognitivo-comportamentale per l'insonnia",
        text: "È la cura più efficace per l'insonnia che dura: insegna a cambiare le abitudini e i pensieri che tengono svegli.",
      },
      {
        title: "Cura delle cause",
        text: "Se l'insonnia dipende da ansia, dolore, apnee o altri disturbi, curarli migliora anche il sonno.",
      },
      {
        title: "Farmaci per brevi periodi",
        text: "Nei casi più difficili il medico può prescrivere un sonnifero per poco tempo. Anche per gli integratori chiedi al medico o al farmacista.",
      },
    ],
    selfCare: [
      "Vai a letto e alzati sempre alla stessa ora, anche nel fine settimana.",
      "Se non ti addormenti entro una ventina di minuti, alzati e fai qualcosa di rilassante, poi torna a letto quando hai sonno.",
      "Evita i sonnellini lunghi durante il giorno.",
      "Fai attività fisica, ma non nelle ore subito prima di dormire.",
      "La sera evita caffè, tè, alcol e pasti abbondanti.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "L'insonnia dura da settimane e pesa sulle tue giornate.",
      "Cambiare abitudini non è bastato.",
      "Russi forte, o qualcuno ha notato che smetti di respirare nel sonno.",
      "Ti senti spesso triste, ansioso o senza speranza.",
    ],
    urgent: ["Hai pensieri di farti del male o di toglierti la vita: chiedi aiuto subito, anche chiamando il 112."],
  },

  prevention: [
    "Mantieni orari di sonno regolari.",
    "Crea una routine rilassante prima di dormire.",
    "Esponiti alla luce del giorno al mattino.",
    "Usa il letto solo per dormire.",
  ],

  specialist: {
    id: "medicina-del-sonno",
    why: "Il primo riferimento è il medico di base. Per l'insonnia che dura c'è la terapia cognitivo-comportamentale con uno psicologo; per i casi complessi si va in un centro di medicina del sonno.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Insonnia",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/i/insonnia",
      lang: "it",
    },
    { publisher: "NHS", title: "Insomnia", url: "https://www.nhs.uk/conditions/insomnia/", lang: "en" },
    { publisher: "MedlinePlus", title: "Insomnia", url: "https://medlineplus.gov/insomnia.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["difficolta-addormentarsi", "risvegli-notturni", "sonno-non-ristoratore"],
    otherSymptoms: ["stanchezza", "irritabilita", "difficolta-concentrazione", "sonnolenza-diurna"],
    moreLikelyIf: [
      "Il problema è iniziato in un periodo di stress o di cambiamenti.",
      "Di notte la mente resta in allerta e i pensieri corrono.",
    ],
    lessLikelyIf: [
      "Russi forte e ti addormenti facilmente di giorno: possono essere apnee notturne.",
      "Dormi abbastanza ma sei comunque esausto: va cercata un'altra causa.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
