import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "otite",
  name: "Otite",
  aliases: ["mal d'orecchio", "otite media", "otite esterna", "infezione all'orecchio"],
  areas: ["orl"],
  bodyZones: ["orecchie"],

  overview:
    "L'otite è un'infiammazione dell'orecchio, spesso dovuta a un'infezione. La più comune è l'otite media, frequente nei bambini dopo un raffreddore: provoca dolore e a volte febbre, e di solito migliora da sola in circa tre giorni.",

  animation: {
    scene: "orecchio-medio",
    params: {},
    captions: [
      "Dietro il timpano c'è l'orecchio medio, una piccola cavità piena d'aria collegata alla gola dalla tromba di Eustachio.",
      "Durante un raffreddore la tromba di Eustachio si gonfia e si chiude: l'aria non passa più.",
      "Nell'orecchio medio si raccoglie liquido che virus o batteri possono infettare: il timpano, sotto pressione, fa male.",
      "Quando la tromba si riapre il liquido defluisce e il dolore passa, di solito in pochi giorni.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «ous, otós», orecchio, più il suffisso «-ite», infiammazione. La tromba di Eustachio prende il nome dall'anatomista italiano Bartolomeo Eustachi.",
    events: [
      {
        when: "XVI secolo",
        text: "Bartolomeo Eustachi descrive il canale che collega l'orecchio alla gola, oggi chiamato tromba di Eustachio.",
      },
      {
        when: "1954",
        text: "Il medico statunitense Beverly Armstrong introduce i moderni drenaggi transtimpanici, tubicini che aerano l'orecchio nelle otiti ricorrenti.",
      },
      {
        when: "2000",
        text: "Arriva il vaccino coniugato contro lo pneumococco, uno dei batteri più frequenti nelle otiti: oggi è nel calendario vaccinale dei neonati.",
      },
      {
        when: "Oggi",
        text: "Le linee guida suggeriscono spesso di attendere un paio di giorni prima degli antibiotici, perché molte otiti guariscono da sole.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Sofia, 3 anni: la notte del mal d'orecchio",
      story:
        "Dopo qualche giorno di raffreddore, Sofia si sveglia piangendo e si tocca l'orecchio; ha la febbre. Il pediatra la visita la mattina dopo: è un'otite media. Consiglia un antidolorifico adatto alla sua età e di aspettare 48 ore prima di decidere se serve l'antibiotico. Due giorni dopo Sofia sta già meglio.",
      lesson:
        "Molte otiti guariscono da sole e alleviare il dolore è la cosa più importante. Il pediatra decide se e quando servono gli antibiotici.",
    },
  ],

  causes: [
    "Otite media: virus o batteri che arrivano nell'orecchio medio, di solito durante un raffreddore.",
    "Otite esterna: infezione del condotto uditivo, spesso favorita dall'acqua (il cosiddetto orecchio del nuotatore), da piccole ferite o dall'eczema.",
  ],
  riskFactors: [
    "Età: i bambini piccoli hanno la tromba di Eustachio più corta.",
    "Raffreddori frequenti e frequenza dell'asilo.",
    "Fumo passivo.",
    "Uso del ciuccio dopo i 6 mesi.",
    "Nuoto e uso dei cotton fioc, per l'otite esterna.",
  ],

  symptoms: {
    typical: ["Dolore all'orecchio", "Febbre", "Udito ridotto o orecchio ovattato", "Senso di pressione nell'orecchio"],
    lessCommon: [
      "Liquido che esce dall'orecchio",
      "Prurito e pelle squamosa nel condotto, nell'otite esterna",
      "Nei bambini piccoli: si toccano o tirano l'orecchio, sono irritabili, mangiano poco, perdono l'equilibrio",
    ],
  },

  treatments: {
    options: [
      {
        title: "Antidolorifici",
        text: "Sono la cura più importante nei primi giorni. Chiedi al medico o al farmacista quale è adatto, soprattutto per i bambini.",
      },
      {
        title: "Gocce auricolari",
        text: "Per l'otite esterna il medico può prescrivere gocce antibiotiche, antifungine o con cortisone.",
      },
      {
        title: "Antibiotici, quando servono",
        text: "Per l'otite media il medico può decidere di aspettare due o tre giorni, oppure prescriverli subito, ad esempio ai bambini più piccoli o se i sintomi sono forti.",
      },
      {
        title: "Drenaggi transtimpanici",
        text: "Se le otiti tornano spesso o il liquido non se ne va, l'otorinolaringoiatra può proporre piccoli tubicini nel timpano.",
      },
    ],
    selfCare: [
      "Pulisci le secrezioni all'esterno con un batuffolo di cotone, senza inserire nulla nell'orecchio.",
      "Non usare i cotton fioc.",
      "Evita che acqua e shampoo entrino nell'orecchio e non nuotare finché non sei guarito.",
      "Decongestionanti e antistaminici non aiutano l'otite.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Il dolore non migliora dopo 3 giorni.",
      "Il bambino ha meno di 12 mesi, oppure ha dolore a entrambe le orecchie.",
      "Le otiti tornano spesso.",
      "Esce liquido dall'orecchio o senti meno di prima.",
      "Hai il diabete, difese basse o altre malattie croniche.",
    ],
    urgent: [
      "Gonfiore, rossore e dolore dietro l'orecchio, con il padiglione spinto in avanti.",
      "Febbre alta con collo rigido, forte mal di testa, sonnolenza o confusione.",
      "Forti capogiri, vomito, o metà del viso che non si muove.",
    ],
  },

  prevention: [
    "Fai fare ai bambini le vaccinazioni previste, compresa quella contro lo pneumococco.",
    "Tieni i bambini lontani dal fumo.",
    "Evita il ciuccio dopo i 6 mesi.",
    "Non mettere cotton fioc o dita nelle orecchie e quando nuoti usa tappi o cuffia.",
  ],

  specialist: {
    id: "otorinolaringoiatra",
    why: "Per una singola otite bastano il medico di base o il pediatra. L'otorinolaringoiatra serve per le otiti che tornano spesso o se l'udito resta ridotto.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Otite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/o/otite",
      lang: "it",
    },
    { publisher: "NHS", title: "Ear infections", url: "https://www.nhs.uk/conditions/ear-infections/", lang: "en" },
    { publisher: "MedlinePlus", title: "Ear Infections", url: "https://medlineplus.gov/earinfections.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["dolore-orecchio", "orecchio-ovattato"],
    otherSymptoms: ["febbre", "secrezione-orecchio", "naso-chiuso", "mal-di-gola"],
    moreLikelyIf: [
      "Il dolore è iniziato durante o dopo un raffreddore.",
      "Si tratta di un bambino piccolo che si tocca l'orecchio.",
      "Hai nuotato di recente e il dolore aumenta tirando il lobo: fa pensare all'otite esterna.",
    ],
    lessLikelyIf: [
      "Il dolore è davanti all'orecchio, nella mandibola, e peggiora masticando: può venire dall'articolazione della mandibola o dai denti.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
