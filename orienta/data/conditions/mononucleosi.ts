import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "mononucleosi",
  name: "Mononucleosi",
  aliases: ["mononucleosi infettiva", "malattia del bacio", "virus di Epstein-Barr", "febbre ghiandolare"],
  areas: ["orl", "corpo"],
  bodyZones: ["collo", "tutto-il-corpo"],

  overview:
    "La mononucleosi è un'infezione causata soprattutto dal virus di Epstein-Barr, frequente tra adolescenti e giovani adulti. Provoca febbre, mal di gola forte, ghiandole del collo gonfie e una stanchezza che può durare settimane: guarisce da sola, ma richiede riposo e una pausa dagli sport intensi.",

  animation: {
    scene: "infezione-virale",
    params: { virus: "herpesvirus", sede: "gola" },
    captions: [
      "Il virus di Epstein-Barr si trasmette con la saliva: baci, bicchieri e posate condivisi.",
      "Infetta le cellule della gola e poi alcuni globuli bianchi, i linfociti B.",
      "Il sistema immunitario reagisce con forza: tonsille, linfonodi e milza si gonfiano, arrivano febbre e stanchezza.",
      "In alcune settimane il corpo tiene sotto controllo il virus, che resta inattivo per tutta la vita. Riposo e pazienza sono la cura.",
    ],
  },

  history: {
    nameOrigin:
      "«Mononucleosi» si riferisce all'aumento nel sangue di globuli bianchi con un solo nucleo, visibili al microscopio. È detta «malattia del bacio» perché si trasmette con la saliva.",
    events: [
      { when: "1889", text: "Il medico tedesco Emil Pfeiffer descrive la «febbre ghiandolare» nei bambini." },
      {
        when: "1920",
        text: "Thomas Sprunt e Frank Evans la chiamano mononucleosi infettiva, per i globuli bianchi particolari visti nel sangue.",
      },
      {
        when: "1964",
        text: "Anthony Epstein, Bert Achong e Yvonne Barr scoprono al microscopio elettronico il virus che porterà il nome di Epstein e Barr.",
      },
      {
        when: "1968",
        text: "Werner e Gertrude Henle dimostrano che il virus di Epstein-Barr causa la mononucleosi, dopo che una tecnica del loro laboratorio si ammala.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Martina, 17 anni: la stanchezza dopo il mal di gola",
      story:
        "Martina ha febbre, un mal di gola fortissimo e ghiandole gonfie nel collo. Il tampone per lo streptococco è negativo e gli esami del sangue confermano la mononucleosi. Il medico le consiglia riposo, liquidi e un antidolorifico, e di evitare gli sport di contatto per almeno un mese per proteggere la milza. La febbre passa in dieci giorni, la stanchezza in sei settimane.",
      lesson:
        "Nella mononucleosi gli antibiotici non servono, e alcuni possono causare un'eruzione cutanea. Lo sport intenso va ripreso con cautela.",
    },
  ],

  causes: [
    "Il virus di Epstein-Barr, della famiglia degli herpesvirus; più di rado altri virus, come il citomegalovirus.",
    "Si trasmette con la saliva: si può essere contagiosi per settimane prima dei sintomi e per mesi dopo.",
  ],
  riskFactors: [
    "Età tra i 15 e i 24 anni.",
    "Baci e condivisione di bicchieri e posate.",
    "Vita in comunità, come collegi o residenze universitarie.",
  ],

  symptoms: {
    typical: [
      "Febbre",
      "Mal di gola forte, spesso con tonsille gonfie e placche",
      "Ghiandole gonfie nel collo",
      "Stanchezza intensa, che può durare settimane",
    ],
    lessCommon: [
      "Ghiandole gonfie anche sotto le ascelle o all'inguine",
      "Mal di testa",
      "Eruzione cutanea, soprattutto dopo alcuni antibiotici",
      "Milza o fegato ingrossati",
      "Palpebre gonfie",
    ],
  },

  treatments: {
    options: [
      { title: "Riposo", text: "È la cura principale. Riprendi le attività con gradualità, ascoltando la stanchezza." },
      {
        title: "Liquidi e antidolorifici",
        text: "Bevi spesso a piccoli sorsi; un antidolorifico o antifebbrile consigliato dal medico o dal farmacista aiuta con febbre e mal di gola.",
      },
      {
        title: "Niente antibiotici",
        text: "Non agiscono sul virus, e alcuni, come l'amoxicillina, possono causare un'eruzione cutanea.",
      },
      {
        title: "Cortisone in casi particolari",
        text: "Il medico può prescriverlo se le tonsille sono così gonfie da rendere difficile respirare o deglutire.",
      },
    ],
    selfCare: [
      "Evita sport di contatto e sollevamenti pesanti per almeno 3-4 settimane, o finché il medico non ti dice che la milza è tornata normale.",
      "Finché sei malato non condividere bicchieri e posate e non baciare.",
      "Non donare il sangue per qualche mese.",
      "Non dare acido acetilsalicilico (aspirina) a bambini e ragazzi sotto i 16 anni.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai febbre alta, un mal di gola forte o ghiandole del collo molto gonfie.",
      "Ti senti estremamente stanco.",
      "Il mal di gola non migliora.",
    ],
    urgent: [
      "Non riesci a deglutire nemmeno la saliva o respiri con molta fatica.",
      "Hai un dolore improvviso e forte alla pancia, soprattutto in alto a sinistra: la milza potrebbe essersi rotta.",
      "Hai la pelle o gli occhi gialli e stai molto male.",
    ],
  },

  prevention: [
    "Non condividere bicchieri, posate e bottiglie.",
    "Lavati spesso le mani.",
    "Non esiste ancora un vaccino.",
  ],

  specialist: {
    id: "medico-di-base",
    why: "Il medico di base fa la diagnosi con gli esami del sangue e segue la guarigione; l'infettivologo serve solo nelle forme complicate.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Mononucleosi infettiva",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/m/mononucleosi-infettiva",
      lang: "it",
    },
    { publisher: "NHS", title: "Glandular fever", url: "https://www.nhs.uk/conditions/glandular-fever/", lang: "en" },
    {
      publisher: "MedlinePlus",
      title: "Infectious Mononucleosis",
      url: "https://medlineplus.gov/infectiousmononucleosis.html",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["mal-di-gola", "linfonodi-gonfi", "stanchezza", "febbre"],
    otherSymptoms: ["tonsille-gonfie", "difficolta-deglutire", "mal-di-testa", "palpebre-gonfie"],
    moreLikelyIf: [
      "Hai tra i 15 e i 24 anni.",
      "La stanchezza è molto forte e dura più di una settimana.",
      "Il tampone per lo streptococco è negativo.",
    ],
    lessLikelyIf: [
      "Il mal di gola passa in pochi giorni.",
      "Hai soprattutto naso che cola e tosse: è più tipico di un raffreddore.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
