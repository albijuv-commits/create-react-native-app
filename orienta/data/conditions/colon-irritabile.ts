import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "colon-irritabile",
  name: "Colon irritabile",
  aliases: ["sindrome dell'intestino irritabile", "intestino irritabile", "colite spastica", "IBS"],
  areas: ["digestione"],
  bodyZones: ["pancia", "basso-ventre"],

  overview:
    "Il colon irritabile, o sindrome dell'intestino irritabile, è un disturbo comune e di lunga durata in cui l'intestino è più sensibile e si muove in modo irregolare. Provoca dolore alla pancia, gonfiore, diarrea o stitichezza, con periodi migliori e peggiori: non danneggia l'intestino e si tiene sotto controllo con alimentazione e gestione dello stress.",

  animation: {
    scene: "intestino-sensibile",
    params: {},
    captions: [
      "Le pareti dell'intestino si contraggono a onde regolari per far avanzare il contenuto.",
      "Nel colon irritabile le onde diventano irregolari: troppo veloci danno diarrea, troppo lente stitichezza.",
      "I nervi dell'intestino sono più sensibili: gas e distensione, normali per altri, vengono sentiti come dolore. Lo stress amplifica i segnali tra intestino e cervello.",
      "Alimentazione mirata, gestione dello stress e, se servono, farmaci rendono le onde più regolari e i segnali meno dolorosi.",
    ],
  },

  history: {
    nameOrigin:
      "Un tempo si parlava di «colite spastica». Oggi i medici preferiscono «sindrome dell'intestino irritabile»: non c'è una vera infiammazione, indicata dal suffisso «-ite», ma un intestino più sensibile e irregolare.",
    events: [
      {
        when: "1849",
        text: "Il medico inglese William Cumming descrive pazienti con l'intestino «ora stitico, ora sciolto»: è una delle prime descrizioni del disturbo.",
      },
      {
        when: "Anni '90",
        text: "Esperti internazionali definiscono i «criteri di Roma» per diagnosticare i disturbi funzionali dell'intestino. L'ultima versione, Roma IV, è del 2016.",
      },
      {
        when: "Anni 2000",
        text: "All'Università Monash, in Australia, Peter Gibson e Sue Shepherd sviluppano la dieta a basso contenuto di FODMAP, oggi molto usata.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Marta, 27 anni: la pancia che segue l'agenda",
      story:
        "Da più di un anno Marta ha crampi e gonfiore che migliorano dopo essere andata in bagno, con giorni di diarrea e giorni di stitichezza, soprattutto nei periodi di esami. Il medico esclude altre malattie con esami del sangue e delle feci e le spiega che si tratta di colon irritabile. Con una dieta seguita da un dietista e un po' di attività fisica, i giorni buoni diventano la maggioranza.",
      lesson:
        "Il colon irritabile si diagnostica escludendo altre cause. Non è pericoloso, ma va preso sul serio: dieta, movimento e gestione dello stress fanno la differenza.",
    },
  ],

  causes: [
    "Non c'è una causa unica: contano la maggiore sensibilità dei nervi dell'intestino e alterazioni dei suoi movimenti.",
    "Il dialogo tra intestino e cervello, influenzato da stress e ansia.",
    "A volte il disturbo inizia dopo una gastroenterite.",
    "Cambiamenti della flora batterica intestinale.",
  ],
  riskFactors: [
    "Essere donna e avere meno di 50 anni.",
    "Stress, ansia o depressione.",
    "Una gastroenterite in passato.",
    "Familiari con lo stesso disturbo.",
  ],

  symptoms: {
    typical: [
      "Dolore o crampi alla pancia, spesso dopo mangiato, che migliorano dopo essere andati in bagno",
      "Gonfiore e senso di pancia piena",
      "Diarrea, stitichezza o entrambe a periodi alterni",
    ],
    lessCommon: ["Aria e flatulenza", "Muco nelle feci", "Stanchezza", "Nausea", "Mal di schiena", "Bisogno frequente di urinare"],
  },

  treatments: {
    options: [
      {
        title: "Alimentazione",
        text: "Pasti regolari e attenzione a cibi grassi o piccanti, caffeina e alcol. Un dietista può guidarti in una dieta a basso contenuto di FODMAP, da seguire solo per un periodo.",
      },
      {
        title: "Le fibre giuste",
        text: "Le fibre solubili, come quelle dell'avena, aiutano soprattutto la stitichezza; quelle insolubili possono aumentare il gonfiore.",
      },
      {
        title: "Farmaci per i sintomi",
        text: "Il medico può consigliare antispastici, farmaci per la diarrea o lassativi adatti. Chiedi al medico o al farmacista.",
      },
      {
        title: "Psicoterapia",
        text: "La terapia cognitivo-comportamentale e l'ipnoterapia rivolta all'intestino possono ridurre i sintomi, soprattutto se lo stress li peggiora.",
      },
    ],
    selfCare: [
      "Tieni un diario di cibo e sintomi per capire che cosa ti fa stare peggio.",
      "Mangia con calma e a orari regolari.",
      "Fai attività fisica con regolarità.",
      "Bevi a sufficienza.",
      "Non eliminare troppi alimenti da solo: chiedi consiglio a un dietista o al medico.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Pensi di avere il colon irritabile e i sintomi durano da più di 4 settimane.",
      "Le cure non bastano o i sintomi cambiano.",
      "Perdi peso senza motivo, hai sangue nelle feci, senti un rigonfiamento nella pancia o sei insolitamente pallido e affannato: senti il medico al più presto.",
    ],
    urgent: [
      "Hai un dolore alla pancia improvviso e fortissimo, con la pancia dura.",
      "Perdi molto sangue dall'ano o hai feci nere.",
    ],
  },

  prevention: [
    "Gestisci lo stress con attività che ti rilassano.",
    "Muoviti ogni giorno.",
    "Mantieni orari regolari per pasti e sonno.",
    "Lavati le mani e cura l'igiene dei cibi, per ridurre le gastroenteriti.",
  ],

  specialist: {
    id: "gastroenterologo",
    why: "Nella maggior parte dei casi la diagnosi la fa il medico di base. Il gastroenterologo serve se ci sono segnali d'allarme, dubbi o sintomi che non migliorano.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Sindrome dell'intestino irritabile",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/s/sindrome-dell-intestino-irritabile",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Irritable bowel syndrome (IBS)",
      url: "https://www.nhs.uk/conditions/irritable-bowel-syndrome-ibs/",
      lang: "en",
    },
    {
      publisher: "MedlinePlus",
      title: "Irritable Bowel Syndrome",
      url: "https://medlineplus.gov/irritablebowelsyndrome.html",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["mal-di-pancia", "gonfiore-pancia", "alvo-alterno"],
    otherSymptoms: ["diarrea", "stitichezza", "stanchezza", "nausea"],
    moreLikelyIf: [
      "I disturbi vanno avanti da mesi, con periodi migliori e peggiori.",
      "Il dolore migliora dopo essere andato in bagno.",
      "Peggiorano con lo stress o con certi cibi.",
    ],
    lessLikelyIf: [
      "Sono iniziati da pochi giorni con febbre o vomito: è più tipico di un'infezione.",
      "Hai sangue nelle feci, perdi peso o il dolore ti sveglia di notte: servono accertamenti.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
