import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "ipotiroidismo",
  name: "Ipotiroidismo",
  aliases: ["tiroide lenta", "tiroide pigra", "tiroidite di Hashimoto"],
  areas: ["corpo"],
  bodyZones: ["collo", "tutto-il-corpo"],

  overview:
    "L'ipotiroidismo è una condizione in cui la tiroide, la ghiandola alla base del collo, produce pochi ormoni: il metabolismo rallenta e compaiono stanchezza, freddo, aumento di peso e stitichezza. Si scopre con un semplice esame del sangue e si cura bene con un ormone che sostituisce quello mancante.",

  animation: {
    scene: "tiroide",
    params: {},
    captions: [
      "La tiroide, a forma di farfalla alla base del collo, produce ormoni che regolano il ritmo di tutto il corpo, guidata dall'ipofisi nel cervello.",
      "Nella causa più comune, la tiroidite di Hashimoto, il sistema immunitario attacca la tiroide e la danneggia poco a poco.",
      "Gli ormoni calano e il corpo rallenta; l'ipofisi alza il suo segnale, il TSH, che negli esami risulta alto.",
      "La terapia sostitutiva, prescritta e controllata dal medico, riporta gli ormoni a livelli normali.",
    ],
  },

  history: {
    nameOrigin:
      "«Tiroide» viene dal greco «thyreoeidés», a forma di scudo: il nome fu dato nel 1656 dall'anatomista inglese Thomas Wharton.",
    events: [
      {
        when: "1874",
        text: "Il medico inglese William Gull descrive un rallentamento generale in donne adulte, chiamato poco dopo «mixedema» da William Ord.",
      },
      {
        when: "1891",
        text: "George Murray cura per la prima volta il mixedema con un estratto di tiroide di pecora.",
      },
      { when: "1912", text: "Il medico giapponese Hakaru Hashimoto descrive la tiroidite che porta il suo nome." },
      {
        when: "1914",
        text: "Edward Kendall isola la tiroxina, l'ormone principale della tiroide; nel 1927 viene prodotta in laboratorio.",
      },
      {
        when: "2005",
        text: "In Italia una legge promuove il sale iodato per prevenire le malattie della tiroide da carenza di iodio.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Lucia, 47 anni: più freddo e più fatica",
      story:
        "Lucia ha sempre freddo, anche in casa, ha preso qualche chilo senza cambiare abitudini e si sente lenta e stanca. Il medico le prescrive gli esami della tiroide: il TSH è alto e gli anticorpi confermano una tiroidite di Hashimoto. Inizia la terapia sostitutiva e, con controlli periodici, in qualche mese ritrova le energie.",
      lesson:
        "Stanchezza, freddo e aumento di peso hanno molte cause: un esame del sangue chiarisce se c'entra la tiroide.",
    },
  ],

  causes: [
    "La tiroidite di Hashimoto, una malattia autoimmune, è la causa più comune.",
    "Interventi o radioterapia alla tiroide, e alcune cure per l'ipertiroidismo.",
    "Carenza di iodio nell'alimentazione.",
    "Alcuni farmaci.",
  ],
  riskFactors: [
    "Essere donna, soprattutto tra i 30 e i 50 anni.",
    "Familiari con malattie della tiroide.",
    "Altre malattie autoimmuni, come il diabete di tipo 1 o la celiachia.",
    "Gravidanza recente.",
    "Età avanzata.",
  ],

  symptoms: {
    typical: [
      "Stanchezza intensa",
      "Sentire più freddo del solito",
      "Aumento di peso",
      "Stitichezza",
      "Pelle secca, capelli secchi o che cadono",
    ],
    lessCommon: [
      "Difficoltà di concentrazione e di memoria",
      "Umore basso",
      "Voce rauca",
      "Mestruazioni irregolari o abbondanti",
      "Gonfiore alla base del collo (gozzo)",
    ],
  },

  treatments: {
    options: [
      {
        title: "Terapia sostitutiva",
        text: "Un ormone tiroideo da prendere ogni giorno, di solito per tutta la vita, che sostituisce quello mancante. Il medico lo prescrive e lo regola con esami del sangue periodici.",
      },
      {
        title: "Controlli regolari",
        text: "Gli esami del sangue servono a verificare che la terapia sia quella giusta, soprattutto all'inizio e in gravidanza.",
      },
      {
        title: "Attenzione alla gravidanza",
        text: "Se cerchi una gravidanza o sei incinta, avvisa il medico: spesso la terapia va adattata.",
      },
    ],
    selfCare: [
      "Prendi la terapia ogni giorno alla stessa ora, rispettando le indicazioni del medico sui pasti.",
      "Non sospendere e non cambiare la terapia da solo.",
      "Usa il sale iodato, in quantità moderate.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai stanchezza, freddo e aumento di peso che durano da tempo.",
      "Noti un gonfiore alla base del collo.",
      "Sei in terapia e compaiono nausea, mal di testa, insonnia o palpitazioni: potrebbe servire un aggiustamento.",
      "Stai cercando una gravidanza o sei incinta e hai problemi di tiroide.",
    ],
    urgent: [
      "Una persona con ipotiroidismo diventa molto sonnolenta, confusa e fredda al tatto e respira lentamente: è un'emergenza rara ma grave.",
    ],
  },

  prevention: [
    "Poco sale, ma iodato.",
    "Se hai familiari con malattie della tiroide, parlane con il medico.",
    "In gravidanza fai i controlli previsti.",
  ],

  specialist: {
    id: "endocrinologo",
    why: "Il medico di base fa la diagnosi e segue molti casi. L'endocrinologo serve per i casi complessi, in gravidanza o quando la terapia è difficile da regolare.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Ipotiroidismo",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/i/ipotiroidismo",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Underactive thyroid (hypothyroidism)",
      url: "https://www.nhs.uk/conditions/underactive-thyroid-hypothyroidism/",
      lang: "en",
    },
    { publisher: "MedlinePlus", title: "Hypothyroidism", url: "https://medlineplus.gov/hypothyroidism.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["stanchezza", "freddo-intolleranza", "aumento-peso"],
    otherSymptoms: ["stitichezza", "pelle-secca", "capelli-fragili", "umore-basso", "raucedine", "difficolta-concentrazione"],
    moreLikelyIf: [
      "I sintomi sono comparsi lentamente, nel corso di mesi.",
      "Sei donna, hai più di 30 anni o familiari con problemi di tiroide.",
    ],
    lessLikelyIf: [
      "Hai la febbre o i sintomi sono comparsi in pochi giorni.",
      "Hai perso peso, sudi molto e hai il cuore accelerato: è più tipico di una tiroide che lavora troppo.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
