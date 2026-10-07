import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "covid-19",
  name: "COVID-19",
  aliases: ["coronavirus", "covid", "SARS-CoV-2"],
  areas: ["respiro", "corpo"],
  bodyZones: ["petto", "collo", "naso", "tutto-il-corpo"],

  overview:
    "La COVID-19 è un'infezione delle vie respiratorie causata dal coronavirus SARS-CoV-2. Oggi nella maggior parte delle persone assomiglia a un raffreddore o a un'influenza e passa in pochi giorni, ma negli anziani e nelle persone fragili può ancora causare forme gravi, come la polmonite.",

  animation: {
    scene: "infezione-virale",
    params: { virus: "coronavirus", sede: "polmoni" },
    captions: [
      "Il coronavirus si diffonde con le goccioline e le particelle più piccole che emettiamo respirando, parlando e tossendo.",
      "La proteina Spike, le punte della sua «corona», si aggancia a un recettore delle cellule chiamato ACE2.",
      "Il virus entra e usa la cellula per fare copie di sé: l'infezione può scendere dal naso fino ai polmoni.",
      "Anticorpi e globuli bianchi lo combattono. I vaccini insegnano al corpo a riconoscere la proteina Spike.",
    ],
  },

  history: {
    nameOrigin:
      "COVID-19 è una sigla inglese: COronaVIrus Disease, cioè «malattia da coronavirus», e 19 per il 2019, l'anno in cui è comparsa. Il virus si chiama SARS-CoV-2 perché è parente di quello della SARS del 2003.",
    events: [
      { when: "Dicembre 2019", text: "A Wuhan, in Cina, vengono segnalati i primi casi di una polmonite di causa sconosciuta." },
      { when: "Febbraio 2020", text: "L'Organizzazione mondiale della sanità chiama la malattia COVID-19. Il 21 febbraio, a Codogno, viene identificato il primo caso italiano trasmesso in Italia." },
      { when: "11 marzo 2020", text: "L'Organizzazione mondiale della sanità dichiara la pandemia." },
      { when: "27 dicembre 2020", text: "In Italia e negli altri Paesi dell'Unione europea iniziano le vaccinazioni." },
      {
        when: "2023",
        text: "A maggio l'OMS dichiara conclusa l'emergenza sanitaria internazionale. In ottobre il Nobel per la medicina va a Katalin Karikó e Drew Weissman, i cui studi hanno reso possibili i vaccini a mRNA.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Luca, 29 anni, e la visita alla nonna",
      story:
        "Luca ha mal di gola, naso chiuso e un po' di febbre, e il test rapido è positivo. Si sente abbastanza bene, ma rimanda di una settimana la visita alla nonna di 88 anni e indossa la mascherina quando incontra altre persone. In quattro giorni sta meglio.",
      lesson:
        "Per molti la COVID-19 oggi è lieve, ma resta pericolosa per le persone fragili: proteggerle è una delle cose più utili che puoi fare.",
    },
  ],

  causes: [
    "Il coronavirus SARS-CoV-2 e le sue varianti.",
    "Si trasmette respirando le goccioline e le particelle emesse da una persona infetta, soprattutto in ambienti chiusi e poco ventilati; più di rado toccando superfici contaminate.",
  ],
  riskFactors: [
    "Età avanzata, soprattutto oltre gli 80 anni.",
    "Malattie croniche di cuore, polmoni o reni, diabete e obesità.",
    "Difese immunitarie basse.",
    "Gravidanza.",
    "Ultimo richiamo del vaccino fatto da molto tempo, se sei una persona a rischio.",
  ],

  symptoms: {
    typical: ["Febbre o brividi", "Tosse", "Mal di gola", "Naso chiuso o che cola", "Stanchezza", "Dolori muscolari e mal di testa"],
    lessCommon: [
      "Perdita o alterazione di olfatto e gusto",
      "Fiato corto",
      "Poco appetito",
      "Nausea, vomito o diarrea",
      "Disturbi che durano settimane o mesi dopo l'infezione (long COVID)",
    ],
  },

  treatments: {
    options: [
      {
        title: "Cure dei sintomi a casa",
        text: "Riposo, liquidi e, se ti senti a disagio, antifebbrili o antidolorifici. Chiedi al medico o al farmacista quali prodotti usare.",
      },
      {
        title: "Antivirali per chi è a rischio",
        text: "Per le persone a rischio di forme gravi il medico può prescrivere antivirali da iniziare entro pochi giorni dai sintomi: se sei fragile, fai il test e contattalo subito.",
      },
      { title: "Cure in ospedale", text: "Le forme gravi, con polmonite e ossigeno basso nel sangue, si curano in ospedale." },
      {
        title: "Niente antibiotici",
        text: "Non agiscono sul virus. Il medico li valuta solo se si aggiunge un'infezione batterica.",
      },
    ],
    selfCare: [
      "Se hai la febbre o non ti senti abbastanza bene per le tue attività, resta a casa.",
      "Per qualche giorno evita le persone fragili e indossa la mascherina se devi stare con altri.",
      "Se hai il fiato corto, siediti con la schiena dritta, piegati un po' in avanti con le mani sulle ginocchia e respira lentamente.",
      "Per la tosse può aiutare un cucchiaino di miele, ma non sotto i 12 mesi.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Sei a rischio di forme gravi, per età, malattie croniche, gravidanza o difese basse: contatta il medico appena compaiono i sintomi.",
      "La febbre dura 5 giorni o più, o non scende con gli antifebbrili.",
      "I sintomi peggiorano o non migliorano.",
      "Un neonato sotto i 3 mesi ha 38 °C o più, o un bambino tra 3 e 6 mesi ha 39 °C o più.",
      "Hai disturbi che durano più di 4 settimane.",
    ],
    urgent: [
      "Hai così poco fiato da non riuscire a dire frasi brevi a riposo, o il respiro peggiora all'improvviso.",
      "Hai un dolore al petto improvviso.",
      "Tossisci sangue.",
      "Svieni, sei molto confuso o hai convulsioni.",
      "Compaiono macchie sulla pelle che non scompaiono premendoci sopra un bicchiere.",
    ],
  },

  prevention: [
    "Se sei anziano, fragile o in gravidanza, segui le indicazioni del Ministero e del tuo medico sui richiami del vaccino, di solito offerti in autunno.",
    "Arieggia spesso gli ambienti chiusi.",
    "Lavati spesso le mani.",
    "Se hai sintomi, indossa la mascherina vicino ad altre persone ed evita chi è fragile.",
  ],

  specialist: {
    id: "medico-di-base",
    why: "Il medico di base valuta se sei a rischio, se servono antivirali e quando è necessario un controllo. Le forme gravi si curano in ospedale.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "COVID-19",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/c/covid-19",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Covid-19",
      url: "https://www.salute.gov.it/new/it/tema/covid-19/",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "COVID-19 symptoms and what to do",
      url: "https://www.nhs.uk/conditions/covid-19/covid-19-symptoms-and-what-to-do/",
      lang: "en",
    },
    {
      publisher: "MedlinePlus",
      title: "COVID-19 (Coronavirus Disease 2019)",
      url: "https://medlineplus.gov/covid19coronavirusdisease2019.html",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["febbre", "tosse-secca", "mal-di-gola", "stanchezza"],
    otherSymptoms: [
      "perdita-olfatto",
      "naso-che-cola",
      "naso-chiuso",
      "dolori-muscolari",
      "mal-di-testa",
      "fiato-corto",
      "diarrea",
      "nausea",
    ],
    moreLikelyIf: [
      "Hai perso olfatto o gusto, o li senti alterati.",
      "Sei stato a contatto con una persona positiva.",
      "Un test per la COVID-19 è risultato positivo.",
    ],
    lessLikelyIf: [
      "Hai solo starnuti e prurito agli occhi, ogni anno nella stessa stagione.",
      "Un test fatto mentre avevi i sintomi è negativo, anche se un test negativo non esclude del tutto l'infezione.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
