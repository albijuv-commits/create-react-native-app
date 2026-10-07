import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "colpo-di-calore",
  name: "Colpo di calore",
  aliases: ["insolazione", "ipertermia", "esaurimento da calore", "colpo di sole"],
  areas: ["corpo"],
  bodyZones: ["tutto-il-corpo", "testa"],

  overview:
    "Il colpo di calore è un'emergenza in cui il corpo, esposto a caldo intenso o a uno sforzo nel caldo, non riesce più a raffreddarsi e la temperatura sale oltre i 40 °C. Spesso è preceduto dall'esaurimento da calore, con sudore, debolezza e capogiri: raffreddare subito la persona e chiamare il 112 salva la vita.",

  animation: {
    scene: "termoregolazione",
    params: {},
    captions: [
      "Il corpo tiene la temperatura intorno ai 37 °C eliminando il calore in eccesso con il sudore e con i vasi della pelle.",
      "Con caldo intenso, umidità o sforzo, il corpo si scalda: i vasi si dilatano e si suda molto. Se si perdono troppi liquidi arriva l'esaurimento da calore.",
      "Se il raffreddamento non basta più, la temperatura supera i 40 °C e il cervello ne soffre: confusione, svenimento, convulsioni. È un colpo di calore: chiama il 112.",
      "Raffreddare subito la persona, all'ombra, bagnando pelle e vestiti con acqua fresca e facendo aria, abbassa la temperatura mentre arrivano i soccorsi.",
    ],
  },

  history: {
    nameOrigin:
      "Il nome descrive un «colpo» improvviso dovuto al calore. Si parla di insolazione quando la causa è l'esposizione diretta al sole.",
    events: [
      {
        when: "2003",
        text: "Un'ondata di calore eccezionale in Europa causa decine di migliaia di morti in più, soprattutto tra gli anziani.",
      },
      {
        when: "2004",
        text: "In Italia parte il sistema nazionale di allerta per le ondate di calore, con bollettini quotidiani per le principali città.",
      },
      {
        when: "Oggi",
        text: "Con il cambiamento climatico le ondate di calore sono più frequenti e intense. La medicina dello sport ha dimostrato che raffreddare subito la persona è la cura più efficace.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Riccardo, 22 anni: la corsa sotto il sole",
      story:
        "In una giornata afosa di luglio Riccardo corre una gara di 10 chilometri. Verso la fine barcolla, parla in modo confuso e ha la pelle bollente. Un volontario chiama il 112 e, con altri, lo porta all'ombra, gli versa addosso acqua fresca e gli fa aria. All'arrivo dei soccorsi la temperatura sta già scendendo; dopo una notte in ospedale si riprende.",
      lesson:
        "La confusione durante uno sforzo al caldo è un'emergenza. Raffreddare subito la persona mentre arrivano i soccorsi fa la differenza.",
    },
  ],

  causes: [
    "Esposizione prolungata a temperature alte, soprattutto con molta umidità.",
    "Sforzo fisico intenso al caldo.",
    "Disidratazione.",
    "Restare in un luogo chiuso e caldo, come un'auto al sole.",
  ],
  riskFactors: [
    "Anziani e bambini piccoli.",
    "Malattie croniche di cuore, polmoni o reni, e diabete.",
    "Alcuni farmaci, come i diuretici e alcuni psicofarmaci.",
    "Lavoro o sport all'aperto nelle ore più calde.",
    "Alcol.",
    "Vivere soli o in case molto calde, senza modo di rinfrescarsi.",
  ],

  symptoms: {
    typical: [
      "Temperatura del corpo molto alta, oltre i 40 °C",
      "Pelle molto calda, secca o sudata",
      "Confusione, agitazione, difficoltà a parlare",
      "Capogiri e svenimento",
    ],
    lessCommon: [
      "Prima, nell'esaurimento da calore: sudore abbondante, debolezza, nausea, crampi e mal di testa",
      "Respiro e battito accelerati",
      "Convulsioni",
    ],
  },

  treatments: {
    options: [
      {
        title: "Raffreddare subito",
        text: "Porta la persona all'ombra o al fresco, togli i vestiti in eccesso, bagnale la pelle con acqua fresca e fai aria. Metti impacchi freddi su collo, ascelle e inguine.",
      },
      {
        title: "Chiamare il 112",
        text: "Se c'è confusione o svenimento, o la persona non migliora entro mezz'ora, è un colpo di calore: serve l'ospedale.",
      },
      {
        title: "Liquidi, solo se è sveglia",
        text: "Se la persona è sveglia e riesce a deglutire, falle bere a piccoli sorsi acqua o una bevanda con sali.",
      },
      {
        title: "Niente antifebbrili",
        text: "Non servono: non è una febbre da infezione, e il corpo va raffreddato dall'esterno.",
      },
    ],
    selfCare: [
      "Non dare da bere a una persona incosciente o confusa che non riesce a deglutire.",
      "Resta con la persona finché non arrivano i soccorsi.",
      "Se perde conoscenza ma respira, mettila sul fianco in posizione laterale di sicurezza.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai avuto un esaurimento da calore e, anche se stai meglio, hai una malattia cronica o prendi farmaci che possono peggiorarlo.",
      "Dopo un episodio di calore ti senti debole o hai mal di testa per giorni.",
    ],
    urgent: [
      "La persona è confusa, agitata, parla in modo strano o perde conoscenza.",
      "Ha convulsioni.",
      "Ha la pelle bollente e una temperatura sopra i 40 °C.",
      "Non migliora dopo 30 minuti di riposo al fresco e liquidi.",
    ],
  },

  prevention: [
    "Durante le ondate di calore evita di uscire nelle ore più calde, di solito tra le 11 e le 18.",
    "Bevi spesso, anche senza sete.",
    "Indossa abiti leggeri e chiari e un cappello.",
    "Non lasciare mai bambini, anziani o animali in auto al sole, nemmeno per pochi minuti.",
    "Controlla i bollettini sulle ondate di calore e telefona spesso agli anziani che vivono soli.",
  ],

  specialist: {
    id: "pronto-soccorso",
    why: "Il colpo di calore è un'emergenza: chiama il 112. Per un esaurimento da calore lieve può bastare il medico di base.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Colpo di calore e insolazione",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/c/colpo-di-calore-e-insolazione",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Ondate di calore",
      url: "https://www.salute.gov.it/new/it/tema/ondate-di-calore/",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Heat exhaustion and heatstroke",
      url: "https://www.nhs.uk/conditions/heat-exhaustion-heatstroke/",
      lang: "en",
    },
    { publisher: "MedlinePlus", title: "Heat Illness", url: "https://medlineplus.gov/heatillness.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["pelle-calda", "confusione", "capogiri"],
    otherSymptoms: ["mal-di-testa", "nausea", "crampi-muscolari", "sudorazione", "stanchezza"],
    moreLikelyIf: [
      "Sei stato a lungo al caldo o hai fatto uno sforzo con temperature alte.",
      "La temperatura del corpo è molto alta senza segni di infezione.",
    ],
    lessLikelyIf: ["Non sei stato esposto al caldo.", "Hai febbre con tosse o mal di gola: è più tipico di un'infezione."],
    typicalUrgency: "er",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
