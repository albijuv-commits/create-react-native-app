import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "distorsione",
  name: "Distorsione",
  aliases: ["storta", "slogatura", "distorsione della caviglia", "stiramento", "strappo muscolare"],
  areas: ["muscoli"],
  bodyZones: ["piedi", "mani", "gambe"],

  overview:
    "La distorsione è una lesione dei legamenti, le fasce che tengono unite le ossa di un'articolazione, causata da un movimento brusco o da una torsione, come una storta alla caviglia. Provoca dolore, gonfiore e lividi: la maggior parte guarisce in poche settimane con riposo, ghiaccio e un ritorno graduale al movimento.",

  animation: {
    scene: "fibre",
    params: { tipo: "legamento" },
    captions: [
      "Un legamento è fatto di fibre robuste e parallele che tengono unite due ossa.",
      "Una torsione improvvisa, come una storta, stira le fibre oltre il loro limite: alcune si sfilacciano o si rompono.",
      "Dai piccoli vasi lesionati escono sangue e liquido: compaiono gonfiore, livido e dolore.",
      "Nelle settimane successive il corpo produce nuove fibre: protezione, ghiaccio e poi un movimento graduale aiutano a guarire bene.",
    ],
  },

  history: {
    nameOrigin: "Dal latino «distorquere», torcere: la lesione nasce da una torsione dell'articolazione.",
    events: [
      {
        when: "1978",
        text: "Il medico statunitense Gabe Mirkin propone l'acronimo RICE (in inglese riposo, ghiaccio, compressione, elevazione) per le lesioni sportive.",
      },
      {
        when: "1992",
        text: "Il medico canadese Ian Stiell pubblica le «regole di Ottawa» per la caviglia: pochi controlli per capire quando serve una radiografia.",
      },
      {
        when: "Anni 2010",
        text: "Si dà più importanza al movimento precoce e graduale, e lo stesso Mirkin ridimensiona il ruolo del ghiaccio.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Elisa, 26 anni: la storta durante la partita",
      story:
        "Giocando a pallavolo, Elisa atterra male e si gira la caviglia. Riesce a fare qualche passo, ma la caviglia si gonfia e diventa viola. Per due o tre giorni la protegge, la tiene a riposo e sollevata, con ghiaccio e una fascia, poi ricomincia a muoversi. Dopo tre settimane cammina normalmente; torna in campo dopo un periodo di esercizi di equilibrio.",
      lesson:
        "Quasi tutte le storte guariscono senza interventi. Se non riesci a caricare il peso o hai sentito un crac, serve una visita per escludere una frattura.",
    },
  ],

  causes: [
    "Una torsione o un movimento brusco dell'articolazione, ad esempio appoggiando male il piede.",
    "Cadute, soprattutto sulle mani.",
    "Sport con salti e cambi di direzione.",
  ],
  riskFactors: [
    "Non fare riscaldamento prima dello sport.",
    "Muscoli stanchi.",
    "Scarpe non adatte o terreni irregolari.",
    "Distorsioni precedenti nella stessa articolazione.",
  ],

  symptoms: {
    typical: [
      "Dolore e sensibilità al tocco intorno all'articolazione, spesso caviglia, polso, pollice o ginocchio",
      "Gonfiore",
      "Livido",
      "Difficoltà a caricare il peso o a usare l'articolazione",
    ],
    lessCommon: ["Senso di instabilità", "Crampi o spasmi dei muscoli vicini", "Rigidità nei giorni successivi"],
  },

  treatments: {
    options: [
      {
        title: "Nei primi 2-3 giorni",
        text: "Proteggi la parte e tienila a riposo, applica ghiaccio avvolto in un panno per brevi periodi, usa una fascia elastica e tieni l'arto sollevato.",
      },
      {
        title: "Antidolorifici",
        text: "Per bocca o in gel da applicare sulla pelle. Chiedi al farmacista quale è adatto a te.",
      },
      {
        title: "Movimento graduale",
        text: "Appena il dolore lo permette, muovi l'articolazione per evitare che si irrigidisca. Evita lo sport intenso per alcune settimane.",
      },
      { title: "Fisioterapia", text: "Aiuta se la guarigione è lenta o se le storte si ripetono." },
    ],
    selfCare: [
      "Nei primi giorni evita calore, alcol e massaggi sulla zona: aumentano il gonfiore.",
      "Togli la fascia prima di dormire.",
      "Riprendi lo sport solo quando l'articolazione è stabile e non fa più male.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Il dolore è forte o peggiora.",
      "Gonfiore o livido sono molto estesi o aumentano.",
      "Non riesci a caricare il peso o a fare più di pochi passi.",
      "Dopo qualche giorno di cure a casa non migliori.",
    ],
    urgent: [
      "Al momento del trauma hai sentito un crac.",
      "La parte ha cambiato forma o è piegata in modo strano.",
      "La zona è intorpidita, formicola, è fredda o di colore bluastro o grigio.",
    ],
  },

  prevention: [
    "Fai riscaldamento prima dello sport e stretching dopo.",
    "Usa scarpe adatte.",
    "Allena equilibrio e forza, soprattutto dopo una distorsione.",
    "Non fare sport quando sei molto stanco.",
  ],

  specialist: {
    id: "ortopedico",
    why: "Il medico di base o il pronto soccorso valutano se serve una radiografia. L'ortopedico segue le distorsioni gravi o che si ripetono; il fisiatra la riabilitazione.",
  },

  sources: [
    { publisher: "NHS", title: "Sprains and strains", url: "https://www.nhs.uk/conditions/sprains-and-strains/", lang: "en" },
    {
      publisher: "MedlinePlus",
      title: "Sprains and Strains",
      url: "https://medlineplus.gov/sprainsandstrains.html",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["dolore-dopo-trauma", "gonfiore-articolazione"],
    otherSymptoms: ["livido", "difficolta-carico"],
    moreLikelyIf: ["Il dolore è iniziato con una storta o una caduta.", "Riesci comunque a fare qualche passo."],
    lessLikelyIf: [
      "Hai sentito un crac e la parte è deformata: può essere una frattura.",
      "L'articolazione si è gonfiata senza alcun trauma, magari con febbre.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
