import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "cefalea-tensiva",
  name: "Cefalea tensiva",
  aliases: ["cefalea di tipo tensivo", "mal di testa da tensione", "cerchio alla testa", "mal di testa da stress"],
  areas: ["testa", "muscoli"],
  bodyZones: ["testa", "nuca", "spalle"],

  overview:
    "La cefalea tensiva è il tipo di mal di testa più comune: un dolore sordo su entrambi i lati, come una fascia che stringe la testa. Di solito è leggera o moderata, non peggiora con il movimento e si collega spesso a stress, stanchezza e postura.",

  animation: {
    scene: "tensione-muscolare",
    params: { zona: "testa" },
    captions: [
      "Testa, collo e spalle sono avvolti da muscoli che lavorano anche quando non ce ne accorgiamo.",
      "Stress, stanchezza, una postura scorretta o tante ore al computer li tengono contratti.",
      "Muscoli tesi e nervi più sensibili producono un dolore sordo, come una fascia stretta attorno alla testa.",
      "Pause, movimento, sonno regolare e tecniche di rilassamento sciolgono la tensione.",
    ],
  },

  history: {
    nameOrigin:
      "«Cefalea» viene dal greco «kephalé», testa. «Tensiva» richiama la tensione muscolare ed emotiva che spesso l'accompagna: un tempo si parlava di cefalea muscolo-tensiva.",
    events: [
      {
        when: "1962",
        text: "Un comitato di esperti negli Stati Uniti propone una delle prime classificazioni dei mal di testa, con la «cefalea da contrazione muscolare».",
      },
      {
        when: "1988",
        text: "La International Headache Society pubblica la prima classificazione internazionale delle cefalee e introduce il nome «cefalea di tipo tensivo».",
      },
      {
        when: "2018",
        text: "Esce la terza edizione della classificazione internazionale, usata oggi dai medici di tutto il mondo.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Federica, 45 anni: la fascia del venerdì",
      story:
        "Federica lavora al computer e il venerdì pomeriggio sente spesso un dolore sordo alle tempie, come una fascia stretta, con collo e spalle rigidi. Riesce a lavorare, ma è stanca. Con una pausa ogni ora, una postazione più comoda e una camminata al giorno, gli episodi diventano rari.",
      lesson:
        "La cefalea tensiva è fastidiosa ma non pericolosa: abitudini e pause contano quanto gli antidolorifici.",
    },
  ],

  causes: [
    "Stress e tensione emotiva.",
    "Contrazione dei muscoli di testa, collo e spalle, ad esempio per una postura scorretta.",
    "Sonno insufficiente o irregolare e stanchezza.",
    "Uso troppo frequente di antidolorifici, che può mantenere il mal di testa.",
  ],
  riskFactors: [
    "Lavoro sedentario al computer.",
    "Ansia e depressione.",
    "Poca attività fisica.",
    "Troppa caffeina, o una sospensione improvvisa.",
  ],

  symptoms: {
    typical: [
      "Dolore sordo su entrambi i lati della testa, della fronte o del collo",
      "Sensazione di pressione o di una fascia che stringe",
      "Riesci comunque a fare le tue attività",
    ],
    lessCommon: [
      "Testa e collo dolenti al tocco",
      "Leggero fastidio per la luce o per i rumori",
      "Episodi che durano da mezz'ora a diversi giorni",
    ],
  },

  treatments: {
    options: [
      {
        title: "Antidolorifici da banco",
        text: "Funzionano per gli episodi occasionali. Chiedi al farmacista quale è adatto a te, soprattutto in gravidanza, quando alcuni sono sconsigliati.",
      },
      { title: "Rilassamento e movimento", text: "Attività fisica, yoga, stretching e massaggi riducono la tensione." },
      { title: "Caldo o freddo", text: "Un impacco caldo o freddo su collo e spalle può dare sollievo." },
      {
        title: "Terapia preventiva",
        text: "Se gli episodi sono molto frequenti, il medico può proporre un farmaco preventivo per alcuni mesi.",
      },
    ],
    selfCare: [
      "Se lavori al computer, fai pause regolari e cura la postura.",
      "Dormi a orari regolari.",
      "Riduci la caffeina in modo graduale.",
      "Non prendere antidolorifici troppo spesso: possono causare un mal di testa da uso eccessivo.",
      "Non dare acido acetilsalicilico (aspirina) a bambini e ragazzi sotto i 16 anni.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai mal di testa più volte a settimana o sono forti.",
      "Antidolorifici e rilassamento non aiutano.",
      "Il dolore è pulsante, da un lato, con nausea e fastidio per luce e rumori: potrebbe essere emicrania.",
      "Un bambino ha mal di testa che lo sveglia di notte, al risveglio, che peggiora nel tempo o con vomito.",
    ],
    urgent: [
      "Mal di testa improvviso e fortissimo.",
      "Mal di testa dopo un colpo alla testa.",
      "Difficoltà a parlare, perdita della vista, confusione o sonnolenza.",
      "Febbre alta con collo rigido.",
      "Mal di testa forte con dolore alla mandibola quando mastichi o cuoio capelluto dolente, soprattutto dopo i 50 anni.",
    ],
  },

  prevention: [
    "Muoviti ogni giorno.",
    "Organizza pause e postazione di lavoro.",
    "Impara una tecnica di rilassamento.",
    "Dormi a sufficienza.",
  ],

  specialist: {
    id: "neurologo",
    why: "Se il mal di testa è frequente, non risponde alle cure o non è chiaro di che tipo sia, il medico di base può indirizzarti al neurologo o a un centro cefalee.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Cefalea di tipo tensivo",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/c/cefalea-di-tipo-tensivo",
      lang: "it",
    },
    { publisher: "NHS", title: "Tension headaches", url: "https://www.nhs.uk/conditions/tension-headaches/", lang: "en" },
    {
      publisher: "MedlinePlus",
      title: "Tension headache",
      url: "https://medlineplus.gov/ency/article/000797.htm",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["mal-di-testa-a-fascia", "tensione-collo-spalle"],
    otherSymptoms: ["mal-di-testa", "stanchezza", "difficolta-concentrazione"],
    moreLikelyIf: [
      "Il dolore stringe su entrambi i lati della testa.",
      "Riesci a fare le tue attività e il movimento non lo peggiora.",
      "Compare nei periodi di stress o dopo tante ore al computer.",
    ],
    lessLikelyIf: [
      "Il dolore è pulsante, da un lato, con nausea o vomito.",
      "È comparso all'improvviso ed è fortissimo: serve aiuto subito.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
