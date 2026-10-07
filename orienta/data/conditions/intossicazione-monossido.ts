import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "intossicazione-monossido",
  name: "Intossicazione da monossido di carbonio",
  aliases: ["monossido di carbonio", "intossicazione da CO", "avvelenamento da monossido", "stufa", "caldaia"],
  areas: ["corpo"],
  bodyZones: ["testa", "tutto-il-corpo"],

  overview:
    "Il monossido di carbonio è un gas invisibile e senza odore prodotto da stufe, caldaie, camini e motori quando bruciano male o in ambienti poco ventilati. Respirato, prende il posto dell'ossigeno nel sangue e provoca mal di testa, nausea, capogiri e sonnolenza, fino alla perdita di coscienza: se più persone in casa stanno male insieme, esci all'aria aperta e chiama il 112.",

  animation: {
    scene: "globuli-rossi",
    params: { variante: "monossido" },
    captions: [
      "I globuli rossi trasportano l'ossigeno, legato all'emoglobina, dai polmoni a tutto il corpo.",
      "Quando una stufa, una caldaia o un braciere bruciano male si forma monossido di carbonio, che respiriamo senza accorgercene.",
      "Il monossido si lega all'emoglobina più di 200 volte più forte dell'ossigeno e lo scaccia: cervello e cuore restano senza ossigeno.",
      "All'aria aperta e con l'ossigeno dato dai soccorsi, a volte in camera iperbarica, il monossido viene eliminato.",
    ],
  },

  history: {
    nameOrigin:
      "Il nome viene dalla sua composizione: una molecola fatta di un atomo di carbonio e di un solo atomo di ossigeno, da cui «mon-ossido».",
    events: [
      {
        when: "1857",
        text: "Il fisiologo francese Claude Bernard dimostra che il monossido di carbonio scaccia l'ossigeno dal sangue.",
      },
      {
        when: "1895",
        text: "Lo scienziato scozzese John Scott Haldane studia gli effetti del gas e propone di usare piccoli animali, come i canarini, per scoprirlo nelle miniere.",
      },
      { when: "Anni '60", text: "Si diffonde l'ossigenoterapia iperbarica per le intossicazioni gravi." },
      {
        when: "Oggi",
        text: "I rilevatori di monossido per la casa, insieme alla manutenzione degli impianti, sono la difesa più efficace.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Una famiglia e la stufa della domenica",
      story:
        "Una domenica d'inverno, in una casa con una vecchia stufa a gas e le finestre chiuse, tutta la famiglia ha mal di testa e nausea, e il nonno è insolitamente sonnolento. La figlia sospetta il monossido: apre le finestre, porta tutti fuori e chiama il 112. In ospedale i livelli di monossido nel sangue sono alti; dopo l'ossigeno stanno tutti bene. Un tecnico trova lo scarico della stufa ostruito.",
      lesson:
        "Sintomi simili in più persone della stessa casa, che migliorano uscendo, fanno pensare al monossido. Un rilevatore e la manutenzione degli impianti possono salvare la vita.",
    },
  ],

  causes: [
    "Combustione incompleta in stufe, caldaie, scaldabagni, camini, bracieri o barbecue, soprattutto se funzionano male o sono in ambienti chiusi.",
    "Canne fumarie ostruite o ventilazione insufficiente.",
    "Motori accesi in garage o in luoghi chiusi, e generatori elettrici usati in casa.",
    "Incendi.",
  ],
  riskFactors: [
    "Impianti di riscaldamento vecchi o senza manutenzione.",
    "Uso di bracieri, barbecue o generatori in casa.",
    "Inverno, con le finestre chiuse.",
    "Bambini, donne in gravidanza, anziani e persone con malattie di cuore o polmoni sono più vulnerabili.",
  ],

  symptoms: {
    typical: [
      "Mal di testa",
      "Nausea e vomito",
      "Capogiri",
      "Stanchezza e sonnolenza",
      "Sintomi che migliorano uscendo di casa e peggiorano rientrando",
    ],
    lessCommon: [
      "Confusione",
      "Fiato corto e dolore al petto",
      "Vista offuscata",
      "Nei casi gravi, perdita di coscienza e convulsioni",
    ],
  },

  treatments: {
    options: [
      {
        title: "Aria aperta, subito",
        text: "Apri porte e finestre, spegni l'apparecchio se puoi farlo senza rischi, esci e porta fuori tutti, animali compresi.",
      },
      { title: "Chiama il 112", text: "Anche se i sintomi sembrano lievi: serve una valutazione in ospedale." },
      {
        title: "Ossigeno",
        text: "In ospedale si dà ossigeno ad alta concentrazione; nei casi gravi, o in gravidanza, si può usare la camera iperbarica.",
      },
    ],
    selfCare: [
      "Non rientrare in casa finché un tecnico o i vigili del fuoco non hanno controllato l'impianto.",
      "Se una persona è incosciente ma respira, mettila sul fianco in posizione laterale di sicurezza, all'aria aperta.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai spesso mal di testa o nausea che migliorano fuori casa: fai controllare gli impianti e parlane con il medico.",
      "Dopo un'intossicazione, anche lieve, nelle settimane successive hai problemi di memoria, concentrazione o umore.",
    ],
    urgent: [
      "Più persone, o anche gli animali, nella stessa casa hanno insieme mal di testa, nausea e sonnolenza.",
      "Una persona è confusa, molto sonnolenta o ha perso conoscenza in un ambiente con stufe, caldaie o motori accesi.",
      "Suona il rilevatore di monossido.",
    ],
  },

  prevention: [
    "Fai controllare ogni anno caldaie, stufe e canne fumarie da un tecnico qualificato.",
    "Installa un rilevatore di monossido di carbonio vicino alle fonti di combustione e nelle camere da letto.",
    "Non usare mai bracieri, barbecue o generatori in casa o in garage.",
    "Non tenere il motore dell'auto acceso in un garage chiuso.",
    "Lascia sempre libere le prese d'aria.",
  ],

  specialist: {
    id: "pronto-soccorso",
    why: "L'intossicazione da monossido è un'emergenza: chiama il 112. I casi più gravi si curano negli ospedali con camera iperbarica.",
  },

  sources: [
    {
      publisher: "NHS",
      title: "Carbon monoxide poisoning",
      url: "https://www.nhs.uk/conditions/carbon-monoxide-poisoning/",
      lang: "en",
    },
    {
      publisher: "MedlinePlus",
      title: "Carbon Monoxide Poisoning",
      url: "https://medlineplus.gov/carbonmonoxidepoisoning.html",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["mal-di-testa", "nausea", "capogiri", "sonnolenza"],
    otherSymptoms: ["stanchezza", "confusione", "vomito", "fiato-corto"],
    moreLikelyIf: [
      "Altre persone o animali in casa stanno male insieme a te.",
      "I sintomi migliorano quando esci di casa.",
      "In casa ci sono stufe, caldaie o camini accesi, o un motore acceso in un luogo chiuso.",
    ],
    lessLikelyIf: [
      "Hai febbre e tosse.",
      "Sei l'unica persona ad avere i sintomi e non cambiano dentro e fuori casa.",
    ],
    typicalUrgency: "er",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
