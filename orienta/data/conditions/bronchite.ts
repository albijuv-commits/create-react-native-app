import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "bronchite",
  name: "Bronchite acuta",
  aliases: ["bronchite", "tosse con catarro", "infiammazione dei bronchi"],
  areas: ["respiro"],
  bodyZones: ["petto"],

  overview:
    "La bronchite acuta è l'infiammazione dei bronchi, i tubi che portano l'aria ai polmoni, quasi sempre dovuta a un virus. Provoca tosse, spesso con catarro, che può durare anche tre settimane, e di solito guarisce da sola senza antibiotici.",

  animation: {
    scene: "bronchi",
    params: { variante: "bronchite" },
    captions: [
      "I bronchi sono rivestiti da cellule con minuscole ciglia che spingono polvere e microbi verso la gola.",
      "Un virus, spesso dopo un raffreddore o un'influenza, irrita il rivestimento dei bronchi.",
      "La mucosa si infiamma e produce più muco: la tosse serve a liberarsene.",
      "In circa tre settimane la mucosa guarisce; la tosse è spesso l'ultimo sintomo a passare.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «bronchos», trachea, gola. Il termine «bronchite» fu usato per la prima volta nel 1808 dal medico inglese Charles Badham.",
    events: [
      {
        when: "1808",
        text: "Charles Badham descrive l'infiammazione delle mucose dei bronchi e introduce il nome bronchite.",
      },
      {
        when: "1819",
        text: "Il medico francese René Laennec pubblica il suo trattato sullo stetoscopio, inventato pochi anni prima: ascoltare il petto diventa una base della visita.",
      },
      {
        when: "Oggi",
        text: "Gli studi mostrano che nella bronchite acuta gli antibiotici di solito non accorciano la malattia: usarli solo quando servono aiuta a contrastare la resistenza dei batteri.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Pietro, 45 anni: la tosse che non ha fretta",
      story:
        "Dopo un raffreddore Pietro ha una tosse con catarro, un po' di febbre e fastidio al petto quando tossisce. Il medico lo visita, ascolta i polmoni e spiega che è una bronchite virale: niente antibiotici, ma riposo, liquidi e miele nelle bevande calde. La febbre passa in tre giorni, la tosse in tre settimane.",
      lesson:
        "La tosse della bronchite può durare a lungo anche se la guarigione procede bene. Se supera le tre settimane, o compare fiato corto, va rivalutata.",
    },
  ],

  causes: [
    "Virus, nella maggior parte dei casi: gli stessi di raffreddore e influenza.",
    "Più di rado batteri.",
    "Fumo, polveri e inquinamento, che irritano i bronchi.",
  ],
  riskFactors: [
    "Fumo, anche passivo.",
    "Età avanzata o primi anni di vita.",
    "Malattie croniche di cuore o polmoni, asma o diabete.",
    "Difese immunitarie basse.",
    "Lavori con esposizione a polveri o sostanze irritanti.",
  ],

  symptoms: {
    typical: [
      "Tosse, spesso con catarro chiaro, giallo o verde",
      "Fastidio o dolore al petto quando tossisci",
      "Stanchezza",
      "Mal di gola e naso che cola",
    ],
    lessCommon: ["Febbre", "Fiato corto o un leggero fischio quando respiri", "Tosse che dura fino a tre settimane, o più"],
  },

  treatments: {
    options: [
      { title: "Riposo e liquidi", text: "Aiutano il corpo a guarire e rendono il catarro più fluido." },
      { title: "Antidolorifici e antifebbrili", text: "Per dolore e febbre. Chiedi al farmacista quale scegliere." },
      {
        title: "Rimedi per la tosse",
        text: "Il miele in una bevanda calda può calmare la tosse; per sciroppi e altri prodotti chiedi consiglio al farmacista.",
      },
      {
        title: "Antibiotici solo in casi particolari",
        text: "Il medico li prescrive solo se sospetta un'infezione batterica, ad esempio una polmonite.",
      },
    ],
    selfCare: [
      "Non fumare: la tosse durerà meno.",
      "Se hai la febbre, resta a casa ed evita i contatti.",
      "Il miele non va dato ai bambini sotto i 12 mesi.",
      "Usa fazzoletti di carta e lavati spesso le mani.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "La tosse dura più di 3 settimane e non migliora.",
      "Hai più di 65 anni, sei in gravidanza, hai malattie croniche o difese basse.",
      "Hai il fiato corto, o ti senti troppo male per le attività di tutti i giorni.",
      "Tossisci sangue o catarro con striature di sangue.",
      "Hai un dolore al petto che va e viene, o che compare quando respiri o tossisci.",
    ],
    urgent: [
      "Fai fatica a respirare: ti senti soffocare, boccheggi o non riesci a parlare.",
      "Labbra o pelle diventano molto pallide, bluastre o grigie.",
      "All'improvviso sei confuso.",
    ],
  },

  prevention: [
    "Non fumare.",
    "Lavati spesso le mani.",
    "Vaccinati contro l'influenza e, se rientri nelle categorie consigliate, contro lo pneumococco.",
    "Evita polveri e fumi irritanti.",
  ],

  specialist: {
    id: "pneumologo",
    why: "Il medico di base gestisce la bronchite acuta. Il pneumologo serve se la tosse dura a lungo, torna spesso o si sospetta una malattia cronica dei polmoni.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Bronchite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/b/bronchite",
      lang: "it",
    },
    { publisher: "NHS", title: "Bronchitis", url: "https://www.nhs.uk/conditions/bronchitis/", lang: "en" },
    { publisher: "MedlinePlus", title: "Acute Bronchitis", url: "https://medlineplus.gov/acutebronchitis.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["tosse-catarro", "dolore-petto-tosse"],
    otherSymptoms: ["tosse-secca", "stanchezza", "febbre", "mal-di-gola", "naso-che-cola", "respiro-sibilante", "fiato-corto"],
    moreLikelyIf: [
      "La tosse è iniziata durante o dopo un raffreddore.",
      "Hai catarro e fastidio al petto quando tossisci.",
    ],
    lessLikelyIf: [
      "Hai febbre alta da giorni, fiato corto e dolore quando respiri a fondo: va esclusa una polmonite.",
      "Hai fischi al petto che tornano spesso, anche senza infezioni: può essere asma.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
