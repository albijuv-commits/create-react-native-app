import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "apnee-notturne",
  name: "Apnee notturne",
  aliases: ["apnea notturna ostruttiva", "OSAS", "russare", "apnee del sonno"],
  areas: ["respiro", "mente"],
  bodyZones: ["collo", "testa"],

  overview:
    "Le apnee notturne ostruttive sono pause ripetute del respiro durante il sonno, dovute alla chiusura delle vie aeree in gola. Si accompagnano a russamento forte e sonno poco riposante e, se non curate, aumentano il rischio di pressione alta, malattie del cuore e incidenti per sonnolenza: si curano bene, spesso con un apparecchio che soffia aria durante la notte.",

  animation: {
    scene: "vie-aeree-sonno",
    params: {},
    captions: [
      "Da svegli, i muscoli della gola tengono aperto il passaggio dell'aria.",
      "Nel sonno i muscoli si rilassano: lingua e palato molle scivolano indietro e il passaggio si restringe. L'aria vibra e si russa.",
      "A volte la gola si chiude del tutto: il respiro si ferma per alcuni secondi e l'ossigeno nel sangue scende.",
      "Il cervello si risveglia per un attimo e il respiro riparte, anche centinaia di volte a notte. La CPAP tiene aperta la gola con un flusso d'aria.",
    ],
  },

  history: {
    nameOrigin:
      "«Apnea» viene dal greco «a-», senza, e «pnoé», respiro. Un tempo si parlava di «sindrome di Pickwick», dal personaggio di un romanzo di Charles Dickens che si addormentava di continuo.",
    events: [
      {
        when: "1956",
        text: "Il medico statunitense C. Sidney Burwell descrive la «sindrome di Pickwick», che lega obesità, sonnolenza e respiro difficile.",
      },
      {
        when: "1965",
        text: "In Francia e in Germania due gruppi di ricerca documentano le pause del respiro durante il sonno.",
      },
      {
        when: "1981",
        text: "In Australia Colin Sullivan descrive la CPAP, l'apparecchio che soffia aria in una mascherina e tiene aperte le vie aeree: è ancora oggi la cura principale.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Gianni, 56 anni: il russatore sempre stanco",
      story:
        "Gianni russa forte da anni e la moglie nota che a volte smette di respirare per alcuni secondi, poi riprende con uno sbuffo. Di giorno ha sonno, si appisola davanti alla TV e una volta anche al semaforo. Il medico lo invia a un centro del sonno, dove un esame notturno conferma apnee gravi. Con la CPAP e qualche chilo in meno torna a svegliarsi riposato.",
      lesson:
        "Russare forte con pause del respiro e sonnolenza di giorno va sempre segnalato al medico: le apnee si curano, e la sonnolenza alla guida è pericolosa.",
    },
  ],

  causes: [
    "Durante il sonno le vie aeree della gola si restringono o si chiudono.",
    "Contribuiscono il sovrappeso, un collo largo, tonsille o adenoidi grandi e la forma di mandibola e palato.",
  ],
  riskFactors: [
    "Sovrappeso e obesità.",
    "Età che avanza, anche se possono colpire bambini e giovani.",
    "Sesso maschile e menopausa.",
    "Alcol e sonniferi, soprattutto la sera.",
    "Fumo.",
    "Dormire sulla schiena.",
    "Familiari con apnee notturne.",
  ],

  symptoms: {
    typical: [
      "Russamento forte",
      "Pause del respiro nel sonno notate da chi dorme accanto, con sbuffi o rumori di soffocamento",
      "Sonnolenza e grande stanchezza durante il giorno",
      "Risvegli frequenti",
    ],
    lessCommon: [
      "Mal di testa al risveglio",
      "Bocca secca al mattino",
      "Difficoltà di concentrazione e sbalzi d'umore",
      "Bisogno di urinare di notte",
    ],
  },

  treatments: {
    options: [
      {
        title: "Stile di vita",
        text: "Perdere peso, ridurre l'alcol la sera, smettere di fumare e dormire sul fianco possono bastare nelle forme lievi.",
      },
      {
        title: "CPAP",
        text: "Un apparecchio che soffia aria attraverso una mascherina durante il sonno e tiene aperta la gola. Funziona meglio se usato ogni notte.",
      },
      {
        title: "Apparecchio per la bocca",
        text: "Un bite su misura che porta in avanti la mandibola, per alcune forme lievi o moderate.",
      },
      { title: "Chirurgia", text: "In casi selezionati, ad esempio quando le tonsille sono molto grandi." },
    ],
    selfCare: [
      "Non prendere sonniferi senza parlarne con il medico: possono peggiorare le apnee.",
      "Non metterti alla guida se hai molto sonno.",
      "Mantieni orari di sonno regolari.",
      "Porta dal medico chi ti ha visto dormire: le sue osservazioni sono preziose.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Qualcuno ha notato che smetti di respirare durante il sonno o fai rumori come se soffocassi.",
      "Russi forte e di giorno ti senti molto stanco o assonnato.",
      "Ti addormenti quando dovresti essere sveglio, ad esempio al lavoro.",
      "Ti è capitato di addormentarti alla guida: non guidare finché non sei stato valutato.",
    ],
    urgent: ["Ti svegli con un fiato corto che non passa, dolore al petto o forti palpitazioni."],
  },

  prevention: ["Mantieni un peso sano.", "Limita l'alcol, soprattutto la sera.", "Non fumare.", "Dormi sul fianco."],

  specialist: {
    id: "medicina-del-sonno",
    why: "Il medico di base può indirizzarti a un centro di medicina del sonno per gli esami notturni; spesso ci lavorano pneumologi, neurologi e otorinolaringoiatri.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Apnea notturna ostruttiva",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/a/apnea-notturna-ostruttiva",
      lang: "it",
    },
    {
      publisher: "Ministero della Salute",
      title: "Sindrome da apnee ostruttive del sonno",
      url: "https://www.salute.gov.it/new/it/scheda-malattia/sindrome-da-apnee-ostruttive-del-sonno/",
      lang: "it",
    },
    { publisher: "NHS", title: "Sleep apnoea", url: "https://www.nhs.uk/conditions/sleep-apnoea/", lang: "en" },
    { publisher: "MedlinePlus", title: "Sleep Apnea", url: "https://medlineplus.gov/sleepapnea.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["russare", "pause-respiro-sonno", "sonnolenza-diurna"],
    otherSymptoms: [
      "sonno-non-ristoratore",
      "mal-di-testa-mattino",
      "bocca-secca",
      "difficolta-concentrazione",
      "risvegli-notturni",
    ],
    moreLikelyIf: [
      "Chi dorme con te ha notato pause del respiro.",
      "Di giorno hai sonno anche se dormi abbastanza ore.",
      "Sei in sovrappeso o hai il collo largo.",
    ],
    lessLikelyIf: [
      "Fai fatica ad addormentarti ma di giorno non hai sonno: è più tipico dell'insonnia.",
      "Non russi.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
