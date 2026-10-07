import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "disidratazione",
  name: "Disidratazione",
  aliases: ["carenza di liquidi", "poca acqua nel corpo"],
  areas: ["corpo"],
  bodyZones: ["tutto-il-corpo", "bocca"],

  overview:
    "La disidratazione si verifica quando il corpo perde più liquidi di quanti ne assume, ad esempio con caldo, febbre, vomito o diarrea. Dà sete, urine scure, bocca secca e capogiri: di solito si risolve bevendo, ma nei bambini piccoli e negli anziani può diventare seria in fretta.",

  animation: {
    scene: "bilancio-acqua",
    params: {},
    captions: [
      "Circa metà del nostro peso è acqua: ogni giorno ne perdiamo con sudore, urina e respiro, e la reintegriamo con bevande e cibi.",
      "Caldo, febbre, sport, vomito o diarrea aumentano le perdite: se non bevi abbastanza, il livello scende.",
      "Il corpo manda segnali: sete, bocca secca, urine scure e scarse, stanchezza e capogiri.",
      "Bevendo spesso a piccoli sorsi, e con le soluzioni reidratanti in caso di vomito e diarrea, il livello torna normale.",
    ],
  },

  history: {
    nameOrigin: "Dal prefisso «dis-», che indica una perdita, e dal greco «hydor», acqua.",
    events: [
      {
        when: "1831",
        text: "Durante l'epidemia di colera in Europa, il medico irlandese William O'Shaughnessy scopre che nel sangue dei malati mancano acqua e sali.",
      },
      {
        when: "1832",
        text: "Il medico scozzese Thomas Latta somministra per la prima volta una soluzione salina in vena a malati di colera.",
      },
      {
        when: "Anni '60-'70",
        text: "Viene messa a punto la soluzione di reidratazione orale, che l'Organizzazione mondiale della sanità e l'UNICEF diffondono in tutto il mondo.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Teresa, 84 anni: la confusione d'estate",
      story:
        "Durante un'ondata di calore, la figlia trova Teresa più confusa e assonnata del solito: beve pochissimo perché non sente la sete e ha le labbra secche. La figlia chiama il medico, che la visita e le consiglia di bere spesso a piccoli sorsi, tenendola sotto controllo. In due giorni Teresa torna quella di sempre.",
      lesson:
        "Gli anziani sentono meno la sete: d'estate bisogna offrire loro da bere spesso. La confusione può essere un segno di disidratazione.",
    },
  ],

  causes: [
    "Bere troppo poco, ad esempio quando si è malati o non si sente la sete.",
    "Perdite di liquidi con sudorazione, febbre, vomito o diarrea.",
    "Diabete non controllato, alcuni farmaci come i diuretici, alcol.",
  ],
  riskFactors: [
    "Neonati e bambini piccoli.",
    "Anziani, che sentono meno la sete.",
    "Malattie croniche come diabete o malattie dei reni.",
    "Attività fisica intensa o lavoro al caldo.",
    "Ondate di calore.",
  ],

  symptoms: {
    typical: ["Sete", "Urine scure, scarse e con odore forte", "Bocca, labbra e occhi secchi", "Stanchezza e capogiri"],
    lessCommon: [
      "Mal di testa",
      "Crampi muscolari",
      "Nei neonati: pochi pannolini bagnati, pianto senza lacrime, fontanella infossata",
      "Negli anziani: confusione e sonnolenza",
    ],
  },

  treatments: {
    options: [
      {
        title: "Bere spesso, a piccoli sorsi",
        text: "Soprattutto acqua; se c'è vomito o diarrea, le soluzioni reidratanti che trovi in farmacia.",
      },
      {
        title: "Neonati e bambini",
        text: "Continua il latte materno o artificiale e offri spesso da bere. Il pediatra ti dice se usare soluzioni reidratanti.",
      },
      { title: "Liquidi in vena", text: "Nei casi gravi si danno in ospedale." },
    ],
    selfCare: [
      "Bevi abbastanza da avere urine chiare durante il giorno.",
      "Se sei disidratato evita alcol e bibite molto zuccherate o gassate.",
      "Se vomiti, aspetta qualche minuto e poi riprova a bere a piccoli sorsi.",
      "Mangia frutta e verdura ricche di acqua.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "I sintomi non migliorano bevendo.",
      "Hai vomito o diarrea e non riesci a trattenere i liquidi.",
      "Un neonato o un bambino piccolo bagna pochi pannolini, è svogliato o beve poco.",
      "Una persona anziana è più confusa o assonnata del solito.",
    ],
    urgent: [
      "Hai capogiri forti, sei confuso o svieni.",
      "Non urini da molte ore.",
      "Il battito è molto accelerato e mani e piedi sono freddi e chiazzati.",
      "Un neonato è molto sonnolento, non risponde come al solito o ha la fontanella infossata.",
    ],
  },

  prevention: [
    "Bevi regolarmente durante la giornata, di più quando fa caldo o fai sport.",
    "Offri spesso da bere a bambini e anziani.",
    "Durante una gastroenterite comincia subito a bere a piccoli sorsi.",
    "Nelle ondate di calore stai al fresco nelle ore più calde.",
  ],

  specialist: {
    id: "medico-di-base",
    why: "Il medico di base, o il pediatra per i bambini, valuta i casi che non migliorano bevendo e la causa della perdita di liquidi.",
  },

  sources: [
    {
      publisher: "Ministero della Salute",
      title: "Ondate di calore: dieci consigli utili",
      url: "https://www.salute.gov.it/new/it/tema/ondate-di-calore/dieci-consigli-utili/",
      lang: "it",
    },
    { publisher: "NHS", title: "Dehydration", url: "https://www.nhs.uk/conditions/dehydration/", lang: "en" },
    { publisher: "MedlinePlus", title: "Dehydration", url: "https://medlineplus.gov/dehydration.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["sete-intensa", "bocca-secca", "urine-scure"],
    otherSymptoms: ["capogiri", "stanchezza", "mal-di-testa", "crampi-muscolari", "confusione"],
    moreLikelyIf: [
      "Hai avuto vomito, diarrea, febbre o hai sudato molto.",
      "Hai bevuto poco o fa molto caldo.",
    ],
    lessLikelyIf: ["Bevi tanto ma hai sempre sete e urini molto: va escluso il diabete."],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
