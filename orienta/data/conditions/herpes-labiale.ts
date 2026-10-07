import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "herpes-labiale",
  name: "Herpes labiale",
  aliases: ["febbre sul labbro", "herpes simplex", "bollicine sul labbro", "herpes"],
  areas: ["pelle"],
  bodyZones: ["bocca"],

  overview:
    "L'herpes labiale è una piccola eruzione di vescicole dolorose sulle labbra o intorno alla bocca, causata dal virus herpes simplex di tipo 1. Dopo la prima infezione il virus resta per sempre nel corpo e può tornare con stress, sole, febbre o ciclo: le vescicole guariscono da sole in circa dieci giorni.",

  animation: {
    scene: "herpes-latenza",
    params: { variante: "labiale" },
    captions: [
      "Al primo contatto, spesso da bambini con un bacio, il virus entra dalla pelle o dalle mucose della bocca.",
      "Risale lungo un nervo del viso fino a un ganglio, un piccolo gruppo di cellule nervose vicino al cervello.",
      "Lì resta inattivo, nascosto al sistema immunitario, anche per anni.",
      "Stress, sole, febbre o ciclo possono risvegliarlo: torna lungo il nervo e fa comparire le vescicole, di solito nello stesso punto.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «herpein», strisciare: il nome descriveva lesioni che si allargano sulla pelle. Il nome popolare «febbre sul labbro» ricorda che spesso compare durante una febbre.",
    events: [
      {
        when: "Antichità",
        text: "I medici greci usano già la parola «herpes» per descrivere lesioni della pelle che si estendono.",
      },
      {
        when: "1919",
        text: "Il ricercatore Alfred Löwenstein dimostra che l'herpes è contagioso, trasmettendolo in laboratorio.",
      },
      {
        when: "Anni '60",
        text: "Si distinguono due virus: l'herpes simplex di tipo 1, legato soprattutto alle labbra, e quello di tipo 2.",
      },
      {
        when: "Anni '70-'80",
        text: "Il gruppo di Gertrude Elion sviluppa l'aciclovir, il primo antivirale efficace e sicuro contro gli herpesvirus. Elion riceverà il Nobel nel 1988.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Giulia, 25 anni: il formicolio prima degli esami",
      story:
        "Ogni volta che ha un esame importante, Giulia sente un formicolio sul labbro superiore e il giorno dopo compaiono piccole vescicole. Ha imparato ad applicare una crema antivirale da banco appena sente il formicolio, a usare un balsamo con protezione solare in montagna e a non baciare nessuno finché le croste non sono cadute.",
      lesson:
        "Le creme antivirali funzionano meglio se usate ai primi segnali. Durante l'episodio l'herpes è contagioso: attenzione soprattutto ai neonati.",
    },
  ],

  causes: [
    "Il virus herpes simplex di tipo 1, più di rado quello di tipo 2.",
    "Si trasmette con il contatto diretto, come un bacio, o condividendo bicchieri e rossetti, soprattutto quando ci sono le vescicole.",
    "Dopo la prima infezione il virus resta nei nervi e può riattivarsi.",
  ],
  riskFactors: [
    "Stress e stanchezza.",
    "Sole e vento.",
    "Febbre e altre infezioni.",
    "Ciclo mestruale.",
    "Difese immunitarie basse.",
  ],

  symptoms: {
    typical: [
      "Formicolio, prurito o bruciore sul labbro prima delle vescicole",
      "Piccole vescicole dolorose raggruppate sul bordo del labbro",
      "Le vescicole si rompono e formano una crosta che guarisce in circa 10 giorni",
    ],
    lessCommon: [
      "Alla prima infezione, soprattutto nei bambini: febbre, gengive gonfie e dolorose e tante piccole ulcere in bocca",
      "Ghiandole del collo gonfie",
      "Vescicole sul naso o sul mento",
    ],
  },

  treatments: {
    options: [
      {
        title: "Creme antivirali",
        text: "Si trovano in farmacia e funzionano meglio se applicate ai primi segnali, quando senti il formicolio. Chiedi al farmacista.",
      },
      { title: "Cerotti per l'herpes", text: "Proteggono la lesione e riducono il rischio di contagio." },
      { title: "Antidolorifici", text: "Per il dolore. Chiedi al farmacista quale è adatto a te." },
      {
        title: "Antivirali per bocca",
        text: "Il medico può prescriverli se gli episodi sono molto estesi, dolorosi o frequenti.",
      },
    ],
    selfCare: [
      "Non toccare le vescicole, e lavati le mani se lo fai.",
      "Applica la crema picchiettando, senza strofinare.",
      "Al sole usa un balsamo per le labbra con protezione solare.",
      "Quando hai l'herpes non baciare i neonati: per loro può essere molto pericoloso.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "L'herpes non inizia a guarire entro 10 giorni.",
      "È molto esteso o doloroso, oppure torna molto spesso.",
      "Un bambino ha gengive gonfie e tante ulcere in bocca e beve poco.",
      "Hai difese basse, ad esempio per chemioterapia o diabete, o sei in gravidanza.",
    ],
    urgent: [
      "L'herpes è vicino all'occhio e l'occhio è rosso, fa male o vedi offuscato.",
      "Un neonato ha vescicole sulla pelle o è molto abbattuto.",
      "Compaiono febbre alta, forte mal di testa, confusione o convulsioni.",
    ],
  },

  prevention: [
    "Proteggi le labbra dal sole.",
    "Non condividere bicchieri, posate, asciugamani e rossetti.",
    "Riconosci i tuoi fattori scatenanti e, se gli episodi sono frequenti, parlane con il medico.",
  ],

  specialist: {
    id: "dermatologo",
    why: "Per gli episodi comuni bastano il farmacista o il medico di base. Il dermatologo serve per le forme frequenti o estese; se l'herpes è vicino all'occhio serve l'oculista con urgenza.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Herpes labiale",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/h/herpes-labiale",
      lang: "it",
    },
    { publisher: "NHS", title: "Cold sores", url: "https://www.nhs.uk/conditions/cold-sores/", lang: "en" },
    { publisher: "MedlinePlus", title: "Cold Sores", url: "https://medlineplus.gov/coldsores.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["vescicole-labbra", "formicolio-labbra"],
    otherSymptoms: ["linfonodi-gonfi", "febbre"],
    moreLikelyIf: [
      "Le vescicole tornano sempre nello stesso punto.",
      "Prima delle vescicole hai sentito formicolio o bruciore.",
      "Sono comparse dopo sole, febbre o un periodo di stress.",
    ],
    lessLikelyIf: [
      "Sono croste color miele che si allargano sul viso: può essere un'infezione batterica, l'impetigine.",
      "La lesione è dentro la bocca e non ci sono vescicole: può essere un'afta.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
