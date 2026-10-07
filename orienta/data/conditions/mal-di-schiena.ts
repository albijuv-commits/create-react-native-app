import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "mal-di-schiena",
  name: "Mal di schiena",
  aliases: ["lombalgia", "colpo della strega", "sciatica", "dolore lombare", "lombosciatalgia"],
  areas: ["muscoli"],
  bodyZones: ["schiena-bassa", "schiena-alta", "gambe"],

  overview:
    "Il mal di schiena, soprattutto nella parte bassa, è uno dei disturbi più comuni: quasi sempre non dipende da una malattia grave ma da muscoli, legamenti e articolazioni affaticati o stirati. Di solito migliora in poche settimane, e restare attivi aiuta più del riposo a letto.",

  animation: {
    scene: "corpo",
    params: { zone: ["schiena-bassa"], vista: "retro" },
    captions: [
      "La parte bassa della schiena sostiene gran parte del peso del corpo e lavora a ogni movimento.",
      "Un movimento brusco, un sollevamento sbagliato o una postura mantenuta a lungo affaticano muscoli e legamenti: il dolore si accende.",
      "I muscoli intorno si contraggono per proteggere la zona e la schiena si irrigidisce. A volte un nervo irritato porta il dolore lungo la gamba.",
      "Restare attivi, muoversi con gradualità e fare esercizi mirati aiuta il dolore a spegnersi, di solito in poche settimane.",
    ],
  },

  history: {
    nameOrigin:
      "«Lombalgia» viene dal latino «lumbus», lombo, e dal greco «algos», dolore. Il nome popolare «colpo della strega» indica il dolore improvviso che blocca la schiena, come per un incantesimo.",
    events: [
      {
        when: "Antica Grecia",
        text: "Ippocrate descrive la sciatica e propone di trattare alcuni disturbi della colonna con la trazione.",
      },
      {
        when: "1934",
        text: "I chirurghi statunitensi William Mixter e Joseph Barr dimostrano che un'ernia del disco può comprimere un nervo e causare la sciatica.",
      },
      {
        when: "Anni '90",
        text: "Gli studi mostrano che nel mal di schiena comune restare attivi funziona meglio del riposo a letto, e le linee guida cambiano.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Daniele, 38 anni: il colpo della strega",
      story:
        "Sollevando una cassa di bottiglie, Daniele sente una fitta nella parte bassa della schiena e resta piegato. Il medico lo visita, esclude segnali d'allarme e gli consiglia di restare attivo, camminare un po' ogni giorno e usare un antidolorifico per qualche giorno. Dopo due settimane il dolore è quasi sparito e, con il fisioterapista, impara esercizi per rinforzare la schiena.",
      lesson:
        "Il mal di schiena acuto comune passa quasi sempre da solo. Restare a letto a lungo rallenta la guarigione.",
    },
  ],

  causes: [
    "Stiramento o affaticamento di muscoli e legamenti, la causa più comune.",
    "Ernia del disco o artrosi della colonna, che possono irritare un nervo.",
    "Molto raramente fratture, infezioni o tumori.",
  ],
  riskFactors: [
    "Sollevare pesi nel modo sbagliato.",
    "Restare a lungo seduti o nella stessa posizione.",
    "Poca attività fisica e muscoli deboli.",
    "Sovrappeso.",
    "Fumo.",
    "Stress e umore basso, che possono rendere il dolore più persistente.",
  ],

  symptoms: {
    typical: [
      "Dolore nella parte bassa della schiena, a volte comparso all'improvviso",
      "Rigidità e difficoltà a piegarsi o a stare dritti",
      "Dolore che peggiora con certi movimenti e migliora con altri",
    ],
    lessCommon: [
      "Dolore che scende lungo una gamba fino al piede (sciatica)",
      "Formicolio o intorpidimento alla gamba",
      "Spasmi muscolari",
    ],
  },

  treatments: {
    options: [
      {
        title: "Restare attivi",
        text: "Continua, per quanto puoi, le attività di tutti i giorni: camminare, nuotare, fare yoga o pilates aiuta.",
      },
      {
        title: "Antidolorifici e antinfiammatori",
        text: "Per qualche giorno possono aiutarti a muoverti. Chiedi al farmacista o al medico quale è adatto a te.",
      },
      { title: "Caldo o freddo", text: "Un impacco caldo o freddo può alleviare il dolore." },
      {
        title: "Fisioterapia ed esercizi",
        text: "Se il dolore non migliora in qualche settimana, il fisioterapista propone esercizi e terapie manuali.",
      },
      {
        title: "Terapia cognitivo-comportamentale",
        text: "Aiuta a gestire il dolore che dura a lungo.",
      },
      {
        title: "Chirurgia, raramente",
        text: "Si valuta per alcune ernie del disco che non migliorano con le altre cure.",
      },
    ],
    selfCare: [
      "Non restare a letto a lungo: muoviti con gradualità.",
      "Quando sollevi un peso piega le ginocchia e tienilo vicino al corpo.",
      "Se lavori seduto, alzati e muoviti spesso.",
      "Fai esercizi di stretching e rinforzo, fermandoti se il dolore aumenta.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Il dolore non migliora dopo qualche settimana di cure a casa.",
      "Ti impedisce le attività di tutti i giorni o ti preoccupa.",
      "Perdi peso senza motivo.",
      "Il dolore peggiora di notte o non passa con il riposo.",
      "Il dolore è nella parte alta della schiena, tra le scapole.",
    ],
    urgent: [
      "Formicolio, debolezza o intorpidimento a entrambe le gambe.",
      "Perdi sensibilità intorno ai genitali o all'ano, fai fatica a urinare o non trattieni urina o feci.",
      "Il mal di schiena è accompagnato da dolore al petto.",
      "Il dolore è iniziato dopo un incidente o una caduta importante.",
      "Hai febbre e brividi, oppure un dolore fortissimo comparso all'improvviso che peggiora in fretta.",
    ],
  },

  prevention: [
    "Fai attività fisica regolare per rinforzare schiena e addome.",
    "Mantieni un peso sano.",
    "Solleva i pesi nel modo giusto.",
    "Cura la postura e fai pause se stai seduto a lungo.",
  ],

  specialist: {
    id: "fisiatra",
    why: "Il primo riferimento è il medico di base. Il fisiatra imposta riabilitazione ed esercizi per il dolore che dura; l'ortopedico valuta i casi in cui potrebbe servire un intervento.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Mal di schiena",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/m/mal-di-schiena",
      lang: "it",
    },
    { publisher: "NHS", title: "Back pain", url: "https://www.nhs.uk/conditions/back-pain/", lang: "en" },
    { publisher: "MedlinePlus", title: "Back Pain", url: "https://medlineplus.gov/backpain.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["mal-di-schiena", "rigidita"],
    otherSymptoms: ["dolore-gamba-irradiato", "formicolii"],
    moreLikelyIf: [
      "Il dolore è iniziato dopo uno sforzo, un sollevamento o un movimento brusco.",
      "Peggiora con alcuni movimenti e migliora con altri.",
    ],
    lessLikelyIf: [
      "Hai febbre, perdi peso senza motivo o il dolore non cambia mai con il movimento: servono accertamenti.",
      "Il dolore è al fianco e hai bruciore quando urini: può venire dal rene.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
