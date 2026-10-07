import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "sinusite",
  name: "Sinusite",
  aliases: ["rinosinusite", "infiammazione dei seni nasali", "seni paranasali"],
  areas: ["orl", "testa"],
  bodyZones: ["naso", "testa"],

  overview:
    "La sinusite è l'infiammazione dei seni paranasali, piccole cavità piene d'aria dietro zigomi e fronte. Arriva spesso dopo un raffreddore, quando il muco non riesce più a uscire, e di solito guarisce da sola in due-quattro settimane.",

  animation: {
    scene: "seni-nasali",
    params: {},
    captions: [
      "I seni paranasali sono cavità piene d'aria dietro fronte e zigomi, collegate al naso da piccoli canali.",
      "Durante un raffreddore o un'allergia la mucosa che li riveste si gonfia e chiude i canali.",
      "Il muco resta intrappolato e preme sulle pareti: per questo senti peso e dolore al viso.",
      "Quando la mucosa si sgonfia, ad esempio con i lavaggi nasali, il muco defluisce e l'aria torna.",
    ],
  },

  history: {
    nameOrigin:
      "Dal latino «sinus», che significa cavità o piega, più il suffisso «-ite», che in medicina indica un'infiammazione.",
    events: [
      {
        when: "XV secolo",
        text: "Leonardo da Vinci disegna i seni mascellari nei suoi studi sull'anatomia del cranio.",
      },
      {
        when: "1651",
        text: "Il medico inglese Nathaniel Highmore descrive il seno mascellare, che da lui prende il nome di «antro di Highmore».",
      },
      {
        when: "Anni '70-'80",
        text: "In Austria Walter Messerklinger e Heinz Stammberger mettono a punto la chirurgia endoscopica funzionale dei seni, oggi usata per le sinusiti croniche.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Paolo, 41 anni: il dolore che aumenta chinandosi",
      story:
        "Dopo un raffreddore, Paolo ha il naso chiuso, muco verde e un dolore sordo agli zigomi che aumenta quando si china. In farmacia gli consigliano lavaggi nasali e un antidolorifico. Dopo dieci giorni sta meglio e in tre settimane è guarito.",
      lesson:
        "Di solito la sinusite è causata da virus e guarisce da sola. Un muco verde non significa che servano antibiotici.",
    },
  ],

  causes: [
    "Quasi sempre un'infezione virale, come un raffreddore o un'influenza, che fa gonfiare la mucosa.",
    "Più di rado batteri o funghi.",
    "Allergie, polipi nasali o una deviazione del setto che ostacolano il drenaggio del muco.",
  ],
  riskFactors: [
    "Rinite allergica e asma.",
    "Fumo, attivo o passivo.",
    "Polipi nasali o setto nasale deviato.",
    "Infezioni dei denti dell'arcata superiore.",
    "Difese immunitarie basse.",
  ],

  symptoms: {
    typical: [
      "Dolore, gonfiore e tensione attorno a zigomi, occhi o fronte, spesso peggiori quando ti chini",
      "Naso chiuso o che cola",
      "Muco denso, giallo o verde",
      "Olfatto ridotto",
      "Febbre",
    ],
    lessCommon: [
      "Mal di testa",
      "Mal di denti all'arcata superiore",
      "Alito cattivo",
      "Tosse",
      "Senso di pressione alle orecchie",
    ],
  },

  treatments: {
    options: [
      {
        title: "Lavaggi nasali",
        text: "La soluzione salina aiuta a sciogliere il muco e a liberare il naso. In farmacia trovi soluzioni pronte e dispositivi per i lavaggi.",
      },
      {
        title: "Antidolorifici",
        text: "Alleviano il dolore al viso e la febbre. Chiedi al farmacista quale è adatto a te.",
      },
      {
        title: "Spray nasali con cortisone",
        text: "Il medico può consigliarli per ridurre il gonfiore, soprattutto se c'è un'allergia o se i sintomi durano a lungo.",
      },
      {
        title: "Antibiotici, raramente",
        text: "Servono solo in alcuni casi di infezione batterica, e li decide il medico.",
      },
      {
        title: "Chirurgia per le forme croniche",
        text: "Se la sinusite dura mesi e non risponde alle cure, l'otorinolaringoiatra può proporre un intervento endoscopico per allargare i canali dei seni.",
      },
    ],
    selfCare: [
      "Riposa e bevi molto.",
      "Respira il vapore di una doccia calda.",
      "Evita il fumo e ciò che scatena le tue allergie.",
      "Non usare i decongestionanti nasali per più di qualche giorno: usati a lungo peggiorano il naso chiuso.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Non migliori dopo 3 settimane, oppure dopo 7 giorni di cure consigliate dal farmacista o dal medico.",
      "Le sinusiti tornano spesso.",
      "I sintomi riguardano un solo lato del viso e durano a lungo.",
      "Riguardano un bambino: senti il pediatra.",
    ],
    urgent: [
      "Gonfiore o rossore attorno a un occhio, palpebra che non si apre, vista doppia o ridotta.",
      "Mal di testa fortissimo, collo rigido o confusione.",
      "Ti senti molto male e gli antidolorifici non aiutano.",
    ],
  },

  prevention: [
    "Lavati spesso le mani per prendere meno raffreddori.",
    "Cura la rinite allergica, se ne soffri.",
    "Non fumare ed evita il fumo passivo.",
    "Mantieni l'aria di casa non troppo secca.",
  ],

  specialist: {
    id: "otorinolaringoiatra",
    why: "Se la sinusite dura più di 3 mesi, torna spesso o riguarda un solo lato, il medico di base può indirizzarti all'otorinolaringoiatra.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Sinusite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/s/sinusite",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Sinusitis (sinus infection)",
      url: "https://www.nhs.uk/conditions/sinusitis-sinus-infection/",
      lang: "en",
    },
    { publisher: "MedlinePlus", title: "Sinusitis", url: "https://medlineplus.gov/sinusitis.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["dolore-viso", "naso-chiuso", "muco-denso"],
    otherSymptoms: ["perdita-olfatto", "mal-di-testa", "febbre", "naso-che-cola", "tosse-secca"],
    moreLikelyIf: [
      "I sintomi sono iniziati durante o dopo un raffreddore.",
      "Il dolore al viso peggiora quando ti chini in avanti.",
    ],
    lessLikelyIf: [
      "Non hai il naso chiuso né muco.",
      "Il dolore è da un lato della testa, pulsante e con nausea: è più tipico dell'emicrania.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
