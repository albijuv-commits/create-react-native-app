import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "congiuntivite",
  name: "Congiuntivite",
  aliases: ["occhio rosso", "occhi rossi", "congiuntivite allergica"],
  areas: ["orl"],
  bodyZones: ["occhi"],

  overview:
    "La congiuntivite è l'infiammazione della congiuntiva, la membrana sottile e trasparente che riveste il bianco dell'occhio e l'interno delle palpebre. Può essere causata da virus, batteri o allergie e di solito guarisce da sola in una o due settimane.",

  animation: {
    scene: "infiammazione",
    params: { tessuto: "occhio" },
    captions: [
      "La congiuntiva è una membrana sottilissima, attraversata da minuscoli vasi sanguigni.",
      "Un virus, un batterio o un allergene come il polline la irrita.",
      "I vasi si dilatano e lasciano uscire liquido: l'occhio diventa rosso, lacrima e brucia.",
      "I globuli bianchi eliminano la causa e in una o due settimane la congiuntiva torna normale.",
    ],
  },

  history: {
    nameOrigin:
      "La congiuntiva deve il nome al latino «coniungere», unire: è la membrana che unisce le palpebre al bulbo dell'occhio.",
    events: [
      {
        when: "Antico Egitto",
        text: "Il papiro Ebers, scritto intorno al 1550 a.C., descrive già malattie degli occhi con arrossamento e secrezioni.",
      },
      {
        when: "1881",
        text: "Il ginecologo tedesco Carl Credé introduce le gocce di nitrato d'argento negli occhi dei neonati: le congiuntiviti gravi alla nascita calano drasticamente.",
      },
      {
        when: "1969",
        text: "In Ghana scoppia un'epidemia di congiuntivite emorragica soprannominata «malattia dell'Apollo», perché coincide con lo sbarco sulla Luna.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Elena, 6 anni: occhi incollati al risveglio",
      story:
        "Elena si sveglia con gli occhi arrossati e le ciglia incollate da una secrezione giallastra. La mamma le pulisce le palpebre con acqua bollita e raffreddata, usando un dischetto diverso per ogni occhio. Il pediatra conferma una congiuntivite batterica e prescrive un collirio. In pochi giorni passa, e il fratellino non si contagia grazie al lavaggio delle mani e agli asciugamani separati.",
      lesson:
        "Mani pulite e oggetti personali separati evitano il contagio. Il collirio antibiotico serve solo per le forme batteriche ed è il medico a deciderlo.",
    },
  ],

  causes: [
    "Virus, spesso gli stessi del raffreddore: è la forma più comune ed è molto contagiosa.",
    "Batteri, con secrezioni dense e gialle.",
    "Allergie a pollini, acari o peli di animali: di solito colpiscono entrambi gli occhi con molto prurito.",
    "Sostanze irritanti come il cloro della piscina, il fumo o alcuni cosmetici.",
  ],
  riskFactors: [
    "Contatto con persone che hanno la congiuntivite, ad esempio a scuola.",
    "Lenti a contatto, soprattutto se pulite male o tenute di notte.",
    "Allergie stagionali.",
    "Toccarsi spesso gli occhi.",
  ],

  symptoms: {
    typical: [
      "Occhio rosso",
      "Bruciore o sensazione di sabbia",
      "Prurito",
      "Lacrimazione",
      "Secrezioni che incollano le ciglia, soprattutto al mattino",
    ],
    lessCommon: [
      "Palpebre gonfie",
      "Leggero fastidio alla luce",
      "Ghiandola gonfia davanti all'orecchio, nelle forme virali",
      "Sintomi di raffreddore insieme",
    ],
  },

  treatments: {
    options: [
      {
        title: "Pulizia delle palpebre",
        text: "Lava le palpebre con acqua bollita e lasciata raffreddare, usando un dischetto di cotone pulito per ogni occhio.",
      },
      { title: "Impacchi freddi e lacrime artificiali", text: "Danno sollievo a bruciore e prurito." },
      { title: "Colliri antistaminici", text: "Per le forme allergiche. Chiedi al farmacista o al medico." },
      {
        title: "Colliri antibiotici, solo se servono",
        text: "Il medico li prescrive per le forme batteriche: non funzionano contro virus e allergie.",
      },
    ],
    selfCare: [
      "Non usare le lenti a contatto finché gli occhi non sono guariti.",
      "Non strofinare gli occhi.",
      "Usa asciugamani e federe solo tuoi e lavali spesso.",
      "Sotto i 2 anni chiedi sempre al pediatra prima di usare un collirio.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "I sintomi non migliorano dopo 7 giorni.",
      "Porti le lenti a contatto e hai anche dei puntini sulle palpebre.",
      "Un neonato ha gli occhi rossi con secrezioni: se ha meno di 30 giorni, senti il pediatra con urgenza.",
    ],
    urgent: [
      "Hai dolore all'occhio, forte fastidio alla luce o la vista è cambiata.",
      "Vedi lampi di luce o linee ondulate.",
      "L'occhio è diventato rosso dopo un colpo, una scheggia o una sostanza chimica.",
    ],
  },

  prevention: [
    "Lavati spesso le mani, soprattutto prima di toccare gli occhi.",
    "Non condividere asciugamani, cuscini, trucchi o colliri.",
    "Pulisci bene le lenti a contatto e rispetta i tempi di sostituzione.",
    "Se sei allergico, riduci il contatto con gli allergeni.",
  ],

  specialist: {
    id: "oculista",
    why: "L'oculista serve se i sintomi non passano, se hai dolore o la vista cambia, o se porti lenti a contatto.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Congiuntivite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/c/congiuntivite",
      lang: "it",
    },
    { publisher: "NHS", title: "Conjunctivitis", url: "https://www.nhs.uk/conditions/conjunctivitis/", lang: "en" },
    { publisher: "MedlinePlus", title: "Pink Eye", url: "https://medlineplus.gov/pinkeye.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["occhi-rossi", "lacrimazione", "secrezione-occhi", "prurito-occhi"],
    otherSymptoms: ["sabbia-occhi", "palpebre-gonfie", "naso-che-cola"],
    moreLikelyIf: [
      "Al mattino hai le ciglia incollate.",
      "Qualcuno vicino a te ha avuto gli occhi rossi di recente.",
      "Hai molto prurito e soffri di altre allergie.",
    ],
    lessLikelyIf: [
      "Hai un forte dolore all'occhio o la vista è peggiorata: serve una visita urgente.",
      "È rosso un solo occhio dopo un colpo o una scheggia.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
