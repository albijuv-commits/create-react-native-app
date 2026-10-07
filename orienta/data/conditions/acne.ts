import { defineCondition } from "@/lib/conditions/define";

export default defineCondition({
  id: "acne",
  name: "Acne",
  aliases: ["brufoli", "punti neri", "acne giovanile", "foruncoli"],
  areas: ["pelle"],
  bodyZones: ["pelle", "petto", "schiena-alta"],

  overview:
    "L'acne è una malattia della pelle molto comune che colpisce i follicoli dei peli e le ghiandole che producono sebo, causando punti neri, brufoli e a volte noduli profondi. È tipica dell'adolescenza ma può durare o comparire anche da adulti: ci sono molte cure efficaci, che aiutano anche a evitare le cicatrici.",

  animation: {
    scene: "pelle",
    params: { variante: "acne" },
    captions: [
      "Ogni pelo nasce da un follicolo, accanto a una ghiandola che produce sebo, il grasso naturale della pelle.",
      "Gli ormoni, soprattutto durante la pubertà, aumentano il sebo che, insieme alle cellule morte, tappa il poro: nasce il punto nero o bianco.",
      "Nel poro chiuso si moltiplicano i batteri della pelle: arrivano infiammazione, rossore e pus.",
      "Le cure liberano i pori, riducono i batteri e spengono l'infiammazione. Non schiacciare i brufoli: lasciano cicatrici.",
    ],
  },

  history: {
    nameOrigin:
      "Secondo l'ipotesi più diffusa, la parola deriva dal greco «akmé», punta, trascritta per errore come «acne» in un antico testo medico.",
    events: [
      {
        when: "Anni '50",
        text: "Gli antibiotici della famiglia delle tetracicline iniziano a essere usati anche per l'acne infiammatoria.",
      },
      {
        when: "1969",
        text: "Il dermatologo statunitense Albert Kligman pubblica i risultati della tretinoina in crema, il primo retinoide per l'acne.",
      },
      {
        when: "1982",
        text: "Viene approvata l'isotretinoina per bocca, molto efficace nelle forme gravi: per i rischi in gravidanza si usa con controlli rigorosi.",
      },
      {
        when: "Oggi",
        text: "Per limitare la resistenza dei batteri, gli antibiotici si usano per periodi limitati e insieme ad altre cure.",
      },
    ],
  },

  cases: [
    {
      kind: "illustrativo",
      title: "Matteo, 16 anni: brufoli e autostima",
      story:
        "Matteo ha punti neri e brufoli su fronte e schiena e ha smesso di andare in piscina. Le creme da banco aiutano poco. Il medico gli prescrive una cura da applicare sulla pelle e, dopo tre mesi senza grandi risultati, lo indirizza al dermatologo, che imposta una terapia per bocca. In sei mesi la pelle migliora e Matteo torna ad allenarsi.",
      lesson:
        "L'acne non è solo un problema estetico: se pesa sull'umore o lascia segni, merita una cura. Le cure richiedono settimane per funzionare, quindi serve pazienza.",
    },
  ],

  causes: [
    "I follicoli si tappano per l'eccesso di sebo e di cellule morte.",
    "Nei follicoli chiusi i batteri della pelle si moltiplicano e causano infiammazione.",
    "Gli ormoni: pubertà, ciclo, gravidanza o condizioni come la sindrome dell'ovaio policistico.",
    "Alcuni farmaci e cosmetici troppo grassi.",
  ],
  riskFactors: [
    "Adolescenza.",
    "Familiari che hanno avuto l'acne.",
    "Cosmetici e prodotti per capelli comedogenici, cioè che chiudono i pori.",
    "Stress, che può peggiorarla.",
    "L'abitudine di schiacciare i brufoli.",
  ],

  symptoms: {
    typical: ["Punti neri e punti bianchi", "Brufoli rossi, a volte con pus", "Pelle grassa e lucida", "Su viso, petto e schiena"],
    lessCommon: [
      "Noduli e cisti profondi e dolorosi",
      "Macchie scure o rosse dopo la guarigione",
      "Cicatrici",
      "Effetti sull'umore e sull'autostima",
    ],
  },

  treatments: {
    options: [
      {
        title: "Prodotti da banco",
        text: "Detergenti e creme con acido salicilico o perossido di benzoile aiutano nelle forme lievi. Chiedi consiglio al farmacista.",
      },
      {
        title: "Cure su prescrizione da applicare sulla pelle",
        text: "Retinoidi e antibiotici in crema o gel, spesso insieme, per le forme moderate.",
      },
      {
        title: "Cure per bocca",
        text: "Antibiotici per un periodo limitato, la pillola per alcune donne e, nelle forme gravi, l'isotretinoina prescritta dal dermatologo con controlli regolari.",
      },
      { title: "Pazienza", text: "Le cure di solito richiedono almeno due o tre mesi per dare risultati evidenti." },
    ],
    selfCare: [
      "Lava il viso mattina e sera con un detergente delicato, senza strofinare.",
      "Usa cosmetici e creme solari non comedogenici e strucca la pelle la sera.",
      "Non schiacciare e non stuzzicare i brufoli.",
      "Quando fai sport indossa abiti traspiranti e fai la doccia dopo.",
    ],
  },

  whenToSeeDoctor: {
    routine: [
      "I prodotti da banco non funzionano dopo alcune settimane.",
      "Hai molti brufoli, noduli profondi o dolorosi, o iniziano a formarsi cicatrici.",
      "L'acne pesa sul tuo umore o sulla tua vita sociale.",
      "Compare all'improvviso in età adulta, insieme a ciclo irregolare o peli in eccesso.",
    ],
    urgent: ["La pelle intorno ai brufoli è molto calda, gonfia, rossa e dolente, e hai febbre: può essere un'infezione."],
  },

  prevention: [
    "Detergi la pelle con delicatezza.",
    "Scegli prodotti non comedogenici.",
    "Non toccare e non schiacciare i brufoli.",
    "Se l'acne è moderata, inizia presto le cure per evitare cicatrici.",
  ],

  specialist: {
    id: "dermatologo",
    why: "Il dermatologo segue l'acne moderata o grave, quella che lascia cicatrici e quella che non risponde alle prime cure.",
  },

  sources: [
    {
      publisher: "ISSalute",
      title: "Acne",
      url: "https://www.issalute.it/index.php/la-salute-dalla-a-alla-z-menu/a/acne",
      lang: "it",
    },
    { publisher: "NHS", title: "Acne", url: "https://www.nhs.uk/conditions/acne/", lang: "en" },
    { publisher: "MedlinePlus", title: "Acne", url: "https://medlineplus.gov/acne.html", lang: "en" },
  ],

  triage: {
    matchable: true,
    keySymptoms: ["brufoli", "chiazze-rosse"],
    otherSymptoms: [],
    moreLikelyIf: [
      "Sei adolescente, o i brufoli peggiorano con il ciclo.",
      "Sono su viso, petto e schiena, insieme a punti neri.",
    ],
    lessLikelyIf: [
      "Hai arrossamento al centro del viso con piccoli vasi visibili e senza punti neri: può essere rosacea.",
      "Sono comparse all'improvviso vescicole su tutto il corpo, con febbre.",
    ],
    typicalUrgency: "home",
  },

  reviewStatus: "da revisionare",
  updatedAt: "2026-10-07",
});
