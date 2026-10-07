import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "cistite",
  name: "Cistite",
  aliases: ["infezione urinaria", "infezione delle vie urinarie", "bruciore a urinare", "infezione della vescica"],
  areas: ["urinario"],
  bodyZones: ["basso-ventre"],

  overview:
    "La cistite è un'infiammazione della vescica, quasi sempre dovuta a batteri che arrivano dall'intestino. È molto più frequente nelle donne e provoca bruciore quando si urina e bisogno di urinare spesso: le forme semplici guariscono in pochi giorni, a volte con antibiotici prescritti dal medico.",

  animation: {
    scene: "infezione-batterica",
    params: { batterio: "bacillo", sede: "vescica" },
    captions: [
      "Batteri come l'Escherichia coli, che vivono normalmente nell'intestino, risalgono l'uretra fino alla vescica.",
      "Si attaccano alla parete della vescica con sottili filamenti e si moltiplicano.",
      "La parete si infiamma: arrivano il bruciore e lo stimolo continuo a urinare. I globuli bianchi accorrono.",
      "I globuli bianchi inglobano i batteri. Se servono, gli antibiotici prescritti dal medico li eliminano in pochi giorni.",
    ],
  },

  history: {
    nameOrigin: "Dal greco «kystis», vescica, più il suffisso «-ite», che indica un'infiammazione.",
    events: [
      {
        when: "1885",
        text: "Il pediatra tedesco Theodor Escherich scopre il batterio che oggi porta il suo nome, Escherichia coli, la causa più frequente di cistite.",
      },
      { when: "Anni '30", text: "Arrivano i sulfamidici, i primi farmaci davvero efficaci contro le infezioni urinarie." },
      {
        when: "Oggi",
        text: "L'uso eccessivo di antibiotici ha reso alcuni batteri resistenti: per questo il medico valuta caso per caso se e quale antibiotico prescrivere.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Laura, 30 anni: bruciore senza febbre",
      story:
        "Laura ha bruciore quando urina e sente lo stimolo ogni mezz'ora, con poca urina ogni volta. Non ha febbre. Beve molta acqua e chiama il medico, che le prescrive una breve cura. Due giorni dopo sta meglio. Il medico le ricorda che febbre e dolore al fianco sarebbero stati un motivo per farsi rivedere subito.",
      lesson:
        "La cistite semplice si cura in fretta, ma febbre, brividi o dolore al fianco possono indicare un'infezione del rene, che va curata subito.",
    },
  ],

  causes: [
    "Batteri dell'intestino, soprattutto Escherichia coli, che risalgono l'uretra fino alla vescica.",
    "Nelle donne l'uretra è più corta, quindi i batteri arrivano più facilmente in vescica.",
    "Più di rado irritazioni senza infezione, ad esempio da prodotti intimi profumati.",
  ],
  riskFactors: [
    "Rapporti sessuali, soprattutto con spermicidi.",
    "Gravidanza e menopausa.",
    "Trattenere a lungo l'urina o bere poco.",
    "Pulirsi da dietro in avanti dopo il bagno.",
    "Diabete, calcoli, catetere urinario o, negli uomini, prostata ingrossata.",
    "Stitichezza nei bambini.",
  ],

  symptoms: {
    typical: [
      "Bruciore o dolore quando urini",
      "Bisogno di urinare spesso e con urgenza, anche di notte",
      "Urine torbide o con odore forte",
      "Dolore o peso al basso ventre",
    ],
    lessCommon: [
      "Sangue nelle urine",
      "Stanchezza e malessere",
      "Nei bambini: febbre, irritabilità, pipì a letto",
      "Nelle persone anziane: confusione o agitazione insolite",
    ],
  },

  treatments: {
    options: [
      {
        title: "Antibiotici, se servono",
        text: "Il medico li prescrive per pochi giorni. Prendili fino alla fine, anche se ti senti meglio prima.",
      },
      { title: "Antidolorifici", text: "Alleviano dolore e febbre. Chiedi al medico o al farmacista quale scegliere." },
      { title: "Bere a sufficienza", text: "Ti aiuta a urinare spesso e a eliminare i batteri." },
      {
        title: "Cure per le cistiti ricorrenti",
        text: "Se la cistite torna spesso, il medico può proporre esami e cure preventive; in menopausa, a volte, creme a base di estrogeni.",
      },
    ],
    selfCare: [
      "Bevi acqua in modo da avere urine chiare durante il giorno.",
      "Evita le bevande che irritano la vescica, come caffè, alcol e succhi di frutta.",
      "Riposa.",
      "Mirtillo rosso e D-mannosio non curano un'infezione in corso: chiedi al medico se possono aiutarti a prevenirla.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Pensi di avere la cistite: il medico decide se serve un esame delle urine o un antibiotico.",
      "Sei un uomo, sei in gravidanza, hai il diabete o difese immunitarie basse.",
      "Si tratta di un bambino o di una persona anziana.",
      "C'è sangue nelle urine.",
      "I sintomi non migliorano entro 48 ore dall'inizio della cura, o la cistite torna spesso.",
    ],
    urgent: [
      "Hai febbre alta, brividi o dolore alla schiena sotto le costole: può essere un'infezione del rene.",
      "Sei confuso, molto sonnolento o fai fatica a parlare.",
    ],
  },

  prevention: [
    "Bevi acqua a sufficienza durante il giorno.",
    "Non trattenere l'urina e svuota bene la vescica.",
    "Dopo il bagno pulisciti da davanti verso dietro.",
    "Urina subito dopo i rapporti sessuali.",
    "Evita saponi intimi profumati e indumenti troppo stretti; preferisci il cotone.",
  ],

  specialist: {
    id: "urologo",
    why: "Il primo riferimento è il medico di base. Se la cistite torna spesso o ci sono complicazioni, può indirizzarti all'urologo o, per le donne, al ginecologo.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Cistite",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/c/cistite",
      lang: "it",
    },
    {
      publisher: "NHS",
      title: "Urinary tract infections (UTIs)",
      url: "https://www.nhs.uk/conditions/urinary-tract-infections-utis/",
      lang: "en",
    },
    {
      publisher: "MedlinePlus",
      title: "Urinary Tract Infections",
      url: "https://medlineplus.gov/urinarytractinfections.html",
      lang: "en",
    },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["bruciore-urinare", "urinare-spesso"],
    otherSymptoms: ["urine-torbide", "dolore-basso-ventre", "sangue-urine", "febbre", "stanchezza"],
    moreLikelyIf: [
      "Sei una donna e hai già avuto la cistite.",
      "I sintomi sono comparsi dopo un rapporto sessuale.",
      "Non hai perdite vaginali insolite.",
    ],
    lessLikelyIf: [
      "Hai perdite vaginali o prurito intimo: può trattarsi di un'altra infezione.",
      "Hai febbre alta e dolore al fianco: va esclusa un'infezione del rene.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
