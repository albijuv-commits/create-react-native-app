import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "psoriasi",
  name: "Psoriasi",
  aliases: ["psoriasi a placche", "artrite psoriasica", "placche sulla pelle"],
  areas: ["pelle"],
  bodyZones: ["pelle", "braccia", "gambe", "testa", "mani"],

  overview:
    "La psoriasi è una malattia infiammatoria cronica, non contagiosa, in cui la pelle si rinnova troppo in fretta e forma chiazze spesse, arrossate e coperte di squame argentee. Va e viene nel tempo: non esiste una cura definitiva, ma oggi ci sono trattamenti molto efficaci.",

  animation: {
    scene: "pelle",
    params: { variante: "psoriasi" },
    captions: [
      "La pelle si rinnova di continuo: le nuove cellule nascono in profondità e salgono verso la superficie in circa un mese.",
      "Nella psoriasi il sistema immunitario manda segnali sbagliati che accelerano questo ricambio fino a pochi giorni.",
      "Le cellule si accumulano in superficie e formano placche spesse con squame argentee; sotto, i vasi aumentano e la pelle si arrossa.",
      "Creme, fototerapia e farmaci che regolano il sistema immunitario rallentano il ricambio e spengono l'infiammazione.",
    ],
  },

  history: {
    nameOrigin:
      "Dal greco «psora», prurito. Per secoli la psoriasi è stata confusa con la lebbra, e chi ne soffriva veniva spesso allontanato.",
    events: [
      { when: "1808", text: "Il medico inglese Robert Willan pubblica la prima descrizione accurata della psoriasi." },
      { when: "1841", text: "Il dermatologo austriaco Ferdinand von Hebra la distingue definitivamente dalla lebbra." },
      {
        when: "Anni '70",
        text: "Si diffonde la fototerapia PUVA, che combina la luce ultravioletta con un farmaco che rende la pelle più sensibile alla luce.",
      },
      {
        when: "Anni 2000",
        text: "Arrivano i farmaci biologici, che bloccano in modo mirato i segnali del sistema immunitario: per molte persone la pelle torna quasi libera.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Alessandro, 34 anni: non solo la pelle",
      story:
        "Da qualche anno Alessandro ha chiazze spesse e squamose su gomiti, ginocchia e cuoio capelluto, che peggiorano nei periodi di stress. Al mattino ha anche dolore e rigidità alle dita. Il dermatologo conferma la psoriasi e lo invia dal reumatologo per i dolori: è un'artrite psoriasica. Con una terapia mirata migliorano sia la pelle sia le articolazioni.",
      lesson: "La psoriasi può coinvolgere anche le articolazioni: dolori e rigidità vanno sempre segnalati.",
    },
  ],

  causes: [
    "Un'alterazione del sistema immunitario che accelera il rinnovo della pelle.",
    "Una predisposizione genetica: spesso c'è un familiare con la psoriasi.",
  ],
  riskFactors: [
    "Stress.",
    "Fumo e alcol.",
    "Obesità.",
    "Infezioni, come il mal di gola da streptococco.",
    "Piccole ferite o graffi della pelle.",
    "Alcuni farmaci.",
  ],

  symptoms: {
    typical: [
      "Chiazze spesse e ben delimitate, rosse o rosa, con squame argentee",
      "Su gomiti, ginocchia, cuoio capelluto e parte bassa della schiena",
      "Prurito, bruciore o dolore",
    ],
    lessCommon: [
      "Unghie con puntini, ispessite o che si staccano",
      "Chiazze nelle pieghe della pelle",
      "Dolore, gonfiore e rigidità alle articolazioni (artrite psoriasica)",
      "Sulla pelle scura le chiazze possono apparire grigie o violacee",
    ],
  },

  treatments: {
    options: [
      {
        title: "Creme ed emollienti",
        text: "Creme idratanti, cortisonici e derivati della vitamina D da applicare sulla pelle sono la cura di base. Il medico ti spiega come usarli.",
      },
      {
        title: "Fototerapia",
        text: "Sedute di luce ultravioletta in centri specializzati, per le forme più estese.",
      },
      {
        title: "Farmaci sistemici",
        text: "Per le forme moderate o gravi il dermatologo può prescrivere farmaci per bocca o biologici, con controlli regolari.",
      },
      {
        title: "Attenzione a tutta la salute",
        text: "La psoriasi si associa più spesso ad altri disturbi: tieni d'occhio peso, pressione, umore e articolazioni.",
      },
    ],
    selfCare: [
      "Usa emollienti ogni giorno.",
      "Prova a ridurre stress, alcol e fumo.",
      "Mantieni un peso sano e fai attività fisica.",
      "Un po' di sole può aiutare, ma evita le scottature.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Pensi di avere la psoriasi.",
      "La cura non funziona o ti dà effetti indesiderati.",
      "Hai dolore, gonfiore o rigidità alle articolazioni che tornano.",
      "La psoriasi pesa sul tuo umore.",
    ],
    urgent: [
      "La pelle diventa rossa su gran parte del corpo, con brividi o febbre.",
      "Compaiono all'improvviso tante piccole bolle bianche piene di pus che si uniscono, con febbre o malessere.",
    ],
  },

  prevention: [
    "Non si può prevenire, ma puoi ridurre le riacutizzazioni evitando i tuoi fattori scatenanti.",
    "Non fumare.",
    "Limita l'alcol.",
    "Proteggi la pelle da graffi e ferite.",
  ],

  specialist: {
    id: "dermatologo",
    why: "Il dermatologo conferma la diagnosi e sceglie la cura in base all'estensione; se ci sono dolori articolari coinvolge il reumatologo.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Psoriasi",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/p/psoriasi",
      lang: "it",
    },
    { publisher: "NHS", title: "Psoriasis", url: "https://www.nhs.uk/conditions/psoriasis/", lang: "en" },
    { publisher: "MedlinePlus", title: "Psoriasis", url: "https://medlineplus.gov/psoriasis.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["placche-squamose", "prurito-pelle"],
    otherSymptoms: ["unghie-alterate", "rigidita", "chiazze-rosse"],
    moreLikelyIf: [
      "Le chiazze sono su gomiti, ginocchia o cuoio capelluto.",
      "Hanno bordi netti e squame argentee.",
      "Un familiare ha la psoriasi.",
    ],
    lessLikelyIf: [
      "Le chiazze compaiono e scompaiono in poche ore.",
      "La pelle è secca e pruriginosa soprattutto nelle pieghe, fin dall'infanzia.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
