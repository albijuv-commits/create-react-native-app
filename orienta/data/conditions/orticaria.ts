import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "orticaria",
  name: "Orticaria",
  aliases: ["pomfi", "ponfi", "bolle che prudono", "orticaria cronica"],
  areas: ["pelle"],
  bodyZones: ["pelle"],

  overview:
    "L'orticaria è un'eruzione della pelle con rilievi rossi o rosati, i pomfi, che prudono e compaiono e scompaiono nel giro di ore, spesso cambiando posto. Di solito passa in pochi giorni; raramente si accompagna a gonfiore di labbra, lingua o gola, che è un'emergenza.",

  animation: {
    scene: "reazione-allergica",
    params: { allergene: "generico", sede: "pelle" },
    captions: [
      "Nella pelle ci sono i mastociti, cellule piene di granuli che contengono istamina.",
      "Un fattore scatenante, come un cibo, un farmaco, una puntura d'insetto, un'infezione o il freddo, li attiva. A volte la causa non si trova.",
      "I mastociti liberano istamina nella pelle.",
      "L'istamina fa uscire liquido dai piccoli vasi: si formano i pomfi, che prudono e poi spariscono senza lasciare segni.",
    ],
  },

  history: {
    nameOrigin:
      "Dal latino «urtica», ortica: i pomfi assomigliano ai segni che lascia sulla pelle il contatto con questa pianta.",
    events: [
      {
        when: "1878",
        text: "Il medico tedesco Paul Ehrlich descrive per la prima volta i mastociti, le cellule protagoniste dell'orticaria.",
      },
      {
        when: "1910",
        text: "Henry Dale e Patrick Laidlaw studiano gli effetti dell'istamina, la sostanza che provoca i pomfi.",
      },
      { when: "1937", text: "Daniel Bovet scopre le prime molecole antistaminiche." },
      {
        when: "2014",
        text: "Viene approvato il primo farmaco biologico per l'orticaria cronica che non risponde agli antistaminici.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Nicola, 24 anni: pomfi durante l'influenza",
      story:
        "Durante un'influenza Nicola si riempie di pomfi pruriginosi che compaiono e scompaiono in punti diversi. Non ha gonfiore alla bocca né difficoltà a respirare. Il farmacista gli consiglia un antistaminico adatto a lui e in quattro giorni l'orticaria sparisce.",
      lesson:
        "Spesso l'orticaria acuta è legata a un'infezione e passa da sola. Se però si gonfiano labbra, lingua o gola, o il respiro si fa difficile, bisogna chiamare subito il 112.",
    },
  ],

  causes: [
    "Il rilascio di istamina da parte dei mastociti della pelle.",
    "Possibili fattori scatenanti: alcuni cibi, farmaci, punture d'insetto, infezioni, contatto con piante o lattice, freddo, caldo e sudore, pressione o sfregamento sulla pelle.",
    "Nell'orticaria cronica spesso non c'è una causa esterna: può dipendere da un'alterazione del sistema immunitario.",
  ],
  riskFactors: [
    "Allergie note.",
    "Infezioni recenti, soprattutto nei bambini.",
    "Alcuni farmaci, come gli antinfiammatori.",
    "Stress, che può peggiorare l'orticaria cronica.",
    "Malattie autoimmuni, ad esempio della tiroide, nell'orticaria cronica.",
  ],

  symptoms: {
    typical: [
      "Pomfi: rilievi rossi, rosati o del colore della pelle, di forme e dimensioni diverse",
      "Prurito, a volte bruciore o puntura",
      "Ogni pomfo sparisce entro 24 ore, mentre altri possono comparire altrove",
    ],
    lessCommon: [
      "Gonfiore più profondo di palpebre, labbra, mani o piedi (angioedema)",
      "Episodi che durano più di 6 settimane: si parla di orticaria cronica",
    ],
  },

  treatments: {
    options: [
      {
        title: "Antistaminici",
        text: "Sono la cura principale e riducono prurito e pomfi. Chiedi al farmacista o al medico quale è adatto a te, soprattutto per i bambini o se hai altre malattie.",
      },
      { title: "Cortisone per brevi periodi", text: "Il medico può prescriverlo nelle forme acute più intense." },
      {
        title: "Terapie per l'orticaria cronica",
        text: "Se gli antistaminici non bastano, lo specialista può proporre altri farmaci, compresi i biologici.",
      },
      { title: "Impacchi freschi", text: "Un impacco fresco o una crema rinfrescante può calmare il prurito." },
    ],
    selfCare: [
      "Evita i fattori scatenanti che hai riconosciuto.",
      "Indossa abiti larghi e leggeri.",
      "Evita docce molto calde.",
      "Annota quando compaiono i pomfi: aiuta il medico a trovare la causa.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "L'orticaria non migliora dopo 2 giorni o si estende.",
      "Torna spesso, o dura più di 6 settimane.",
      "Hai anche febbre e ti senti male.",
      "Hai gonfiore sotto la pelle, ad esempio delle palpebre.",
      "Sei preoccupato per un bambino.",
    ],
    urgent: [
      "Ti si gonfiano all'improvviso labbra, bocca, lingua o gola.",
      "Respiri molto in fretta o con fatica, hai un sibilo o ti senti soffocare.",
      "Senti la gola stretta o fai fatica a deglutire.",
      "Pelle o labbra diventano bluastre, grigie o pallide, oppure ti senti molto confuso, sonnolento o stai per svenire.",
    ],
  },

  prevention: [
    "Evita ciò che sai che ti scatena l'orticaria.",
    "Se hai avuto una reazione a un farmaco, dillo sempre al medico e al farmacista.",
    "Se hai avuto una reazione grave, chiedi al medico se devi portare con te l'adrenalina autoiniettabile.",
  ],

  specialist: {
    id: "dermatologo",
    why: "Il dermatologo, o l'allergologo, segue l'orticaria che torna spesso o dura più di 6 settimane e cerca le possibili cause.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Orticaria",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/o/orticaria",
      lang: "it",
    },
    { publisher: "NHS", title: "Hives", url: "https://www.nhs.uk/conditions/hives/", lang: "en" },
    { publisher: "MedlinePlus", title: "Hives", url: "https://medlineplus.gov/hives.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["pomfi", "prurito-pelle"],
    otherSymptoms: ["gonfiore-pelle", "chiazze-rosse", "febbre"],
    moreLikelyIf: [
      "I rilievi compaiono e scompaiono in poche ore, cambiando posto.",
      "Sono comparsi dopo un cibo, un farmaco, una puntura o durante un'infezione.",
    ],
    lessLikelyIf: [
      "Le chiazze restano ferme per giorni nello stesso punto.",
      "Hai vescicole piene di liquido che diventano croste.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
