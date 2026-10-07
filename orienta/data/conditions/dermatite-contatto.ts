import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "dermatite-contatto",
  name: "Dermatite da contatto",
  aliases: ["eczema da contatto", "allergia al nichel", "dermatite irritativa", "dermatite allergica da contatto"],
  areas: ["pelle"],
  bodyZones: ["pelle", "mani"],

  overview:
    "La dermatite da contatto è un'infiammazione della pelle che compare dove la pelle tocca una sostanza irritante o a cui si è allergici, come un detersivo o il nichel. La pelle diventa rossa, secca e pruriginosa, a volte con piccole vescicole: di solito guarisce quando si scopre la sostanza responsabile e la si evita.",

  animation: {
    scene: "pelle",
    params: { variante: "contatto" },
    captions: [
      "La pelle sana è una barriera che tiene fuori la maggior parte delle sostanze.",
      "Una sostanza irritante, come un detersivo, o un allergene, come il nichel di un bottone, resta a contatto con la pelle.",
      "La pelle si infiamma: rossore, prurito e a volte piccole vescicole. Nella forma allergica la reazione arriva uno o due giorni dopo il contatto.",
      "Allontanando la sostanza e proteggendo la pelle con guanti ed emollienti, l'infiammazione si spegne.",
    ],
  },

  history: {
    nameOrigin:
      "«Dermatite» viene dal greco «derma», pelle, più il suffisso «-ite», infiammazione. «Da contatto» indica che nasce dove la pelle tocca la sostanza responsabile.",
    events: [
      {
        when: "1895",
        text: "Il dermatologo tedesco Josef Jadassohn inventa il patch test: la sostanza sospetta si applica sulla pelle sotto un cerotto per vedere se provoca una reazione.",
      },
      {
        when: "1950",
        text: "In Svizzera si scopre che la dermatite dei muratori è dovuta al cromo contenuto nel cemento.",
      },
      {
        when: "1994",
        text: "L'Unione europea limita il nichel che può essere rilasciato dagli oggetti a contatto prolungato con la pelle, come bigiotteria e orologi.",
      },
      {
        when: "2005",
        text: "Entra in vigore una norma europea che limita il cromo nel cemento: i casi di dermatite tra i muratori calano.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Simona, 38 anni: il prurito sotto l'orologio",
      story:
        "Simona nota una chiazza rossa e pruriginosa sul polso, proprio sotto la fibbia dell'orologio, e un'altra sulla pancia all'altezza del bottone dei jeans. Il dermatologo le propone il patch test: è allergica al nichel. Con un cinturino diverso e i bottoni coperti, la pelle guarisce in poche settimane.",
      lesson:
        "Spesso la forma della chiazza disegna l'oggetto responsabile. Il patch test aiuta a scoprire l'allergene.",
    },
  ],

  causes: [
    "Sostanze irritanti, la causa più comune: saponi, detersivi, solventi, contatto frequente con l'acqua.",
    "Allergeni come il nichel di bigiotteria e bottoni, profumi e conservanti dei cosmetici, tinture per capelli, gomma, lattice e alcune piante.",
  ],
  riskFactors: [
    "Lavori con le mani spesso bagnate o a contatto con sostanze chimiche: parrucchieri, sanitari, addetti alle pulizie, cuochi, muratori.",
    "Dermatite atopica.",
    "Piercing e bigiotteria.",
  ],

  symptoms: {
    typical: [
      "Chiazze rosse e pruriginose dove la pelle ha toccato la sostanza",
      "Pelle secca, screpolata o con piccoli taglietti",
      "Bruciore",
    ],
    lessCommon: [
      "Piccole vescicole che possono trasudare",
      "Pelle ispessita se il contatto continua a lungo",
      "Chiazze che si estendono oltre la zona di contatto, nella forma allergica",
    ],
  },

  treatments: {
    options: [
      { title: "Evitare la sostanza", text: "È la cura più efficace: senza contatto, la pelle guarisce." },
      {
        title: "Emollienti",
        text: "Mantengono la pelle idratata e rinforzano la barriera. Usali spesso e al posto del sapone.",
      },
      { title: "Cortisonici da applicare sulla pelle", text: "Per le forme più intense, su indicazione del medico." },
      { title: "Patch test", text: "Il dermatologo lo usa per scoprire a che cosa sei allergico, se la causa non è chiara." },
    ],
    selfCare: [
      "Per le pulizie indossa guanti, meglio con un sottoguanto di cotone, e toglili ogni tanto.",
      "Dopo un contatto sciacqua subito la pelle con acqua tiepida.",
      "Leggi gli ingredienti di cosmetici e saponi.",
      "Scegli bigiotteria e accessori senza nichel.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "La dermatite non passa, torna spesso o è estesa.",
      "Non riesci a capire che cosa la provoca.",
      "Ti impedisce di lavorare.",
    ],
    urgent: [
      "La pelle è molto gonfia, calda e dolente, con pus o febbre: può essersi infettata.",
      "Dopo il contatto con una sostanza ti si gonfiano labbra, lingua o gola, o fai fatica a respirare.",
    ],
  },

  prevention: [
    "Proteggi le mani con guanti adatti.",
    "Usa spesso gli emollienti, soprattutto se lavori con l'acqua.",
    "Evita i prodotti che ti hanno già dato reazioni.",
    "Scegli prodotti senza profumo.",
  ],

  specialist: {
    id: "dermatologo",
    why: "Il dermatologo esegue il patch test per individuare l'allergene. Per le forme legate al lavoro può servire anche il medico del lavoro.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Eczema e dermatite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/d/dermatite",
      lang: "it",
    },
    {
      publisher: "ISSalute",
      title: "Il nichel: effetti sulla salute",
      url: "https://www.issalute.it/index.php/stili-di-vita-e-ambiente-menu/ambiente/nichel",
      lang: "it",
    },
    { publisher: "NHS", title: "Contact dermatitis", url: "https://www.nhs.uk/conditions/contact-dermatitis/", lang: "en" },
    {
      publisher: "MedlinePlus",
      title: "Contact dermatitis",
      url: "https://medlineplus.gov/ency/article/000869.htm",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["rash-da-contatto", "chiazze-rosse", "prurito-pelle"],
    otherSymptoms: ["vescicole", "pelle-secca"],
    moreLikelyIf: [
      "Le chiazze sono proprio dove la pelle ha toccato un oggetto o un prodotto.",
      "Migliorano quando eviti quella sostanza, ad esempio in ferie.",
    ],
    lessLikelyIf: [
      "Le chiazze compaiono e scompaiono in poche ore in punti diversi: è più tipico dell'orticaria.",
      "Hai la pelle secca e pruriginosa fin da piccolo, soprattutto nelle pieghe: è più tipico della dermatite atopica.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
