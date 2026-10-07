import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "anemia",
  name: "Anemia",
  aliases: ["anemia da carenza di ferro", "anemia sideropenica", "carenza di ferro", "emoglobina bassa"],
  areas: ["corpo"],
  bodyZones: ["tutto-il-corpo"],

  overview:
    "L'anemia è una riduzione dei globuli rossi o dell'emoglobina, la proteina che trasporta l'ossigeno nel sangue. La forma più comune è dovuta alla carenza di ferro, spesso per perdite di sangue come mestruazioni abbondanti o per un'alimentazione povera di ferro: dà stanchezza, pallore e fiato corto e si cura trovando e correggendo la causa.",

  animation: {
    scene: "globuli-rossi",
    params: { variante: "anemia" },
    captions: [
      "Nel sangue scorrono miliardi di globuli rossi, dischi pieni di emoglobina che trasportano l'ossigeno in tutto il corpo.",
      "Se manca il ferro, il midollo osseo produce globuli rossi più piccoli, più pallidi e meno numerosi.",
      "Ai tessuti arriva meno ossigeno: ci si sente stanchi, si diventa pallidi, il cuore batte più in fretta e manca il fiato.",
      "Curando la causa e reintegrando il ferro, se il medico lo prescrive, in alcune settimane i globuli rossi tornano normali.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «anaimía», mancanza di sangue. Tra il Cinquecento e l'Ottocento l'anemia delle ragazze era chiamata «clorosi» o «mal verde», per il colorito pallido e verdastro.",
    events: [
      {
        when: "1681",
        text: "Il medico inglese Thomas Sydenham cura la clorosi con il ferro, sotto forma di limatura sciolta nel vino.",
      },
      {
        when: "1926",
        text: "George Minot e William Murphy scoprono che il fegato crudo cura l'anemia perniciosa, legata alla vitamina B12: Nobel nel 1934, insieme a George Whipple.",
      },
      {
        when: "1959",
        text: "Max Perutz descrive la struttura dell'emoglobina; riceverà il Nobel per la chimica nel 1962.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Silvia, 35 anni: sempre stanca",
      story:
        "Silvia ha mestruazioni abbondanti da anni e da qualche mese si sente sempre stanca, ha il fiato corto salendo le scale e le unghie le si spezzano. Il medico le prescrive un esame del sangue: emoglobina e ferro sono bassi. La invia dal ginecologo per curare le mestruazioni abbondanti e le prescrive il ferro. Dopo tre mesi si sente un'altra persona.",
      lesson:
        "L'anemia è un segnale: oltre a reintegrare il ferro bisogna trovarne la causa. Non prendere integratori di ferro senza un esame del sangue.",
    },
  ],

  causes: [
    "Carenza di ferro, la causa più comune: mestruazioni abbondanti, gravidanza, perdite di sangue dall'intestino, alimentazione povera di ferro o difficoltà ad assorbirlo, ad esempio nella celiachia.",
    "Carenza di vitamina B12 o di acido folico.",
    "Malattie croniche e malattie del sangue, anche ereditarie come la talassemia, frequente in alcune zone d'Italia.",
  ],
  riskFactors: [
    "Mestruazioni abbondanti.",
    "Gravidanza.",
    "Alimentazione vegetariana o vegana non ben pianificata.",
    "Uso frequente di antinfiammatori o aspirina, che possono far sanguinare lo stomaco.",
    "Celiachia e altre malattie dell'intestino.",
    "Donazioni di sangue molto frequenti.",
  ],

  symptoms: {
    typical: [
      "Stanchezza e mancanza di energia",
      "Pallore",
      "Fiato corto, soprattutto sotto sforzo",
      "Battito accelerato o palpitazioni",
      "Mal di testa",
    ],
    lessCommon: [
      "Unghie fragili o a forma di cucchiaio",
      "Caduta dei capelli",
      "Lingua dolente e taglietti agli angoli della bocca",
      "Ronzii nelle orecchie",
      "Voglia di mangiare ghiaccio o cose non commestibili",
      "Gambe senza riposo",
    ],
  },

  treatments: {
    options: [
      {
        title: "Trovare la causa",
        text: "È il primo passo: il medico può prescrivere esami del sangue e delle feci o visite specialistiche.",
      },
      {
        title: "Ferro su prescrizione",
        text: "Il medico sceglie il prodotto e per quanto tempo prenderlo, di solito alcuni mesi, con esami di controllo. Può dare stitichezza o feci scure.",
      },
      {
        title: "Alimentazione",
        text: "Carne, pesce, legumi, verdure a foglia verde scuro e cereali arricchiti. La vitamina C, ad esempio degli agrumi, aiuta ad assorbire il ferro; tè e caffè ai pasti lo riducono.",
      },
      {
        title: "Altre cure",
        text: "Le anemie da altre cause richiedono cure specifiche, come la vitamina B12; nei casi gravi il ferro per vena o le trasfusioni.",
      },
    ],
    selfCare: [
      "Non prendere integratori di ferro senza un esame del sangue: anche l'eccesso fa male.",
      "Tieni gli integratori di ferro fuori dalla portata dei bambini: per loro un'ingestione accidentale è molto pericolosa.",
      "Evita tè e caffè durante i pasti ricchi di ferro.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Ti senti stanco e pallido da settimane, o hai il fiato corto per sforzi leggeri.",
      "Hai mestruazioni molto abbondanti.",
      "Sei in gravidanza e ti senti molto stanca.",
      "Vedi sangue nelle feci: senti il medico al più presto.",
    ],
    urgent: [
      "Hai un forte fiato corto anche a riposo, dolore al petto o svieni.",
      "Perdi molto sangue, vomiti sangue o hai feci nere con capogiri.",
    ],
  },

  prevention: [
    "Segui un'alimentazione varia, con diverse fonti di ferro.",
    "In gravidanza fai gli esami previsti.",
    "Fai curare le mestruazioni abbondanti.",
    "Non usare antinfiammatori a lungo senza il consiglio del medico.",
  ],

  specialist: {
    id: "ematologo",
    why: "Il medico di base fa la diagnosi e cerca la causa. L'ematologo segue le anemie che non migliorano o di origine poco chiara; possono servire anche il ginecologo o il gastroenterologo.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Anemia da carenza di ferro",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/a/anemia-da-carenza-di-ferro",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Iron deficiency anaemia",
      url: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/",
      lang: "en",
    },
    { publisher: "MedlinePlus", title: "Anemia", url: "https://medlineplus.gov/anemia.html", lang: "en" },
    {
      publisher: "MedlinePlus",
      title: "Iron deficiency anemia",
      url: "https://medlineplus.gov/ency/article/000584.htm",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["stanchezza", "pallore", "fiato-corto"],
    otherSymptoms: ["palpitazioni", "capogiri", "mal-di-testa", "capelli-fragili"],
    moreLikelyIf: [
      "Hai mestruazioni abbondanti o sei in gravidanza.",
      "Mangi poca carne e pochi legumi.",
      "I sintomi sono comparsi lentamente, nel giro di settimane.",
    ],
    lessLikelyIf: [
      "Hai febbre, tosse o altri segni di infezione.",
      "La stanchezza va di pari passo con umore basso e perdita di interesse.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
