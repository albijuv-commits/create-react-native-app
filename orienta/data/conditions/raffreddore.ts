import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "raffreddore",
  name: "Raffreddore",
  aliases: ["raffreddore comune", "infreddatura", "rinite virale"],
  areas: ["orl"],
  bodyZones: ["naso", "collo"],

  overview:
    "Il raffreddore è un'infezione leggera di naso e gola causata da virus, soprattutto dai rinovirus. I sintomi arrivano in modo graduale, in due o tre giorni, e di solito passano da soli in una o due settimane.",

  animation: {
    scene: "infezione-virale",
    params: { virus: "rinovirus", sede: "naso" },
    captions: [
      "Un rinovirus, minuscolo, arriva nel naso con le goccioline di uno starnuto o con le mani.",
      "Si aggancia alle cellule che rivestono il naso grazie alle proteine della sua superficie.",
      "Dentro le cellule si moltiplica: la mucosa si infiamma e produce più muco.",
      "Anticorpi e globuli bianchi eliminano il virus: in una o due settimane torni come prima.",
    ],
  },

  history: {
    nameOrigin:
      "«Raffreddore» viene da «raffreddare»: per secoli si è pensato che a farlo venire fosse il freddo. Il freddo può favorirlo, ma la causa sono i virus.",
    events: [
      {
        when: "1946",
        text: "Nel Regno Unito apre la Common Cold Unit, un centro dove volontari si espongono al raffreddore per studiarlo. Resta attivo fino al 1989.",
      },
      {
        when: "1956",
        text: "Il medico statunitense Winston Price isola per la prima volta un rinovirus, il virus più comune del raffreddore.",
      },
      {
        when: "1967-1968",
        text: "La virologa scozzese June Almeida fotografa al microscopio elettronico un virus del raffreddore con una «corona» di proteine: il suo gruppo propone il nome «coronavirus».",
      },
      {
        when: "Oggi",
        text: "Si conoscono più di 160 tipi di rinovirus: è uno dei motivi per cui non esiste un vaccino contro il raffreddore.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Marco, 34 anni: naso chiuso e un po' di pazienza",
      story:
        "Marco ha naso chiuso, starnuti e mal di gola da cinque giorni. Riposa, beve molto e fa lavaggi nasali con soluzione salina. Al decimo giorno i sintomi sono quasi spariti, ma resta una tosse leggera che passa nella settimana successiva.",
      lesson:
        "Il raffreddore guarisce da solo e gli antibiotici non servono. Una tosse lieve può durare qualche giorno in più; se supera le tre settimane va sentito il medico.",
    },
  ],

  causes: [
    "Più di 200 virus diversi, soprattutto i rinovirus; più di rado coronavirus stagionali e altri virus respiratori.",
    "Il contagio avviene con le goccioline di tosse e starnuti, o toccando mani e superfici contaminate e poi naso, occhi o bocca.",
  ],
  riskFactors: [
    "Essere un bambino piccolo: i bambini prendono molti più raffreddori degli adulti.",
    "Stare in ambienti chiusi e affollati come scuole, uffici e mezzi pubblici, soprattutto in autunno e inverno.",
    "Fumo, stress e poco sonno.",
    "Difese immunitarie indebolite da malattie o terapie.",
  ],

  symptoms: {
    typical: ["Naso chiuso o che cola", "Starnuti", "Mal di gola", "Voce rauca", "Tosse", "Stanchezza e malessere"],
    lessCommon: [
      "Febbre, di solito non alta",
      "Dolori muscolari",
      "Olfatto e gusto ridotti",
      "Senso di pressione alle orecchie e al viso",
    ],
  },

  treatments: {
    options: [
      { title: "Riposo e liquidi", text: "Riposa e bevi molto, ad esempio acqua, tisane o brodo." },
      {
        title: "Lavaggi nasali e vapore",
        text: "La soluzione salina e il vapore di una doccia calda aiutano a liberare il naso.",
      },
      {
        title: "Farmaci da banco per i sintomi",
        text: "Antidolorifici, antifebbrili e, per pochi giorni, decongestionanti nasali possono dare sollievo. Chiedi al farmacista quali sono adatti a te: alcuni non vanno bene per bambini, in gravidanza o con altre malattie.",
      },
      {
        title: "Niente antibiotici",
        text: "Gli antibiotici non funzionano contro i virus del raffreddore e non accelerano la guarigione.",
      },
    ],
    selfCare: [
      "Per il mal di gola possono aiutare bevande calde con limone e miele. Il miele non va dato ai bambini sotto i 12 mesi.",
      "Non dare acido acetilsalicilico (aspirina) a bambini e ragazzi sotto i 16 anni.",
      "Non fumare: peggiora i sintomi.",
      "Se hai la febbre o ti senti molto male, resta a casa per non contagiare gli altri.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "La febbre dura più di 3 giorni o è molto alta.",
      "I sintomi peggiorano, oppure non migliorano dopo 10 giorni.",
      "La tosse dura più di 3 settimane.",
      "Hai una malattia cronica, ad esempio diabete o malattie di cuore, polmoni o reni, oppure difese immunitarie basse.",
      "Sei preoccupato per un bambino, soprattutto se è molto piccolo.",
    ],
    urgent: [
      "Respiri con grande fatica o hai le labbra bluastre.",
      "Hai un dolore al petto improvviso.",
      "Un bambino è molto abbattuto, respira con fatica o non beve.",
    ],
  },

  prevention: [
    "Lavati spesso le mani con acqua e sapone.",
    "Non toccarti occhi, naso e bocca con le mani non lavate.",
    "Usa fazzoletti di carta e buttali subito; tossisci o starnutisci nel gomito.",
    "Non condividere asciugamani, bicchieri e posate con chi è raffreddato.",
  ],

  specialist: {
    id: "medico-di-base",
    why: "Il raffreddore si cura a casa. Il medico di base, o il pediatra per i bambini, serve se compaiono complicazioni come otite o sinusite, o se i sintomi non passano.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Raffreddore",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/r/raffreddore",
      lang: "it",
    },
    { publisher: "NHS", title: "Common cold", url: "https://www.nhs.uk/conditions/common-cold/", lang: "en" },
    { publisher: "MedlinePlus", title: "Common Cold", url: "https://medlineplus.gov/commoncold.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["naso-che-cola", "naso-chiuso", "starnuti", "mal-di-gola"],
    otherSymptoms: ["tosse-secca", "raucedine", "febbre", "stanchezza", "perdita-olfatto"],
    moreLikelyIf: [
      "I sintomi sono comparsi gradualmente, in 2-3 giorni.",
      "Riguardano soprattutto naso e gola.",
      "Riesci comunque a fare le tue attività.",
    ],
    lessLikelyIf: [
      "Febbre alta comparsa all'improvviso con dolori in tutto il corpo, più tipica dell'influenza.",
      "Prurito agli occhi e starnuti che tornano ogni anno nella stessa stagione, più tipici dell'allergia.",
      "Sintomi che durano più di 3 settimane.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
