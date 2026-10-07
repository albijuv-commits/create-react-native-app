import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "dermatite-atopica",
  name: "Dermatite atopica",
  aliases: ["eczema atopico", "eczema", "neurodermite"],
  areas: ["pelle"],
  bodyZones: ["pelle", "braccia", "gambe", "mani"],

  overview:
    "La dermatite atopica è una malattia infiammatoria della pelle che la rende secca e pruriginosa, con chiazze arrossate che vanno e vengono. È frequente nei bambini piccoli e spesso migliora crescendo: non è contagiosa e, anche se non esiste una cura definitiva, si tiene sotto controllo con creme idratanti e trattamenti mirati.",

  animation: {
    scene: "pelle",
    params: { variante: "atopica" },
    captions: [
      "Lo strato più esterno della pelle è come un muro: le cellule sono i mattoni, i grassi la malta che trattiene l'acqua.",
      "Nella dermatite atopica il muro ha delle crepe: l'acqua evapora e la pelle si secca, mentre irritanti e allergeni entrano più facilmente.",
      "Il sistema immunitario reagisce: la pelle si arrossa e prude. Grattarsi apre altre crepe, in un circolo vizioso.",
      "Le creme emollienti riparano la barriera e le terapie prescritte calmano l'infiammazione.",
    ],
  },

  history: {
    nameOrigin:
      "«Atopia» viene dal greco «atopos», fuori posto, strano: indica la tendenza a reagire in modo esagerato a sostanze comuni. «Eczema» viene dal greco «ekzein», ribollire.",
    events: [
      {
        when: "1891",
        text: "I dermatologi francesi Louis Brocq e Lucien Jacquet parlano di «neurodermite», nome con cui la malattia sarà conosciuta a lungo.",
      },
      {
        when: "1923",
        text: "Gli statunitensi Arthur Coca e Robert Cooke introducono il concetto di atopia, che collega eczema, asma e rinite allergica.",
      },
      {
        when: "1952",
        text: "Arriva l'idrocortisone in crema: i cortisonici da applicare sulla pelle diventano una base della cura.",
      },
      {
        when: "2006",
        text: "Si scopre che le mutazioni del gene della filaggrina, una proteina della barriera cutanea, sono un importante fattore di rischio.",
      },
      { when: "2017", text: "Viene approvato il primo farmaco biologico per la dermatite atopica moderata e grave." },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Giorgio, 8 mesi: le guance che prudono",
      story:
        "Giorgio ha le guance rosse e secche e si sfrega il viso sul cuscino. Il pediatra parla di dermatite atopica: consiglia di applicare spesso una crema emolliente, usare detergenti delicati e tenere corte le unghie. Per i periodi peggiori prescrive una crema da usare per pochi giorni, e la pelle migliora molto.",
      lesson:
        "La cura quotidiana con gli emollienti è la base, anche quando la pelle sta bene. Non togliere cibi dalla dieta senza il parere del medico.",
    },
  ],

  causes: [
    "Una barriera della pelle più debole, spesso per motivi genetici.",
    "Un sistema immunitario che reagisce in modo esagerato.",
  ],
  riskFactors: [
    "Genitori o familiari con dermatite atopica, asma o rinite allergica.",
    "Fattori che scatenano le crisi: saponi e detersivi aggressivi, lana e alcuni tessuti, caldo e sudore, sbalzi di temperatura, stress.",
    "Allergeni come acari, pollini e peli di animali.",
    "Infezioni della pelle.",
  ],

  symptoms: {
    typical: [
      "Prurito, a volte intenso, soprattutto di notte",
      "Pelle secca, screpolata o squamosa",
      "Chiazze arrossate; sulla pelle scura possono apparire più scure, grigie o più chiare",
      "Nei bambini piccoli sul viso; più avanti nelle pieghe di gomiti e ginocchia e sulle mani",
    ],
    lessCommon: [
      "Pelle ispessita dove ci si gratta molto",
      "Piccole vescicole che trasudano o formano croste",
      "Sonno disturbato dal prurito",
    ],
  },

  treatments: {
    options: [
      {
        title: "Emollienti ogni giorno",
        text: "Creme e unguenti idratanti da applicare spesso, anche quando la pelle sta meglio, e da usare al posto del sapone.",
      },
      {
        title: "Cortisonici da applicare sulla pelle",
        text: "Calmano le riacutizzazioni. Il medico ti spiega quale usare e per quanto tempo.",
      },
      {
        title: "Altre creme antinfiammatorie",
        text: "Il dermatologo può prescriverne alcune senza cortisone, adatte anche alle zone delicate.",
      },
      {
        title: "Terapie per le forme gravi",
        text: "Nei casi più difficili il dermatologo può proporre la fototerapia o farmaci per bocca o con iniezioni, compresi i biologici.",
      },
    ],
    selfCare: [
      "Lavati con detergenti delicati o con un emolliente al posto del sapone.",
      "Tieni le unghie corte; ai neonati puoi mettere guantini di cotone.",
      "A contatto con la pelle preferisci il cotone alla lana e ai tessuti sintetici.",
      "Evita il troppo caldo: il sudore aumenta il prurito.",
      "Se senti prurito, prova a premere o picchiettare la pelle invece di grattarti.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "Pensi che tu o tuo figlio abbiate la dermatite atopica.",
      "Le cure non bastano o il prurito disturba il sonno.",
      "La dermatite pesa sull'umore o sulla vita di tutti i giorni.",
    ],
    urgent: [
      "Le chiazze diventano calde, dolenti, con croste gialle o pus, e hai febbre o ti senti male: può essere un'infezione.",
      "Compaiono all'improvviso tante piccole vescicole dolorose e simili tra loro, con febbre: serve una visita urgente.",
    ],
  },

  prevention: [
    "Usa gli emollienti ogni giorno, anche quando la pelle sta bene.",
    "Riconosci ed evita ciò che scatena le tue crisi.",
    "Tieni la casa fresca e non troppo secca.",
    "Non fumare in casa, soprattutto vicino ai bambini.",
  ],

  specialist: {
    id: "dermatologo",
    why: "Il medico di base o il pediatra gestiscono le forme lievi; il dermatologo serve per le forme estese, ostinate o gravi.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Eczema",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/e/eczema",
      lang: "it",
    },
    { publisher: "NHS", title: "Atopic eczema", url: "https://www.nhs.uk/conditions/atopic-eczema/", lang: "en" },
    { publisher: "MedlinePlus", title: "Eczema", url: "https://medlineplus.gov/eczema.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["prurito-pelle", "pelle-secca", "chiazze-rosse"],
    otherSymptoms: ["vescicole", "risvegli-notturni"],
    moreLikelyIf: [
      "È iniziata da bambino e va e viene.",
      "Le chiazze sono nelle pieghe di gomiti e ginocchia o sul viso.",
      "Tu o la tua famiglia avete asma o rinite allergica.",
    ],
    lessLikelyIf: [
      "Le chiazze sono spesse, ben delimitate e con squame argentee: è più tipico della psoriasi.",
      "L'irritazione è solo dove la pelle ha toccato una sostanza.",
    ],
    typicalUrgency: "gp",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
