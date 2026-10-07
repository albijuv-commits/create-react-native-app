import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "faringite-tonsillite",
  name: "Faringite e tonsillite",
  aliases: ["mal di gola", "faringite", "tonsillite", "placche in gola", "angina", "streptococco"],
  areas: ["orl"],
  bodyZones: ["collo", "bocca"],

  overview:
    "La faringite è l'infiammazione della gola e la tonsillite quella delle tonsille, le due piccole masse ai lati della gola. Sono causate quasi sempre da virus, più di rado da batteri come lo streptococco, e di solito guariscono da sole in pochi giorni, al massimo una settimana.",

  animation: {
    scene: "infiammazione",
    params: { tessuto: "gola" },
    captions: [
      "La gola è rivestita da una mucosa ricca di piccoli vasi; ai lati ci sono le tonsille, che fanno parte delle difese del corpo.",
      "Un virus, più spesso, o un batterio come lo streptococco si deposita sulla mucosa.",
      "I vasi si dilatano e la mucosa si gonfia: la gola diventa rossa, deglutire fa male e sulle tonsille possono comparire placche.",
      "Globuli bianchi e anticorpi eliminano l'infezione, di solito in pochi giorni. Gli antibiotici servono solo contro i batteri.",
    ],
  },

  history: {
    nameOrigin:
      "«Faringite» viene dal greco «pharynx», gola. «Tonsilla» è la parola latina per le tonsille. In passato si parlava di «angina», dal latino «angere», stringere.",
    events: [
      {
        when: "I secolo d.C.",
        text: "Il medico romano Celso descrive l'asportazione delle tonsille: è uno degli interventi chirurgici più antichi.",
      },
      {
        when: "Anni '40",
        text: "La penicillina permette di curare la faringite da streptococco e di prevenirne una complicazione temuta, la febbre reumatica.",
      },
      {
        when: "1981",
        text: "Il medico statunitense Robert Centor propone un punteggio basato su pochi segni per capire quando la causa può essere lo streptococco.",
      },
      {
        when: "Anni '80",
        text: "Arrivano i test rapidi per lo streptococco: con un tampone della gola danno la risposta in pochi minuti.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Giacomo, 12 anni: placche e febbre senza tosse",
      story:
        "Giacomo ha la febbre alta, un forte mal di gola e le tonsille gonfie con placche bianche, ma non tossisce. Il pediatra fa un test rapido con il tampone: è positivo per lo streptococco. Prescrive un antibiotico e raccomanda di finire la cura. Dopo due giorni Giacomo sta meglio e torna a scuola.",
      lesson:
        "Quasi tutti i mal di gola sono virali e non hanno bisogno di antibiotici. Il tampone aiuta a riconoscere i casi da streptococco, che invece vanno curati.",
    },
  ],

  causes: [
    "Virus, nella grande maggioranza dei casi: gli stessi di raffreddore e influenza, oppure il virus della mononucleosi.",
    "Batteri, soprattutto lo streptococco beta-emolitico di gruppo A, più frequente nei bambini in età scolare.",
    "Fumo, aria secca e uso eccessivo della voce, che irritano la gola.",
  ],
  riskFactors: [
    "Età scolare, per la tonsillite da streptococco.",
    "Contatti stretti con persone malate, ad esempio a scuola.",
    "Fumo, attivo o passivo.",
    "Difese immunitarie basse.",
  ],

  symptoms: {
    typical: [
      "Mal di gola, soprattutto quando deglutisci",
      "Gola arrossata e secca",
      "Tonsille rosse e gonfie, a volte con placche bianche",
      "Febbre",
    ],
    lessCommon: [
      "Ghiandole del collo gonfie e dolenti",
      "Mal di testa",
      "Mal d'orecchio",
      "Alito cattivo",
      "Nei bambini: nausea, vomito o mal di pancia",
    ],
  },

  treatments: {
    options: [
      {
        title: "Cure dei sintomi",
        text: "Antidolorifici e antifebbrili, pastiglie e spray per la gola. Chiedi al farmacista quali sono adatti a te.",
      },
      {
        title: "Antibiotici solo per i batteri",
        text: "Se il medico sospetta lo streptococco può fare un tampone e prescrivere un antibiotico, da prendere fino alla fine della cura.",
      },
      {
        title: "Asportazione delle tonsille",
        text: "Si valuta solo in rari casi, quando tonsilliti importanti tornano molto spesso.",
      },
    ],
    selfCare: [
      "Riposa e bevi molto: bevande fresche e cibi morbidi danno sollievo.",
      "Gli adulti possono fare gargarismi con acqua tiepida e sale; non sono adatti ai bambini piccoli.",
      "Non fumare ed evita gli ambienti pieni di fumo.",
      "Non dare acido acetilsalicilico (aspirina) a bambini e ragazzi sotto i 16 anni.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Il mal di gola non migliora dopo una settimana.",
      "Hai placche di pus sulle tonsille e febbre alta, senza tosse.",
      "Il dolore è così forte che fai fatica a mangiare e bere.",
      "Le infezioni alla gola tornano spesso.",
      "Hai un rigonfiamento nel collo o un'afta in bocca che dura più di 3 settimane.",
    ],
    urgent: [
      "Fai fatica a respirare, emetti un suono acuto quando respiri o non riesci a deglutire nemmeno la saliva.",
      "Hai un gonfiore in gola che peggiora in fretta, o fai fatica ad aprire la bocca o a parlare.",
      "I sintomi sono gravi e peggiorano rapidamente.",
    ],
  },

  prevention: [
    "Lavati spesso le mani.",
    "Non condividere bicchieri e posate con chi è malato.",
    "Copri bocca e naso quando tossisci o starnutisci.",
    "Non fumare.",
  ],

  specialist: {
    id: "otorinolaringoiatra",
    why: "Il medico di base o il pediatra curano la singola infezione. L'otorinolaringoiatra valuta le tonsilliti che tornano spesso e le complicazioni.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Faringite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/f/faringite",
      lang: "it",
    },
    {
      publisher: "ISSalute",
      title: "Tonsillite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/t/tonsillite",
      lang: "it",
    },
    { publisher: "NHS", title: "Sore throat", url: "https://www.nhs.uk/symptoms/sore-throat/", lang: "en" },
    { publisher: "NHS", title: "Tonsillitis", url: "https://www.nhs.uk/conditions/tonsillitis/", lang: "en" },
    { publisher: "MedlinePlus", title: "Sore Throat", url: "https://medlineplus.gov/sorethroat.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["mal-di-gola", "difficolta-deglutire"],
    otherSymptoms: ["febbre", "tonsille-gonfie", "linfonodi-gonfi", "raucedine", "mal-di-testa", "tosse-secca"],
    moreLikelyIf: [
      "Il dolore aumenta quando deglutisci.",
      "Le tonsille sono rosse o hanno placche.",
      "Febbre senza tosse fa pensare allo streptococco, soprattutto nei bambini.",
    ],
    lessLikelyIf: [
      "Sei molto stanco da settimane e hai le ghiandole del collo molto gonfie: va considerata la mononucleosi.",
      "Il mal di gola dura da più di 3 settimane.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
