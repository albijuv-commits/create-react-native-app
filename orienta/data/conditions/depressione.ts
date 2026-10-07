import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "depressione",
  name: "Depressione",
  aliases: ["depressione maggiore", "disturbo depressivo", "esaurimento", "umore basso"],
  areas: ["mente"],
  bodyZones: ["testa", "tutto-il-corpo"],

  overview:
    "La depressione è un disturbo dell'umore in cui tristezza, vuoto o perdita di interesse durano settimane e tolgono energia a tutto: sonno, appetito, concentrazione, voglia di fare. Non è una debolezza né qualcosa da superare con la sola volontà: è una malattia comune che si cura, con la psicoterapia, i farmaci o entrambi.",

  animation: {
    scene: "circolo-umore",
    params: {},
    captions: [
      "Umore, energia, sonno, attività e pensieri sono collegati: quando uno sta bene, aiuta anche gli altri.",
      "Eventi difficili, stress prolungato e una predisposizione personale possono spegnere l'umore.",
      "Si crea un circolo vizioso: meno energia, meno attività e meno piacere, pensieri più negativi, umore ancora più basso.",
      "Psicoterapia, farmaci quando servono, piccole attività quotidiane e il sostegno delle persone vicine fanno ripartire il circolo nel verso giusto.",
    ],
  },

  history: {
    nameOrigin:
      "Dal latino «deprimere», premere verso il basso. Gli antichi greci parlavano di «melancolia», bile nera, perché attribuivano la tristezza a un eccesso di questo umore del corpo.",
    events: [
      { when: "V-IV secolo a.C.", text: "I medici della scuola di Ippocrate descrivono la melancolia." },
      {
        when: "1957",
        text: "Lo psichiatra svizzero Roland Kuhn descrive l'effetto antidepressivo dell'imipramina, scoperto quasi per caso: è uno dei primi antidepressivi.",
      },
      { when: "Anni '60-'70", text: "Aaron Beck sviluppa la terapia cognitiva per la depressione." },
      {
        when: "1987",
        text: "Negli Stati Uniti viene approvata la fluoxetina, uno dei primi antidepressivi di una nuova famiglia, oggi molto usata.",
      },
      {
        when: "Oggi",
        text: "Secondo l'Organizzazione mondiale della sanità la depressione è tra le principali cause di disabilità nel mondo.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Elena, 41 anni: «pensavo fosse solo stanchezza»",
      story:
        "Da due mesi Elena non ha voglia di vedere nessuno, si sveglia alle quattro del mattino, mangia poco e fa fatica a concentrarsi al lavoro. Ha smesso di dipingere, la cosa che amava di più. Una collega la incoraggia a parlarne con il medico, che riconosce una depressione e la indirizza a uno psicoterapeuta; insieme valutano anche un farmaco. Dopo qualche mese Elena torna a dipingere.",
      lesson:
        "La depressione si riconosce da quanto dura e da quanto cambia la vita di tutti i giorni. Parlarne è il primo passo: le cure funzionano.",
    },
  ],

  causes: [
    "Un insieme di fattori biologici, psicologici e sociali.",
    "Eventi di vita difficili: lutti, separazioni, perdita del lavoro, solitudine.",
    "Malattie fisiche croniche, alcuni farmaci, alcol e droghe.",
    "Cambiamenti ormonali, ad esempio dopo il parto.",
  ],
  riskFactors: [
    "Familiari con depressione.",
    "Esperienze traumatiche, soprattutto nell'infanzia.",
    "Isolamento sociale.",
    "Malattie croniche o dolore che dura.",
    "Episodi di depressione in passato.",
  ],

  symptoms: {
    typical: [
      "Umore triste, vuoto o senza speranza per gran parte del giorno, quasi ogni giorno",
      "Perdita di interesse o di piacere per le cose che piacevano",
      "Stanchezza e mancanza di energia",
      "Sonno disturbato: insonnia o, al contrario, dormire troppo",
    ],
    lessCommon: [
      "Cambiamenti di appetito e di peso",
      "Difficoltà a concentrarti e a prendere decisioni",
      "Senso di colpa o di inutilità",
      "Rallentamento o agitazione",
      "Dolori fisici senza una causa chiara",
      "Pensieri di morte o di farsi del male",
    ],
  },

  treatments: {
    options: [
      {
        title: "Psicoterapia",
        text: "La terapia cognitivo-comportamentale, la terapia interpersonale e altri approcci sono efficaci, soprattutto nelle forme lievi e moderate.",
      },
      {
        title: "Farmaci antidepressivi",
        text: "Il medico o lo psichiatra possono prescriverli, soprattutto nelle forme moderate o gravi. Richiedono alcune settimane per funzionare e non vanno sospesi da soli.",
      },
      {
        title: "Attività e movimento",
        text: "Riprendere piccole attività piacevoli e fare esercizio fisico aiuta l'umore.",
      },
      {
        title: "Servizi di salute mentale",
        text: "Nei casi più gravi ci si rivolge al Centro di salute mentale della propria zona, che offre un'assistenza completa.",
      },
    ],
    selfCare: [
      "Non isolarti: parla con qualcuno di cui ti fidi.",
      "Prova a mantenere una routine: orari regolari, pasti e un po' di movimento.",
      "Fissati piccoli obiettivi raggiungibili.",
      "Evita alcol e droghe: peggiorano l'umore.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Ti senti giù o hai perso interesse per le cose da più di due settimane.",
      "Fai fatica a lavorare, studiare o occuparti della casa.",
      "Le cure in corso non stanno funzionando.",
      "Usi alcol o altre sostanze per stare meglio.",
    ],
    urgent: [
      "Hai pensieri di farti del male o di toglierti la vita: chiedi aiuto subito, anche chiamando il 112.",
      "Una persona vicina a te parla di farla finita o si sta preparando a farlo: non lasciarla sola e chiama il 112.",
    ],
  },

  prevention: [
    "Coltiva le relazioni e chiedi aiuto nei momenti difficili.",
    "Fai attività fisica regolare.",
    "Dormi a orari regolari.",
    "Limita alcol e sostanze.",
  ],

  specialist: {
    id: "psichiatra",
    why: "Il medico di base è il primo riferimento. Lo psicologo o psicoterapeuta offre la psicoterapia; lo psichiatra fa la diagnosi e prescrive i farmaci quando servono.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "La depressione si supera con la volontà? (Falsi miti)",
      url: "https://www.issalute.it/index.php/falsi-miti-e-bufale/salute-mentale/la-depressione-si-supera-con-la-volonta",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Salute mentale",
      url: "https://www.salute.gov.it/new/it/tema/salute-mentale/",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Depression in adults",
      url: "https://www.nhs.uk/mental-health/conditions/depression-in-adults/",
      lang: "en",
    },
    { publisher: "MedlinePlus", title: "Depression", url: "https://medlineplus.gov/depression.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["umore-basso", "perdita-interesse"],
    otherSymptoms: [
      "stanchezza",
      "risvegli-notturni",
      "difficolta-concentrazione",
      "perdita-appetito",
      "irritabilita",
      "difficolta-addormentarsi",
    ],
    moreLikelyIf: [
      "Il cambiamento dura da più di due settimane.",
      "Hai perso interesse anche per le cose che ti piacevano.",
      "È iniziato dopo un periodo difficile, anche se non sempre c'è un motivo evidente.",
    ],
    lessLikelyIf: [
      "Hai anche freddo, aumento di peso e pelle secca: va controllata la tiroide.",
      "La stanchezza è comparsa con pallore e fiato corto: va controllata l'anemia.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
