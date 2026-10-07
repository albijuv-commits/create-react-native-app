import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "bruxismo",
  name: "Bruxismo",
  aliases: ["digrignare i denti", "stringere i denti", "serrare la mandibola"],
  areas: ["testa", "muscoli"],
  bodyZones: ["bocca", "testa"],

  overview:
    "Il bruxismo è l'abitudine di digrignare o stringere i denti, di notte nel sonno o di giorno, spesso senza accorgersene. È legato soprattutto a stress e ansia e può causare dolore alla mandibola, mal di testa e denti consumati: un bite notturno e la gestione dello stress aiutano molto.",

  animation: {
    scene: "tensione-muscolare",
    params: { zona: "mandibola" },
    captions: [
      "La mandibola si muove grazie a muscoli potenti, come il massetere sulla guancia e il temporale sulla tempia.",
      "Di notte, o nei momenti di tensione, i denti si stringono e strisciano tra loro, anche a lungo.",
      "I muscoli si affaticano e fanno male; lo smalto si consuma e l'articolazione davanti all'orecchio si sovraccarica.",
      "Un bite su misura protegge i denti durante la notte; rilassamento e gestione dello stress sciolgono la tensione.",
    ],
  },

  history: {
    nameOrigin: "Dal greco «brychein», digrignare i denti.",
    events: [
      {
        when: "1907",
        text: "In Francia due medici, Marie e Pietkiewicz, descrivono il digrignamento dei denti con il nome di «bruxomanie».",
      },
      { when: "1931", text: "Il termine inglese «bruxism» compare per la prima volta in un articolo scientifico." },
      {
        when: "2013",
        text: "Un gruppo internazionale di esperti definisce il bruxismo e distingue quello nel sonno da quello da svegli; la definizione viene aggiornata nel 2018.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Anna, 33 anni: il dolore alle tempie al mattino",
      story:
        "Da quando ha cambiato lavoro, Anna si sveglia con la mandibola indolenzita e un mal di testa alle tempie. Il dentista nota i denti consumati e le spiega che digrigna di notte. Le prepara un bite su misura e le consiglia esercizi di rilassamento. In poche settimane i dolori del mattino diminuiscono.",
      lesson:
        "Spesso il bruxismo lo nota prima il dentista, o chi dorme accanto. Proteggere i denti e ridurre lo stress sono i due passi principali.",
    },
  ],

  causes: [
    "Stress e ansia, la causa più comune.",
    "Disturbi del sonno, come russamento e apnee notturne.",
    "Alcuni farmaci per il sonno, la depressione o l'ansia.",
    "Fumo, alcol, caffeina e alcune droghe.",
  ],
  riskFactors: [
    "Periodi di forte stress.",
    "Un carattere teso o molto competitivo.",
    "Familiari con bruxismo.",
    "Apnee notturne.",
  ],

  symptoms: {
    typical: [
      "Digrignare o stringere i denti, a volte segnalato da chi dorme accanto",
      "Dolore o tensione a mandibola, viso o tempie, soprattutto al mattino",
      "Denti consumati, scheggiati o sensibili",
    ],
    lessCommon: [
      "Mal di testa al risveglio",
      "Mal d'orecchio",
      "Sonno disturbato",
      "Scrocchi o blocchi dell'articolazione della mandibola",
    ],
  },

  treatments: {
    options: [
      {
        title: "Bite notturno",
        text: "Un apparecchio su misura, preparato dal dentista, che protegge i denti durante il sonno.",
      },
      {
        title: "Gestione dello stress",
        text: "Esercizi di respirazione, attività fisica e, se serve, un percorso con uno psicologo.",
      },
      {
        title: "Antidolorifici e impacchi",
        text: "Per il dolore alla mandibola: un antidolorifico consigliato dal farmacista e impacchi caldi o freddi.",
      },
      {
        title: "Cura dei disturbi del sonno",
        text: "Se ci sono russamento o apnee, curarli può ridurre anche il bruxismo.",
      },
    ],
    selfCare: [
      "Durante il giorno fai caso a quando stringi i denti: labbra chiuse, denti separati, mandibola rilassata.",
      "Riduci caffeina e alcol, soprattutto la sera, e non fumare.",
      "Se la mandibola fa male, evita gomme da masticare e cibi duri.",
      "Crea una routine rilassante prima di dormire.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Hai denti danneggiati o sensibili.",
      "Hai dolore a mandibola, viso o orecchio.",
      "Chi dorme con te ti sente digrignare i denti.",
      "Sei preoccupato per un bambino che digrigna i denti.",
    ],
    urgent: ["Non riesci ad aprire o a chiudere la bocca, o la mandibola si è bloccata."],
  },

  prevention: [
    "Gestisci lo stress con attività che ti rilassano.",
    "Dormi a orari regolari.",
    "Limita caffeina e alcol.",
    "Fai controlli regolari dal dentista.",
  ],

  specialist: {
    id: "dentista",
    why: "Il dentista riconosce i segni sui denti e prepara il bite. Il medico di base aiuta se dietro ci sono stress, ansia o problemi del sonno.",
  },

  sources: [
    { publisher: "NHS", title: "Teeth grinding (bruxism)", url: "https://www.nhs.uk/symptoms/teeth-grinding/", lang: "en" },
    { publisher: "MedlinePlus", title: "Bruxism", url: "https://medlineplus.gov/ency/article/001413.htm", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["digrignare", "dolore-mandibola"],
    otherSymptoms: ["denti-consumati", "mal-di-testa-mattino", "dolore-orecchio"],
    moreLikelyIf: [
      "Il dolore alla mandibola è peggiore al mattino.",
      "Sei in un periodo di stress.",
      "Qualcuno ti ha sentito digrignare i denti di notte.",
    ],
    lessLikelyIf: [
      "Il dolore è a un solo dente, con gonfiore o febbre: può essere un'infezione dentale.",
      "Il dolore alla mandibola compare con lo sforzo o insieme a dolore al petto: chiama il 112.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
