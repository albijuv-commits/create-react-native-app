import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "emicrania",
  name: "Emicrania",
  aliases: ["cefalea emicranica", "emicrania con aura", "mal di testa pulsante"],
  areas: ["testa"],
  bodyZones: ["testa", "occhi"],

  overview:
    "L'emicrania è un disturbo neurologico che si manifesta con attacchi di mal di testa intenso e pulsante, spesso da un lato, insieme a nausea e fastidio per luce e rumori. Gli attacchi durano da qualche ora a tre giorni: non si guarisce del tutto, ma le cure possono renderli meno forti e meno frequenti.",

  animation: {
    scene: "onda-emicrania",
    params: {},
    captions: [
      "Tra un attacco e l'altro il cervello funziona normalmente, ma è più sensibile a stimoli come stress, sonno irregolare o variazioni ormonali.",
      "In chi ha l'aura, un'onda lenta di attività elettrica attraversa la corteccia: è lei a causare lampi, linee a zig-zag o formicolii.",
      "Il nervo trigemino si attiva e libera sostanze come il CGRP, che infiammano i vasi delle meningi: il dolore pulsa.",
      "In ore o giorni l'attacco finisce e spesso lascia stanchezza. I farmaci specifici agiscono proprio su queste fasi.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «hemikrania», metà del cranio, perché il dolore colpisce spesso un solo lato della testa. Il termine fu reso popolare dal medico Galeno nel II secolo d.C.",
    events: [
      {
        when: "II secolo d.C.",
        text: "Il medico greco Areteo di Cappadocia descrive un mal di testa che colpisce metà del capo, con nausea e fastidio per la luce.",
      },
      {
        when: "1918",
        text: "Il chimico svizzero Arthur Stoll isola l'ergotamina, che dagli anni '20 diventa il primo farmaco specifico per l'attacco.",
      },
      {
        when: "1944",
        text: "Il neurofisiologo brasiliano Aristides Leão scopre l'onda di «depressione corticale diffusa», oggi ritenuta alla base dell'aura.",
      },
      { when: "Anni '90", text: "Arrivano i triptani, farmaci studiati apposta per interrompere l'attacco di emicrania." },
      {
        when: "2018",
        text: "Vengono approvati i primi anticorpi monoclonali contro il CGRP, la prima terapia preventiva nata apposta per l'emicrania.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Chiara, 31 anni: il diario che ha cambiato le cose",
      story:
        "Chiara ha attacchi di mal di testa pulsante a destra, con nausea, tre o quattro volte al mese, e prende antidolorifici quasi ogni giorno. Il neurologo le chiede di tenere un diario: gli attacchi arrivano nei giorni del ciclo e dopo le notti corte. Con una terapia preventiva, orari regolari e meno antidolorifici, gli attacchi si dimezzano.",
      lesson:
        "Prendere antidolorifici troppo spesso può aumentare il mal di testa. Un diario aiuta a riconoscere i fattori scatenanti e a scegliere la cura giusta.",
    },
    {
      kind: "illustrativo",
      title: "Antonio, 58 anni: non era la solita emicrania",
      story:
        "Antonio soffre di emicrania da anni. Una sera ha un mal di testa improvviso e fortissimo, il peggiore della sua vita e diverso dal solito. La moglie chiama il 112: in ospedale trovano un'emorragia cerebrale, curata in tempo.",
      lesson:
        "Un mal di testa improvviso e fortissimo, o molto diverso dal solito, è un'emergenza anche per chi soffre di emicrania.",
    },
  ],

  causes: [
    "Le cause precise non sono note: l'attacco nasce da cambiamenti nell'attività di nervi e vasi sanguigni del cervello.",
    "Conta molto la predisposizione genetica: spesso ne soffre anche un familiare stretto.",
  ],
  riskFactors: [
    "Essere donna: l'emicrania è da due a tre volte più frequente nelle donne.",
    "Ciclo mestruale e variazioni ormonali.",
    "Stress, ansia, stanchezza e sonno irregolare.",
    "Saltare i pasti o mangiare a orari irregolari.",
    "Troppa caffeina o alcol.",
    "Prendere antidolorifici troppo spesso.",
  ],

  symptoms: {
    typical: [
      "Mal di testa pulsante, da moderato a forte, spesso da un lato, che peggiora con il movimento",
      "Nausea o vomito",
      "Forte fastidio per luce e rumori",
    ],
    lessCommon: [
      "Aura prima del dolore: lampi, linee a zig-zag, formicolii o difficoltà a parlare, per meno di un'ora",
      "Nelle ore o nei giorni prima: stanchezza, sbadigli, voglia di certi cibi, sbalzi d'umore, collo rigido",
      "Stanchezza dopo l'attacco",
    ],
  },

  treatments: {
    options: [
      {
        title: "Antidolorifici e antinfiammatori",
        text: "Funzionano meglio se presi appena inizia il dolore. Chiedi al medico o al farmacista quale scegliere.",
      },
      {
        title: "Farmaci specifici per l'attacco",
        text: "Triptani e altri farmaci su prescrizione agiscono sui meccanismi dell'emicrania.",
      },
      { title: "Farmaci contro la nausea", text: "Il medico può prescriverli se la nausea è forte." },
      {
        title: "Terapia preventiva",
        text: "Se gli attacchi sono frequenti, il neurologo può proporre farmaci da prendere ogni giorno o anticorpi monoclonali, per ridurne numero e intensità.",
      },
      {
        title: "Tecniche di rilassamento",
        text: "Rilassamento, gestione dello stress e terapia cognitivo-comportamentale possono aiutare a prevenire gli attacchi.",
      },
    ],
    selfCare: [
      "Durante l'attacco riposa sdraiato in una stanza buia e silenziosa.",
      "Tieni un diario degli attacchi per scoprire i tuoi fattori scatenanti.",
      "Cerca di non prendere antidolorifici per più di 2 giorni a settimana: possono aumentare il mal di testa.",
      "Mangia e dormi a orari regolari, bevi a sufficienza e fai attività fisica.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Gli attacchi sono forti, peggiorano o durano più del solito.",
      "Hai attacchi più di una volta a settimana o fai fatica a tenerli sotto controllo.",
      "Un attacco dura più di 72 ore, o l'aura più di un'ora.",
      "Sei in gravidanza o hai appena partorito.",
    ],
    urgent: [
      "Mal di testa improvviso e fortissimo, il peggiore della tua vita.",
      "Difficoltà a parlare, viso storto, debolezza o formicolio a un braccio o a una gamba.",
      "Perdita della vista, vista doppia, confusione o sonnolenza.",
      "Febbre alta con collo rigido o macchie sulla pelle.",
      "Convulsioni, oppure mal di testa dopo un colpo alla testa.",
    ],
  },

  prevention: [
    "Riconosci ed evita i tuoi fattori scatenanti.",
    "Mantieni orari regolari per sonno e pasti.",
    "Fai attività fisica con regolarità.",
    "Limita caffeina e alcol.",
  ],

  specialist: {
    id: "neurologo",
    why: "Il neurologo, o un centro cefalee, conferma la diagnosi e imposta le terapie preventive se gli attacchi sono frequenti.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Emicrania",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/e/emicrania",
      lang: "it",
    },
    { publisher: "NHS", title: "Migraine", url: "https://www.nhs.uk/conditions/migraine/", lang: "en" },
    { publisher: "MedlinePlus", title: "Migraine", url: "https://medlineplus.gov/migraine.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["mal-di-testa-pulsante", "nausea", "fastidio-luce-rumori"],
    otherSymptoms: ["aura", "vomito", "mal-di-testa", "stanchezza"],
    moreLikelyIf: [
      "Hai già avuto attacchi simili in passato.",
      "Il dolore peggiora quando ti muovi e ti costringe a fermarti.",
      "Un familiare stretto soffre di emicrania.",
    ],
    lessLikelyIf: [
      "Il dolore stringe come una fascia su tutta la testa, senza nausea: è più tipico della cefalea tensiva.",
      "È il primo mal di testa così forte della tua vita: va valutato subito.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
