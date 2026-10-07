import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "tendinite",
  name: "Tendinite",
  aliases: ["tendinopatia", "gomito del tennista", "epicondilite", "tendinite di Achille", "tendinite della spalla"],
  areas: ["muscoli"],
  bodyZones: ["spalle", "braccia", "mani", "gambe", "piedi"],

  overview:
    "La tendinite è l'infiammazione o il sovraccarico di un tendine, il cordone che collega un muscolo all'osso, spesso per movimenti ripetuti. Causa un dolore che peggiora con il movimento, soprattutto a spalla, gomito, polso, ginocchio o tallone; le forme lievi migliorano in due o tre settimane.",

  animation: {
    scene: "fibre",
    params: { tipo: "tendine" },
    captions: [
      "Il tendine collega il muscolo all'osso: è fatto di fibre di collagene parallele che trasmettono la forza.",
      "Movimenti ripetuti, sforzi improvvisi o una tecnica sbagliata creano piccole lesioni tra le fibre.",
      "Il tendine si ispessisce e si irrita: fa male quando lo usi e a volte si gonfia.",
      "Riposo relativo e poi esercizi di carico graduale aiutano le fibre a riorganizzarsi e a rinforzarsi.",
    ],
  },

  history: {
    nameOrigin:
      "«Tendine» è legato al verbo latino «tendere». Oggi i medici parlano spesso di «tendinopatia», perché nelle forme che durano a lungo conta più il logoramento delle fibre dell'infiammazione.",
    events: [
      {
        when: "1693",
        text: "L'anatomista fiammingo Philip Verheyen chiama «tendine d'Achille» il tendine del tallone, ricordando il punto debole dell'eroe greco.",
      },
      {
        when: "1873",
        text: "Il medico tedesco Ferdinand Runge descrive il dolore al gomito che pochi anni dopo verrà chiamato «gomito del tennista».",
      },
      {
        when: "Anni '90-2000",
        text: "Gli studi mostrano che nelle tendiniti di lunga durata c'è soprattutto un logoramento delle fibre: gli esercizi di carico graduale diventano una cura centrale.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Franco, 48 anni: il gomito dopo il trasloco",
      story:
        "Dopo un fine settimana passato a montare mobili e avvitare viti, Franco sente dolore sul lato esterno del gomito quando stringe la tazza del caffè. Riduce gli sforzi e per qualche giorno usa ghiaccio e una fascia; quando il dolore cala, segue gli esercizi consigliati dal fisioterapista. In un mese torna a giocare a tennis.",
      lesson:
        "Il dolore da sovraccarico va ascoltato: riposo relativo e poi esercizi graduali funzionano meglio dell'immobilità totale.",
    },
  ],

  causes: [
    "Movimenti ripetuti al lavoro, negli hobby o nello sport, come correre, saltare, lanciare o usare a lungo il mouse.",
    "Sforzi improvvisi e bruschi.",
    "Postura o tecnica sportiva scorrette.",
  ],
  riskFactors: [
    "Età: con gli anni i tendini diventano meno elastici.",
    "Sport praticato senza allenamento o riscaldamento.",
    "Lavori manuali ripetitivi.",
    "Diabete e alcune malattie reumatiche.",
    "Alcuni antibiotici della famiglia dei fluorochinoloni, che possono danneggiare i tendini.",
  ],

  symptoms: {
    typical: [
      "Dolore a un tendine che peggiora con il movimento",
      "Difficoltà a muovere l'articolazione",
      "Rigidità, soprattutto al mattino",
    ],
    lessCommon: [
      "Gonfiore, a volte con calore o rossore",
      "Sensazione di scricchiolio quando muovi il tendine",
      "Un dolore improvviso e fortissimo con uno schiocco può indicare la rottura del tendine",
    ],
  },

  treatments: {
    options: [
      {
        title: "Riposo e ghiaccio nei primi giorni",
        text: "Riduci i movimenti che fanno male e applica ghiaccio avvolto in un panno per brevi periodi.",
      },
      { title: "Supporto", text: "Una fascia elastica o un tutore morbido, da togliere prima di dormire." },
      { title: "Antidolorifici", text: "Per bocca o in gel. Chiedi al farmacista quale è adatto a te." },
      {
        title: "Fisioterapia ed esercizi di carico",
        text: "Sono la cura principale se il dolore dura: rinforzano il tendine in modo graduale.",
      },
      {
        title: "Infiltrazioni e chirurgia",
        text: "In casi selezionati il medico può proporre infiltrazioni; la chirurgia serve di rado, ad esempio per un tendine rotto.",
      },
    ],
    selfCare: [
      "Evita sollevamenti pesanti, prese forti e torsioni che peggiorano il dolore.",
      "Torna allo sport con gradualità.",
      "Appena il dolore lo permette, muovi l'articolazione per non farla irrigidire.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Il dolore non migliora in qualche settimana.",
      "Il dolore è forte o limita molto il movimento.",
      "La tendinite torna spesso.",
    ],
    urgent: [
      "Hai sentito uno schiocco con un dolore improvviso e fortissimo e non riesci a usare l'arto: il tendine potrebbe essersi rotto.",
      "L'articolazione è calda, rossa e gonfia e hai la febbre.",
    ],
  },

  prevention: [
    "Fai riscaldamento prima dell'attività e stretching dopo.",
    "Usa scarpe adatte e una tecnica corretta.",
    "Fai pause durante i lavori ripetitivi.",
    "Aumenta l'allenamento in modo graduale.",
  ],

  specialist: {
    id: "ortopedico",
    why: "Il medico di base gestisce le forme lievi. L'ortopedico o il fisiatra valutano le tendiniti che durano, tornano spesso o in cui si sospetta una rottura.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Tendinite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/t/tendinite",
      lang: "it",
    },
    { publisher: "NHS", title: "Tendonitis", url: "https://www.nhs.uk/conditions/tendonitis/", lang: "en" },
    { publisher: "MedlinePlus", title: "Tendinitis", url: "https://medlineplus.gov/tendinitis.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["dolore-tendine", "rigidita"],
    otherSymptoms: ["gonfiore-articolazione"],
    moreLikelyIf: [
      "Il dolore è comparso dopo movimenti ripetuti o dopo un aumento dell'attività.",
      "Peggiora quando usi quel muscolo e migliora a riposo.",
    ],
    lessLikelyIf: [
      "Il dolore è iniziato con una storta o una caduta: può essere una distorsione.",
      "Ti fanno male molte articolazioni insieme, con gonfiore e febbre.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
