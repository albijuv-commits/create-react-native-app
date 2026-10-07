import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "varicella",
  name: "Varicella",
  aliases: ["vaiolo acquaiolo", "virus varicella-zoster"],
  areas: ["pelle", "corpo"],
  bodyZones: ["pelle", "tutto-il-corpo"],

  overview:
    "La varicella è un'infezione molto contagiosa causata dal virus varicella-zoster, che colpisce soprattutto i bambini. Provoca febbre e un'eruzione di puntini che diventano vescicole pruriginose e poi croste, e di solito guarisce in una o due settimane; il virus però resta nascosto nei nervi e anni dopo può tornare come herpes zoster, il fuoco di Sant'Antonio.",

  animation: {
    scene: "herpes-latenza",
    params: { variante: "varicella" },
    captions: [
      "Il virus della varicella si prende respirando le goccioline di chi è malato o toccando il liquido delle vescicole.",
      "Si diffonde con il sangue e arriva alla pelle: compaiono puntini rossi che diventano vescicole e poi croste.",
      "Guarita la varicella, il virus non sparisce: risale lungo i nervi e si nasconde, inattivo, nei gangli vicino al midollo spinale.",
      "Anni dopo, se le difese si abbassano, può risvegliarsi e scendere lungo un nervo: nasce l'herpes zoster, una fascia di vescicole dolorose. I vaccini proteggono da entrambi.",
    ],
  },

  history: {
    nameOrigin:
      "«Varicella» è il diminutivo di «variola», il vaiolo: per secoli le due malattie sono state confuse. Il nome popolare «vaiolo acquaiolo» ricorda le vescicole piene di liquido.",
    events: [
      { when: "1767", text: "Il medico inglese William Heberden distingue chiaramente la varicella dal vaiolo." },
      {
        when: "Anni '50",
        text: "Il virologo statunitense Thomas Weller isola il virus e dimostra che varicella ed herpes zoster sono causati dallo stesso virus.",
      },
      { when: "1974", text: "Il ricercatore giapponese Michiaki Takahashi sviluppa il vaccino contro la varicella." },
      { when: "2017", text: "In Italia la vaccinazione contro la varicella diventa obbligatoria per i nati dal 2017." },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Leonardo, 4 anni: puntini ovunque",
      story:
        "Leonardo ha un po' di febbre e il giorno dopo compaiono puntini rossi su pancia e schiena, che diventano vescicole e prudono molto. Il pediatra conferma la varicella e consiglia liquidi, un antifebbrile adatto all'età e unghie corte. La mamma avvisa la zia incinta di stare lontana. Dopo una settimana le croste si sono formate tutte e Leonardo torna all'asilo.",
      lesson:
        "Nei bambini la varicella di solito è lieve, ma è pericolosa per neonati, donne in gravidanza e persone con difese basse: vanno protetti dal contagio.",
    },
  ],

  causes: [
    "Il virus varicella-zoster, della famiglia degli herpesvirus.",
    "Si trasmette con le goccioline di tosse e starnuti, anche solo stando nella stessa stanza, o toccando il liquido delle vescicole. Chi non ha mai avuto la varicella può prenderla anche da una persona con herpes zoster.",
    "Si è contagiosi da circa 2 giorni prima della comparsa dei puntini finché tutte le vescicole sono diventate croste.",
  ],
  riskFactors: [
    "Neonati.",
    "Adolescenti e adulti, in cui la malattia è spesso più forte.",
    "Gravidanza.",
    "Difese immunitarie basse.",
    "Non essere vaccinati e non aver mai avuto la varicella.",
  ],

  symptoms: {
    typical: [
      "Puntini rossi che diventano vescicole piene di liquido e poi croste, a ondate successive",
      "Prurito intenso",
      "Febbre",
      "Malessere e poco appetito",
    ],
    lessCommon: [
      "Vescicole in bocca o nelle zone intime",
      "Pelle intorno alle vescicole rossa, calda e dolente, se si infetta",
      "Tosse o fiato corto, soprattutto negli adulti",
    ],
  },

  treatments: {
    options: [
      {
        title: "Cure dei sintomi",
        text: "Liquidi, un antifebbrile adatto all'età e creme o lozioni rinfrescanti per il prurito. Chiedi al pediatra o al farmacista.",
      },
      {
        title: "Antistaminici per il prurito",
        text: "Possono aiutare a dormire meglio: chiedi al medico se sono adatti.",
      },
      {
        title: "Antivirali per chi è a rischio",
        text: "Per adulti, donne in gravidanza o persone con difese basse il medico può prescrivere un antivirale, da iniziare presto.",
      },
      {
        title: "Attenzione agli antinfiammatori",
        text: "Evita gli antinfiammatori come l'ibuprofene, se non è il medico a indicarli: possono favorire infezioni gravi della pelle.",
      },
    ],
    selfCare: [
      "Taglia le unghie ai bambini e, di notte, mettigli dei calzini sulle mani per non grattarsi.",
      "Vestiti con abiti leggeri di cotone.",
      "Non dare acido acetilsalicilico (aspirina) a bambini e ragazzi sotto i 16 anni.",
      "Resta a casa finché tutte le vescicole sono diventate croste, di solito 5 giorni dopo la comparsa dei puntini.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Non sei sicuro che sia varicella: telefona prima di andare dal medico, per non contagiare altre persone in sala d'attesa.",
      "Sei in gravidanza, allatti o hai difese basse e sei stato vicino a qualcuno con la varicella.",
      "Un neonato ha la varicella o è stato vicino a qualcuno che ce l'ha.",
      "La pelle intorno alle vescicole diventa rossa, calda e dolente.",
      "Il bambino beve poco o mostra segni di disidratazione.",
    ],
    urgent: [
      "Hai fiato corto, dolore al petto o tossisci sangue.",
      "Compaiono forte mal di testa, collo rigido, sonnolenza, confusione, difficoltà a camminare o convulsioni.",
      "Le vescicole si riempiono di sangue, o la pelle si arrossa in fretta su una zona ampia, con febbre alta.",
    ],
  },

  prevention: [
    "Il vaccino contro la varicella è gratuito ed è obbligatorio per i nati dal 2017; è consigliato anche a ragazzi e adulti che non hanno mai avuto la malattia.",
    "Durante la malattia stai lontano da neonati, donne in gravidanza e persone con difese basse.",
    "Con l'avanzare dell'età chiedi al medico del vaccino contro l'herpes zoster.",
  ],

  specialist: {
    id: "pediatra",
    why: "Per i bambini il pediatra, per gli adulti il medico di base. Telefona prima di andare in ambulatorio, per non contagiare altre persone.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Varicella",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/v/varicella",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Malattie prevenibili con i vaccini",
      url: "https://www.salute.gov.it/new/it/tema/vaccinazioni/malattie-prevenibili-con-i-vaccini/",
      lang: "it",
    },
    { publisher: "NHS", title: "Chickenpox", url: "https://www.nhs.uk/conditions/chickenpox/", lang: "en" },
    { publisher: "MedlinePlus", title: "Chickenpox", url: "https://medlineplus.gov/chickenpox.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["vescicole-diffuse", "prurito-pelle", "febbre"],
    otherSymptoms: ["malessere", "perdita-appetito", "stanchezza"],
    moreLikelyIf: [
      "Non hai mai avuto la varicella e non sei vaccinato.",
      "Nelle ultime tre settimane sei stato vicino a qualcuno con varicella o herpes zoster.",
      "Puntini, vescicole e croste ci sono nello stesso momento.",
    ],
    lessLikelyIf: [
      "Hai già avuto la varicella o hai fatto due dosi di vaccino.",
      "Le vescicole sono su una sola fascia, da un lato del corpo, con dolore bruciante: può essere herpes zoster.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
