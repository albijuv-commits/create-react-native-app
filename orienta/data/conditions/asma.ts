import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "asma",
  name: "Asma",
  aliases: ["asma bronchiale", "broncospasmo", "fischi al petto"],
  areas: ["respiro"],
  bodyZones: ["petto"],

  overview:
    "L'asma è una malattia cronica dei bronchi, che sono infiammati e reagiscono in modo eccessivo a stimoli come allergeni, fumo, aria fredda o sforzo. I bronchi si restringono e compaiono fischi, tosse, fiato corto e petto stretto: con le cure giuste la maggior parte delle persone vive senza limitazioni.",

  animation: {
    scene: "bronchi",
    params: { variante: "asma" },
    captions: [
      "Un bronco sano è un tubo aperto, circondato da un sottile anello di muscolo.",
      "Nell'asma il rivestimento è infiammato e, a contatto con un fattore scatenante come polline, fumo o aria fredda, si gonfia ancora di più.",
      "Il muscolo si contrae e si forma muco: il passaggio dell'aria si restringe e il respiro fischia.",
      "Il farmaco di sollievo rilassa il muscolo e riapre il bronco; la terapia di fondo spegne l'infiammazione nel tempo.",
    ],
  },

  history: {
    nameOrigin: "Dal greco «asthma», affanno: la parola compare già negli scritti attribuiti a Ippocrate.",
    events: [
      {
        when: "1190",
        text: "Il medico e filosofo Mosè Maimonide scrive un trattato sull'asma per il figlio del sultano Saladino, con consigli su aria, alimentazione e sonno.",
      },
      {
        when: "1860",
        text: "Il medico inglese Henry Hyde Salter, lui stesso asmatico, descrive la contrazione dei bronchi e i fattori che scatenano le crisi.",
      },
      {
        when: "1956",
        text: "Nasce il primo inalatore predosato tascabile, che porta il farmaco direttamente nei bronchi.",
      },
      { when: "1969", text: "Arriva il salbutamolo, un broncodilatatore rapido e più mirato dei precedenti." },
      {
        when: "1972",
        text: "Vengono introdotti i cortisonici da inalare, che curano l'infiammazione alla base dell'asma.",
      },
      { when: "Anni 2000", text: "Arrivano i farmaci biologici per l'asma grave." },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Irene, 19 anni: la tosse di notte e in palestra",
      story:
        "Da qualche mese Irene tossisce di notte e, quando corre, sente il petto stretto e un sibilo. Il medico le fa fare una spirometria: è asma. Le prescrive un inalatore da usare con regolarità e prepara con lei un piano d'azione scritto per i momenti di crisi. Ora Irene si allena senza problemi.",
      lesson:
        "Tosse notturna e fischi sotto sforzo possono essere asma. Con la terapia giusta, usata nel modo corretto, si può fare sport e vivere senza limitazioni.",
    },
  ],

  causes: [
    "Un'infiammazione cronica dei bronchi, che li rende troppo reattivi; le cause precise non sono del tutto note.",
    "Fattori scatenanti: pollini, acari, muffe e peli di animali, infezioni respiratorie, fumo, inquinamento, aria fredda, sforzo fisico, alcune sostanze al lavoro.",
  ],
  riskFactors: [
    "Allergie, dermatite atopica o rinite allergica.",
    "Familiari con asma o allergie.",
    "Nascita prematura o basso peso alla nascita.",
    "Esposizione al fumo da bambini.",
    "Sovrappeso.",
    "Alcuni farmaci, come aspirina, antinfiammatori o betabloccanti, possono scatenare crisi in alcune persone.",
  ],

  symptoms: {
    typical: [
      "Respiro sibilante, con un fischio",
      "Tosse, spesso di notte o al mattino presto",
      "Fiato corto",
      "Petto stretto",
    ],
    lessCommon: [
      "Sintomi solo durante o dopo lo sforzo",
      "Risvegli notturni per la tosse",
      "Peggioramento durante i raffreddori o nella stagione dei pollini",
    ],
  },

  treatments: {
    options: [
      {
        title: "Inalatori di fondo",
        text: "Contengono di solito un cortisonico che spegne l'infiammazione. Si usano con regolarità, anche quando stai bene, secondo le indicazioni del medico.",
      },
      {
        title: "Inalatori di sollievo",
        text: "Aprono rapidamente i bronchi quando hai sintomi. Il medico ti dice quale usare e quando.",
      },
      {
        title: "Piano d'azione scritto",
        text: "Un foglio preparato con il medico che spiega cosa fare ogni giorno e come riconoscere e gestire una crisi.",
      },
      {
        title: "Altre terapie",
        text: "Se gli inalatori non bastano: compresse e, per l'asma grave, farmaci biologici prescritti dallo specialista.",
      },
    ],
    selfCare: [
      "Porta sempre con te l'inalatore di sollievo.",
      "Chiedi al medico, all'infermiere o al farmacista di controllare come usi l'inalatore: gli errori sono frequenti.",
      "Evita i tuoi fattori scatenanti e non fumare.",
      "Fai attività fisica regolare, chiedendo al medico come farla in sicurezza.",
      "Durante una crisi siediti con la schiena dritta, cerca di restare calmo e usa il farmaco di sollievo come indicato nel tuo piano.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai sintomi che potrebbero essere asma.",
      "Usi l'inalatore di sollievo più spesso del solito.",
      "I sintomi ti svegliano di notte o limitano le tue attività.",
      "Hai avuto una crisi, anche se ora stai meglio: fatti rivedere entro un paio di giorni.",
    ],
    urgent: [
      "Durante una crisi peggiori, o non migliori dopo aver usato il farmaco di sollievo come previsto dal tuo piano.",
      "Il respiro è difficile e non hai con te l'inalatore.",
      "Per la mancanza di fiato fai fatica a parlare, camminare o mangiare.",
      "Labbra o dita diventano bluastre, oppure sei molto stanco, confuso o sonnolento.",
    ],
  },

  prevention: [
    "Non fumare ed evita il fumo passivo, soprattutto vicino ai bambini.",
    "Riduci il contatto con gli allergeni a cui sei sensibile.",
    "Vaccinati contro l'influenza e, se consigliato, contro lo pneumococco.",
    "Fai controlli regolari, almeno una volta all'anno.",
  ],

  specialist: {
    id: "pneumologo",
    why: "Il pneumologo conferma la diagnosi con la spirometria e segue l'asma difficile da controllare; l'allergologo cerca le allergie che la scatenano.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Asma",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/a/asma",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Asma bronchiale",
      url: "https://www.salute.gov.it/new/it/scheda-malattia/asma-bronchiale/",
      lang: "it",
    },
    { publisher: "NHS", title: "Asthma", url: "https://www.nhs.uk/conditions/asthma/", lang: "en" },
    { publisher: "MedlinePlus", title: "Asthma", url: "https://medlineplus.gov/asthma.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["respiro-sibilante", "fiato-corto", "petto-costretto", "tosse-secca"],
    otherSymptoms: ["risvegli-notturni"],
    moreLikelyIf: [
      "I sintomi vanno e vengono e peggiorano di notte o al mattino presto.",
      "Compaiono con lo sforzo, l'aria fredda, il fumo o gli allergeni.",
      "Hai allergie o familiari con asma.",
    ],
    lessLikelyIf: [
      "Hai febbre alta e catarro da pochi giorni: può essere un'infezione.",
      "Il fiato corto è comparso all'improvviso con dolore al petto: serve aiuto subito.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
