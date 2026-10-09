import { z } from "zod";

/**
 * Schede dei principi attivi più comuni: una breve descrizione chimica, come agisce e quali effetti
 * produce, gli effetti indesiderati più frequenti. Il testo è riassunto dal Riassunto delle
 * Caratteristiche del Prodotto (RCP) ufficiale pubblicato dall'AIFA (sezioni 4.8 e 5.1); formula,
 * massa molare e classe chimica vengono da PubChem (NIH) e dalle definizioni ChEBI. Niente dosi,
 * niente consigli d'uso: per quelli c'è il foglietto illustrativo, e il medico o il farmacista.
 */
export const INGREDIENTS_CHECKED_ON = "2026-10-07";

const rcp = (ditta: number, farmaco: number) => `https://api.aifa.gov.it/aifa-bdf-eif-be/1.0.0/organizzazione/${ditta}/farmaci/${farmaco}/stampati?ts=RCP`;
const pubchem = (cid: number) => `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;

export const moleculeSchema = z.object({
  name: z.string().min(1),
  formula: z.string().regex(/^(?:[A-Z][a-z]?\d*)+$/),
  /** g/mol, da PubChem */
  molarMass: z.number().positive(),
  pubchemCid: z.number().int().positive(),
});

export const ingredientInfoSchema = z.object({
  /** Chiave del principio attivo (ingredient-key.ts): lega la scheda alle confezioni AIFA */
  key: z.string().min(1),
  name: z.string().min(1),
  /** La stessa sostanza nei dati EMA, con la chiave inglese (emaSubstanceKey) */
  ema: z.string().min(1),
  chemistry: z.string().min(20),
  molecules: z.array(moleculeSchema).min(1),
  action: z.string().min(20),
  sideEffects: z.array(z.string().min(10)).min(1),
  caution: z.string().min(10).optional(),
  sources: z.array(z.object({ label: z.string().min(1), url: z.url({ protocol: /^https$/ }) })).min(2),
});
export type IngredientInfo = z.infer<typeof ingredientInfoSchema>;

export const INGREDIENTS: IngredientInfo[] = [
  {
    key: "paracetamolo",
    name: "Paracetamolo",
    ema: "paracetamol",
    chemistry: "Fa parte delle anilidi: è un fenolo, il 4-amminofenolo con un gruppo acetile legato all'azoto (N-acetil-4-amminofenolo).",
    molecules: [{ name: "Paracetamolo", formula: "C8H9NO2", molarMass: 151.16, pubchemCid: 1983 }],
    action:
      "Agisce sul sistema nervoso centrale, probabilmente attraverso i sistemi oppioide e serotoninergico e riducendo la produzione di prostaglandine: attenua il dolore (effetto analgesico) e abbassa la febbre (effetto antipiretico).",
    sideEffects: [
      "L'RCP non ne indica la frequenza: i dati disponibili non bastano a stabilirla.",
      "Tra quelli segnalati: reazioni allergiche (orticaria, angioedema, shock anafilattico), alterazioni del sangue, alterazioni della funzionalità del fegato ed epatite, vertigini, reazioni della pelle (quelle gravi sono molto rare).",
    ],
    caution: "Dosi più alte di quelle raccomandate comportano il rischio di danni gravissimi al fegato.",
    sources: [
      { label: "RCP Tachipirina (AIFA)", url: rcp(219, 12745) },
      { label: "PubChem: paracetamolo", url: pubchem(1983) },
    ],
  },
  {
    key: "ibuprofene",
    name: "Ibuprofene",
    ema: "ibuprofen",
    chemistry: "È un acido carbossilico: l'acido propionico con un gruppo 4-isobutilfenile in posizione 2. È il capostipite dei derivati fenilpropionici.",
    molecules: [{ name: "Ibuprofene", formula: "C13H18O2", molarMass: 206.28, pubchemCid: 3672 }],
    action:
      "È un antinfiammatorio non steroideo (FANS): inibisce la sintesi delle prostaglandine, sostanze coinvolte in infiammazione, dolore e febbre. Ha effetto analgesico, antinfiammatorio e antipiretico.",
    sideEffects: [
      "I più frequenti riguardano stomaco e intestino: nausea, vomito, diarrea, flatulenza, stitichezza, dispepsia, dolore e bruciore di stomaco.",
      "Comuni le eruzioni cutanee; possono comparire mal di testa, sonnolenza, capogiri, stanchezza e disturbi della vista.",
    ],
    caution: "Come gli altri FANS può causare ulcere, perforazioni o sanguinamenti di stomaco e intestino, a volte fatali, soprattutto negli anziani.",
    sources: [
      { label: "RCP Brufen (AIFA)", url: rcp(4157, 22593) },
      { label: "PubChem: ibuprofene", url: pubchem(3672) },
    ],
  },
  {
    key: "acido acetilsalicilico",
    name: "Acido acetilsalicilico",
    ema: "acetylsalicylic acid",
    chemistry: "È l'estere acetico dell'acido salicilico, un acido benzoico: il gruppo ossidrile del fenolo porta un acetile (acido 2-acetossibenzoico).",
    molecules: [{ name: "Acido acetilsalicilico", formula: "C9H8O4", molarMass: 180.16, pubchemCid: 2244 }],
    action:
      "Blocca in modo irreversibile l'enzima cicloossigenasi, che produce prostaglandine e trombossano. A dosi da analgesico riduce dolore, febbre e infiammazione; a basse dosi impedisce alle piastrine di aggregarsi, perché le piastrine non possono produrre di nuovo l'enzima (effetto antiaggregante).",
    sideEffects: [
      "Come analgesico, i più frequenti sono i disturbi di stomaco e intestino, in circa 4 persone su 100.",
      "A basse dosi, come antiaggregante, sono comuni: dispepsia, dolore addominale, infiammazione e sanguinamento gastrointestinale, sangue dal naso, rinite, vertigini, ronzii nelle orecchie, eruzioni cutanee, prurito, sanguinamenti delle vie urinarie e genitali.",
    ],
    caution: "Allunga il tempo di sanguinamento e aumenta il rischio di emorragie.",
    sources: [
      { label: "RCP Aspirina (AIFA)", url: rcp(22, 4763) },
      { label: "RCP Cardioaspirin (AIFA)", url: rcp(22, 24840) },
      { label: "PubChem: acido acetilsalicilico", url: pubchem(2244) },
    ],
  },
  {
    key: "ketoprofene",
    name: "Ketoprofene",
    ema: "ketoprofen",
    chemistry: "È un acido carbossilico: l'acido propionico con un gruppo 3-benzoilfenile in posizione 2. Come l'ibuprofene, è un derivato dell'acido propionico.",
    molecules: [{ name: "Ketoprofene", formula: "C16H14O3", molarMass: 254.28, pubchemCid: 3825 }],
    action:
      "È un antinfiammatorio non steroideo (FANS): inibisce la sintesi delle prostaglandine e ha altri effetti antinfiammatori, come la stabilizzazione delle membrane lisosomiali e un'azione contro la bradichinina. Riduce infiammazione e dolore; il gel agisce sul posto, passando attraverso la pelle.",
    sideEffects: [
      "Per bocca, comuni: dispepsia, nausea, dolore addominale, vomito.",
      "Gel: non comuni le reazioni della pelle dove si applica (rossore, eczema, prurito, bruciore); rare la fotosensibilizzazione, le eruzioni bollose e l'orticaria.",
    ],
    caution: "Con il gel va evitata l'esposizione al sole, compreso il solarium, durante il trattamento e nelle due settimane successive.",
    sources: [
      { label: "RCP Orudis (AIFA)", url: rcp(4066, 23183) },
      { label: "RCP Fastum gel (AIFA)", url: rcp(542, 23417) },
      { label: "PubChem: ketoprofene", url: pubchem(3825) },
    ],
  },
  {
    key: "amlodipina",
    name: "Amlodipina",
    ema: "amlodipine",
    chemistry: "È una 1,4-diidropiridina con due gruppi estere (etilico e metilico) e un anello 2-clorofenilico. Nei medicinali si trova spesso come besilato.",
    molecules: [{ name: "Amlodipina", formula: "C20H25ClN2O5", molarMass: 408.9, pubchemCid: 2162 }],
    action:
      "Blocca l'ingresso degli ioni calcio nelle cellule muscolari dei vasi sanguigni e del cuore. La muscolatura dei vasi si rilassa e la pressione si abbassa.",
    sideEffects: [
      "Le più comuni: sonnolenza, capogiri, mal di testa (soprattutto all'inizio), palpitazioni, vampate di calore, dolore addominale, nausea, gonfiore alle caviglie, edema e stanchezza.",
    ],
    sources: [
      { label: "RCP Norvasc (AIFA)", url: rcp(4995, 27428) },
      { label: "PubChem: amlodipina", url: pubchem(2162) },
    ],
  },
  {
    key: "acido clavulanico + amoxicillina",
    name: "Amoxicillina e acido clavulanico",
    ema: "amoxicillin + clavulanic acid",
    chemistry:
      "Due molecole insieme. L'amoxicillina è una penicillina semisintetica (aminopenicillina) con un anello beta-lattamico. L'acido clavulanico, isolato dal batterio Streptomyces clavuligerus, è anch'esso un beta-lattamico; nei medicinali si trova come sale di potassio.",
    molecules: [
      { name: "Amoxicillina", formula: "C16H19N3O5S", molarMass: 365.4, pubchemCid: 33613 },
      { name: "Acido clavulanico", formula: "C8H9NO5", molarMass: 199.16, pubchemCid: 5280980 },
    ],
    action:
      "L'amoxicillina è un antibiotico: blocca gli enzimi con cui i batteri costruiscono il peptidoglicano della parete cellulare, che si indebolisce fino alla morte del batterio. L'acido clavulanico inattiva alcune beta-lattamasi, gli enzimi batterici che distruggerebbero l'amoxicillina; da solo non ha un effetto antibatterico utile.",
    sideEffects: ["I più comuni: diarrea, nausea e vomito; la nausea è più frequente con le dosi più alte.", "Comune anche la candidosi della pelle e delle mucose."],
    sources: [
      { label: "RCP Augmentin (AIFA)", url: rcp(200, 26089) },
      { label: "PubChem: amoxicillina", url: pubchem(33613) },
      { label: "PubChem: acido clavulanico", url: pubchem(5280980) },
    ],
  },
  {
    key: "omeprazolo",
    name: "Omeprazolo",
    ema: "omeprazole",
    chemistry:
      "È un benzimidazolo con un gruppo solfossido legato a un anello piridinico. È una miscela di due enantiomeri, cioè due forme speculari: una delle due è l'esomeprazolo.",
    molecules: [{ name: "Omeprazolo", formula: "C17H19N3O3S", molarMass: 345.4, pubchemCid: 4594 }],
    action: "Blocca la pompa protonica delle cellule dello stomaco che producono acido: la secrezione acida si riduce. Diventa attivo nell'ambiente acido di queste cellule.",
    sideEffects: ["I più comuni (da 1 a 10 persone su 100): mal di testa, dolore addominale, stitichezza, diarrea, flatulenza, nausea o vomito."],
    sources: [
      { label: "RCP Mepral (AIFA)", url: rcp(3827, 26783) },
      { label: "RCP Nexium (AIFA)", url: rcp(45, 34972) },
      { label: "PubChem: omeprazolo", url: pubchem(4594) },
    ],
  },
  {
    key: "atorvastatina",
    name: "Atorvastatina",
    ema: "atorvastatin",
    chemistry: "È una statina: un acido diidrossieptanoico legato a un anello pirrolico che porta un gruppo fluorofenilico. Nei medicinali si trova come sale di calcio.",
    molecules: [{ name: "Atorvastatina", formula: "C33H35FN2O5", molarMass: 558.6, pubchemCid: 60823 }],
    action: "Inibisce in modo selettivo l'HMG-CoA reduttasi, l'enzima che regola la produzione di colesterolo nel fegato: il colesterolo nel sangue diminuisce.",
    sideEffects: [
      "Comuni: mal di testa; stitichezza, flatulenza, dispepsia, nausea, diarrea; dolori muscolari e articolari, crampi, mal di schiena; mal di gola, sangue dal naso, nasofaringite; reazioni allergiche; aumento della glicemia; alterazioni degli esami del fegato e della creatinchinasi.",
    ],
    sources: [
      { label: "RCP Torvast (AIFA)", url: rcp(4995, 33007) },
      { label: "PubChem: atorvastatina", url: pubchem(60823) },
    ],
  },
  {
    key: "bromexina",
    name: "Bromexina",
    ema: "bromhexine",
    chemistry:
      "È un'anilina con due atomi di bromo e un gruppo cicloesil-metil-amminometile; nei medicinali si trova come cloridrato. È un derivato di sintesi della vasicina, una sostanza di origine vegetale.",
    molecules: [{ name: "Bromexina", formula: "C14H20Br2N2", molarMass: 376.13, pubchemCid: 2442 }],
    action:
      "È un mucolitico: aumenta le secrezioni bronchiali più fluide, riduce la viscosità del muco e attiva le ciglia delle vie respiratorie, così il muco si elimina più facilmente.",
    sideEffects: ["Non comuni: nausea, vomito, diarrea, dolore nella parte alta dell'addome.", "Rare: reazioni allergiche, eruzioni cutanee, orticaria."],
    sources: [
      { label: "RCP Bisolvon (AIFA)", url: rcp(2372, 21004) },
      { label: "PubChem: bromexina", url: pubchem(2442) },
    ],
  },
  {
    key: "levotiroxina",
    name: "Levotiroxina",
    ema: "levothyroxine",
    chemistry:
      "È la tiroxina (T4), l'ormone della tiroide, nella sua forma L: un amminoacido derivato della fenilalanina con quattro atomi di iodio. Nei medicinali si trova come sale sodico.",
    molecules: [{ name: "Levotiroxina", formula: "C15H11I4NO4", molarMass: 776.87, pubchemCid: 5819 }],
    action:
      "Sostituisce o integra l'ormone prodotto dalla tiroide: aumenta il consumo di ossigeno e il metabolismo di carboidrati, grassi e proteine, sostiene crescita e sviluppo e frena la secrezione della tireotropina (TSH) dell'ipofisi.",
    sideEffects: [
      "Se la dose supera quella tollerata, o se all'inizio sale troppo in fretta, compaiono i sintomi dell'ipertiroidismo: battito accelerato o irregolare, palpitazioni, mal di testa, tremore, irrequietezza, insonnia, sudorazione, vampate, perdita di peso, diarrea, alterazioni del ciclo mestruale.",
    ],
    sources: [
      { label: "RCP Eutirox (AIFA)", url: rcp(2392, 24402) },
      { label: "PubChem: levotiroxina", url: pubchem(5819) },
    ],
  },
  {
    key: "metformina",
    name: "Metformina",
    ema: "metformin",
    chemistry: "È una biguanide con due gruppi metile (1,1-dimetilbiguanide). Nei medicinali si trova come cloridrato.",
    molecules: [{ name: "Metformina", formula: "C4H11N5", molarMass: 129.16, pubchemCid: 4091 }],
    action:
      "Abbassa la glicemia senza stimolare la secrezione di insulina, per questo da sola non provoca ipoglicemia: riduce la produzione di glucosio da parte del fegato e ne favorisce l'utilizzo da parte dei tessuti.",
    sideEffects: [
      "Molto comuni, soprattutto all'inizio: nausea, vomito, diarrea, dolore addominale e perdita di appetito, che di solito passano da soli.",
      "Comuni: alterazione del gusto e carenza di vitamina B12.",
      "Molto rara, ma grave: acidosi lattica.",
    ],
    sources: [
      { label: "RCP Glucophage (AIFA)", url: rcp(794, 17758) },
      { label: "PubChem: metformina", url: pubchem(4091) },
    ],
  },
  {
    key: "econazolo",
    name: "Econazolo",
    ema: "econazole",
    chemistry: "È un derivato dell'imidazolo con tre atomi di cloro distribuiti su due anelli benzenici. Nei medicinali si trova come nitrato.",
    molecules: [{ name: "Econazolo", formula: "C18H15Cl3N2O", molarMass: 381.7, pubchemCid: 3198 }],
    action: "È un antimicotico per la pelle: agisce sulla membrana delle cellule dei funghi e sulla sua sintesi, la rende permeabile e ne blocca il metabolismo.",
    sideEffects: ["I più comuni negli studi (circa 1 persona su 100): prurito, bruciore della pelle e dolore dove si applica."],
    sources: [
      { label: "RCP Pevaryl (AIFA)", url: rcp(4974, 23603) },
      { label: "PubChem: econazolo", url: pubchem(3198) },
    ],
  },
  {
    key: "ketotifene",
    name: "Ketotifene",
    ema: "ketotifen",
    chemistry: "È una molecola triciclica che contiene un anello tiofenico (con un atomo di zolfo) e un gruppo metilpiperidinico.",
    molecules: [{ name: "Ketotifene", formula: "C19H19NOS", molarMass: 309.4, pubchemCid: 3827 }],
    action: "È un antistaminico: blocca i recettori H1 dell'istamina e stabilizza i mastociti, riducendo il rilascio dell'istamina e degli altri mediatori dell'allergia.",
    sideEffects: [
      "Collirio, comuni: irritazione e dolore all'occhio, piccole lesioni superficiali della cornea (cheratite ed erosione puntata).",
      "Per bocca: sonnolenza, sedazione, capogiri o bocca secca, di solito all'inizio del trattamento; comuni, soprattutto nei bambini, eccitazione, irritabilità, insonnia e nervosismo.",
    ],
    sources: [
      { label: "RCP Ketoftil collirio (AIFA)", url: rcp(533, 29278) },
      { label: "RCP Zaditen (AIFA)", url: rcp(4375, 24574) },
      { label: "PubChem: ketotifene", url: pubchem(3827) },
    ],
  },
  {
    key: "triamcinolone acetonide",
    name: "Triamcinolone acetonide",
    ema: "triamcinolone acetonide",
    chemistry: "È un corticosteroide di sintesi (glucocorticoide) con un atomo di fluoro: l'acetonide in posizione 16-17 del triamcinolone.",
    molecules: [{ name: "Triamcinolone acetonide", formula: "C24H31FO6", molarMass: 434.5, pubchemCid: 6436 }],
    action:
      "È un corticosteroide con azione antinfiammatoria e antiallergica, circa 8 volte più potente del prednisone. Nello spray nasale agisce sulla mucosa del naso: il miglioramento non è immediato, in alcune persone si nota entro il primo giorno.",
    sideEffects: ["Spray nasale: gli effetti più comuni riguardano naso e gola. Comuni: sindrome influenzale, faringite, rinite, mal di testa, bronchite, sangue dal naso, tosse."],
    sources: [
      { label: "RCP Nasacort (AIFA)", url: rcp(2372, 33938) },
      { label: "PubChem: triamcinolone acetonide", url: pubchem(6436) },
    ],
  },
  {
    key: "ondansetrone",
    name: "Ondansetrone",
    ema: "ondansetron",
    chemistry: "È un derivato del carbazolo con un gruppo metilimidazolico. Nei medicinali si trova come cloridrato.",
    molecules: [{ name: "Ondansetrone", formula: "C18H19N3O", molarMass: 293.4, pubchemCid: 4595 }],
    action:
      "Blocca in modo selettivo i recettori 5-HT3 della serotonina. Chemioterapia e radioterapia possono liberare serotonina nell'intestino e scatenare il riflesso del vomito: l'ondansetrone lo inibisce.",
    sideEffects: ["Molto comune: mal di testa.", "Comuni: sensazione di calore o vampate, stitichezza; con l'iniezione, reazioni nel punto di iniezione."],
    sources: [
      { label: "RCP Zofran (AIFA)", url: rcp(1392, 27612) },
      { label: "PubChem: ondansetrone", url: pubchem(4595) },
    ],
  },
  {
    key: "pantoprazolo",
    name: "Pantoprazolo",
    ema: "pantoprazole",
    chemistry: "È un benzimidazolo con un gruppo difluorometossi e un ponte solfinilico verso un anello piridinico. Nei medicinali si trova come sale sodico.",
    molecules: [{ name: "Pantoprazolo", formula: "C16H15F2N3O4S", molarMass: 383.4, pubchemCid: 4679 }],
    action: "Blocca le pompe protoniche delle cellule dello stomaco e riduce la produzione di acido cloridrico. Diventa attivo nell'ambiente acido di queste cellule.",
    sideEffects: [
      "Circa 5 persone su 100 hanno effetti indesiderati. Comuni: polipi benigni delle ghiandole dello stomaco (ghiandole fundiche).",
      "Non comuni: diarrea, nausea o vomito, gonfiore, stitichezza, bocca secca, dolore addominale, aumento degli enzimi del fegato, eruzioni cutanee, prurito, disturbi del sonno.",
    ],
    sources: [
      { label: "RCP Pantorc (AIFA)", url: rcp(348, 31981) },
      { label: "PubChem: pantoprazolo", url: pubchem(4679) },
    ],
  },
  {
    key: "xilometazolina",
    name: "Xilometazolina",
    ema: "xylometazoline",
    chemistry: "È un'imidazolina legata a un anello benzenico che porta un gruppo terz-butile e due metili. Nei medicinali si trova come cloridrato.",
    molecules: [{ name: "Xilometazolina", formula: "C16H24N2", molarMass: 244.37, pubchemCid: 5709 }],
    action: "È un simpaticomimetico: stimola i recettori alfa-adrenergici della mucosa nasale e restringe i vasi sanguigni, così naso e faringe si decongestionano.",
    sideEffects: ["Comuni: secchezza o fastidio nel naso, bruciore dove si applica, mal di testa, nausea.", "Non comune: sangue dal naso."],
    caution: "Non va usata per più di 7 giorni di seguito: l'uso prolungato o eccessivo può causare congestione di rimbalzo e danneggiare la mucosa del naso.",
    sources: [
      { label: "RCP Rinaadvance (AIFA)", url: rcp(1136, 15598) },
      { label: "PubChem: xilometazolina", url: pubchem(5709) },
    ],
  },
  {
    key: "tetrizolina",
    name: "Tetrizolina",
    ema: "tetryzoline",
    chemistry: "È un'imidazolina legata a un anello tetraidronaftalenico. Nei medicinali si trova come cloridrato.",
    molecules: [{ name: "Tetrizolina", formula: "C13H16N2", molarMass: 200.28, pubchemCid: 5419 }],
    action: "È un'ammina simpaticomimetica: usata sull'occhio restringe i vasi sanguigni e riduce rossore e gonfiore delle mucose infiammate.",
    sideEffects: ["Talvolta: dilatazione della pupilla, aumento della pressione nell'occhio, nausea, mal di testa.", "Raramente: reazioni allergiche."],
    caution: "Non va usata per più di 4 giorni di seguito, né da chi ha il glaucoma o altre gravi malattie dell'occhio.",
    sources: [
      { label: "RCP Stilla Decongestionante (AIFA)", url: rcp(219, 15001) },
      { label: "PubChem: tetrizolina", url: pubchem(5419) },
    ],
  },
  {
    key: "salbutamolo",
    name: "Salbutamolo",
    ema: "salbutamol",
    chemistry: "È una feniletanolammina con un gruppo terz-butile sull'azoto. Nei medicinali si trova spesso come solfato.",
    molecules: [{ name: "Salbutamolo", formula: "C13H21NO3", molarMass: 239.31, pubchemCid: 2083 }],
    action: "Stimola in modo selettivo i recettori beta-2 della muscolatura dei bronchi, che si rilassa: i bronchi si dilatano e il respiro migliora in caso di broncospasmo.",
    sideEffects: ["Comuni: tremore, mal di testa, battito accelerato.", "Non comuni: palpitazioni, irritazione di bocca e gola, crampi muscolari."],
    sources: [
      { label: "RCP Ventolin (AIFA)", url: rcp(200, 22984) },
      { label: "PubChem: salbutamolo", url: pubchem(2083) },
    ],
  },
  {
    key: "cetirizina",
    name: "Cetirizina",
    ema: "cetirizine",
    chemistry:
      "È un derivato della piperazina con un gruppo (4-clorofenil)fenilmetile e una catena acida. È il metabolita attivo dell'idrossizina. Nei medicinali si trova come dicloridrato.",
    molecules: [{ name: "Cetirizina", formula: "C21H25ClN2O3", molarMass: 388.9, pubchemCid: 2678 }],
    action: "Blocca in modo potente e selettivo i recettori H1 periferici dell'istamina: riduce i sintomi dell'allergia.",
    sideEffects: ["I più frequenti negli studi: sonnolenza, di solito lieve o moderata, stanchezza, bocca secca, mal di testa e capogiri."],
    sources: [
      { label: "RCP Zirtec (AIFA)", url: rcp(176, 26894) },
      { label: "PubChem: cetirizina", url: pubchem(2678) },
    ],
  },
  {
    key: "esomeprazolo",
    name: "Esomeprazolo",
    ema: "esomeprazole",
    chemistry: "È l'enantiomero S dell'omeprazolo: stessa formula, ma una sola delle due forme speculari. Nei medicinali si trova come sale di magnesio o sodico.",
    molecules: [{ name: "Esomeprazolo", formula: "C17H19N3O3S", molarMass: 345.4, pubchemCid: 9568614 }],
    action: "Agisce come l'omeprazolo: blocca la pompa acida delle cellule dello stomaco e riduce la secrezione acida.",
    sideEffects: ["Tra i più comuni: mal di testa, dolore addominale, diarrea e nausea."],
    sources: [
      { label: "RCP Nexium (AIFA)", url: rcp(45, 34972) },
      { label: "PubChem: esomeprazolo", url: pubchem(9568614) },
    ],
  },
  {
    key: "lansoprazolo",
    name: "Lansoprazolo",
    ema: "lansoprazole",
    chemistry: "È un benzimidazolo con un gruppo solfossido e un anello piridinico che porta un gruppo trifluoroetossi.",
    molecules: [{ name: "Lansoprazolo", formula: "C16H14F3N3O2S", molarMass: 369.4, pubchemCid: 3883 }],
    action: "Inibisce la pompa protonica (H+/K+-ATPasi) delle cellule dello stomaco, l'ultimo passaggio della produzione di acido. L'effetto è reversibile e dipende dalla dose.",
    sideEffects: [
      "Comuni: mal di testa, capogiri; nausea, diarrea, mal di stomaco, stitichezza, vomito, flatulenza, bocca o gola secca; polipi benigni delle ghiandole dello stomaco; aumento degli enzimi del fegato; orticaria, prurito, eruzioni cutanee; stanchezza.",
    ],
    sources: [
      { label: "RCP Lansox (AIFA)", url: rcp(348, 28600) },
      { label: "PubChem: lansoprazolo", url: pubchem(3883) },
    ],
  },
  {
    key: "ramipril",
    name: "Ramipril",
    ema: "ramipril",
    chemistry: "È un dipeptide modificato che funziona da profarmaco: nell'organismo l'estere etilico viene idrolizzato e si forma il ramiprilato, la forma attiva.",
    molecules: [{ name: "Ramipril", formula: "C23H32N2O5", molarMass: 416.5, pubchemCid: 5362129 }],
    action:
      "Il ramiprilato blocca l'enzima di conversione dell'angiotensina (ACE): si forma meno angiotensina II, una sostanza che restringe i vasi sanguigni. I vasi si dilatano e la pressione si abbassa.",
    sideEffects: [
      "Comuni: tosse secca, mal di testa, capogiri, pressione bassa anche alzandosi in piedi, svenimento, aumento del potassio nel sangue, nausea, diarrea, vomito e altri disturbi digestivi, eruzioni cutanee, dolore al petto, stanchezza.",
    ],
    caution: "Tra le reazioni avverse gravi c'è l'angioedema, un gonfiore che può interessare viso, labbra, lingua o gola.",
    sources: [
      { label: "RCP Triatec (AIFA)", url: rcp(8055, 27161) },
      { label: "PubChem: ramipril", url: pubchem(5362129) },
    ],
  },
  {
    key: "bisoprololo",
    name: "Bisoprololo",
    ema: "bisoprolol",
    chemistry:
      "Ha la struttura tipica di molti betabloccanti: un anello benzenico legato con un ponte etereo a una catena con un alcol e un'ammina secondaria (isopropilammina). Nei medicinali si trova come fumarato.",
    molecules: [{ name: "Bisoprololo", formula: "C18H31NO4", molarMass: 325.4, pubchemCid: 2405 }],
    action: "È un betabloccante selettivo per i recettori beta-1: riduce la frequenza cardiaca e il lavoro del cuore, e quindi il consumo di ossigeno del muscolo cardiaco.",
    sideEffects: [
      "Molto comune: battito rallentato (bradicardia).",
      "Comuni: peggioramento dell'insufficienza cardiaca, capogiri, mal di testa, nausea, vomito, diarrea, stitichezza, mani e piedi freddi o formicolanti, pressione bassa, stanchezza.",
    ],
    sources: [
      { label: "RCP Concor (AIFA)", url: rcp(28, 26573) },
      { label: "PubChem: bisoprololo", url: pubchem(2405) },
    ],
  },
  {
    key: "rosuvastatina",
    name: "Rosuvastatina",
    ema: "rosuvastatin",
    chemistry:
      "È una statina: un acido diidrossieptenoico legato a un anello pirimidinico con un gruppo fluorofenilico e un gruppo solfonammidico. Nei medicinali si trova come sale di calcio.",
    molecules: [{ name: "Rosuvastatina", formula: "C22H28FN3O6S", molarMass: 481.5, pubchemCid: 446157 }],
    action: "Inibisce in modo selettivo l'HMG-CoA reduttasi, l'enzima che regola la produzione di colesterolo; agisce soprattutto nel fegato e riduce il colesterolo nel sangue.",
    sideEffects: ["Comuni: mal di testa, capogiri, stitichezza, nausea, dolore addominale, dolori muscolari, debolezza; diabete, con una frequenza che dipende dai fattori di rischio."],
    sources: [
      { label: "RCP Crestor (AIFA)", url: rcp(45, 35885) },
      { label: "PubChem: rosuvastatina", url: pubchem(446157) },
    ],
  },
  {
    key: "colecalciferolo",
    name: "Colecalciferolo (vitamina D3)",
    ema: "colecalciferol",
    chemistry:
      "È la vitamina D3, un secosteroide, cioè uno steroide con un anello aperto. È una forma inattiva: il fegato la trasforma in calcifediolo e il rene in calcitriolo, il metabolita attivo.",
    molecules: [{ name: "Colecalciferolo", formula: "C27H44O", molarMass: 384.6, pubchemCid: 5280795 }],
    action:
      "Corregge la carenza di vitamina D e aumenta l'assorbimento intestinale di calcio e fosforo; agisce insieme all'ormone paratiroideo sul metabolismo di calcio e fosforo.",
    sideEffects: [
      "Non comuni: aumento del calcio nel sangue e nelle urine (ipercalcemia e ipercalciuria).",
      "Gli altri effetti indicati nell'RCP sono rari o di frequenza non nota.",
    ],
    caution: "Un eccesso di vitamina D può causare ipercalcemia.",
    sources: [
      { label: "RCP Dibase (AIFA)", url: rcp(972, 36635) },
      { label: "PubChem: colecalciferolo", url: pubchem(5280795) },
    ],
  },
  {
    key: "diclofenac",
    name: "Diclofenac",
    ema: "diclofenac",
    chemistry: "È un acido carbossilico derivato dell'acido fenilacetico, con un gruppo 2,6-dicloroanilinico. Nei medicinali si trova spesso come sale sodico.",
    molecules: [{ name: "Diclofenac", formula: "C14H11Cl2NO2", molarMass: 296.1, pubchemCid: 3033 }],
    action:
      "È un antinfiammatorio non steroideo (FANS): inibisce la sintesi delle prostaglandine, che hanno un ruolo importante in infiammazione, dolore e febbre. Ha effetto antinfiammatorio, analgesico e antipiretico.",
    sideEffects: [
      "Comuni: mal di testa, capogiri, vertigini; nausea, vomito, diarrea, dispepsia, dolore addominale, flatulenza, calo dell'appetito; aumento delle transaminasi; eruzioni cutanee.",
    ],
    caution: "Non va usato in caso di ulcera, emorragia o perforazione gastrointestinale in atto.",
    sources: [
      { label: "RCP Voltaren (AIFA)", url: rcp(114, 23181) },
      { label: "PubChem: diclofenac", url: pubchem(3033) },
    ],
  },
  {
    key: "naprossene",
    name: "Naprossene",
    ema: "naproxen",
    chemistry: "È un derivato del naftalene con un gruppo metossi e una catena di acido propionico: un FANS derivato dell'acido propionico. Nei medicinali si trova anche come sale sodico.",
    molecules: [{ name: "Naprossene", formula: "C14H14O3", molarMass: 230.26, pubchemCid: 156391 }],
    action: "Inibisce in modo reversibile l'enzima cicloossigenasi, che trasforma l'acido arachidonico nelle prostaglandine: riduce infiammazione e dolore.",
    sideEffects: [
      "I più comuni riguardano stomaco e intestino: nausea, vomito, diarrea, flatulenza, stitichezza, dispepsia, dolore addominale, bruciore.",
      "Può dare stordimento, sonnolenza o vertigini.",
    ],
    caution: "Come gli altri FANS può causare ulcere, perforazioni o sanguinamenti gastrointestinali, a volte fatali, soprattutto negli anziani.",
    sources: [
      { label: "RCP Synflex (AIFA)", url: rcp(107, 24722) },
      { label: "PubChem: naprossene", url: pubchem(156391) },
    ],
  },
  {
    key: "loratadina",
    name: "Loratadina",
    ema: "loratadine",
    chemistry: "È un antistaminico triciclico: una benzocicloeptapiridina con un atomo di cloro e un gruppo piperidinico che porta un estere etilico.",
    molecules: [{ name: "Loratadina", formula: "C22H23ClN2O2", molarMass: 382.9, pubchemCid: 3957 }],
    action: "Blocca in modo selettivo i recettori H1 periferici dell'istamina. Alle dosi raccomandate, nella maggior parte delle persone non ha effetti sedativi rilevanti.",
    sideEffects: ["I più comuni negli studi, più frequenti che con il placebo: sonnolenza (1,2%), mal di testa (0,6%), aumento dell'appetito (0,5%) e insonnia (0,1%)."],
    sources: [
      { label: "RCP Clarityn (AIFA)", url: rcp(22, 27075) },
      { label: "PubChem: loratadina", url: pubchem(3957) },
    ],
  },
  {
    key: "acetilcisteina",
    name: "Acetilcisteina",
    ema: "acetylcysteine",
    chemistry: "È il derivato N-acetilato dell'amminoacido L-cisteina e contiene un gruppo tiolico (–SH).",
    molecules: [{ name: "Acetilcisteina", formula: "C5H9NO3S", molarMass: 163.2, pubchemCid: 12035 }],
    action:
      "Rende il muco più fluido: scompone i complessi di mucoproteine e di acidi nucleici che lo rendono denso e vischioso. Si usa anche come antidoto nell'avvelenamento da paracetamolo.",
    sideEffects: ["I più frequenti sono reazioni allergiche: orticaria, eruzioni cutanee, prurito. La frequenza non è nota."],
    sources: [
      { label: "RCP Fluimucil (AIFA)", url: rcp(7158, 20582) },
      { label: "PubChem: acetilcisteina", url: pubchem(12035) },
    ],
  },
  {
    key: "loperamide",
    name: "Loperamide",
    ema: "loperamide",
    chemistry: "È un derivato sintetico della piperidina con un gruppo clorofenilico. Nei medicinali si trova come cloridrato.",
    molecules: [{ name: "Loperamide", formula: "C29H33ClN2O2", molarMass: 477, pubchemCid: 3955 }],
    action:
      "Si lega ai recettori oppioidi dell'intestino e riduce il rilascio di acetilcolina e prostaglandine: i movimenti dell'intestino rallentano e il suo contenuto vi resta più a lungo.",
    sideEffects: ["I più comuni negli studi sulla diarrea acuta: stitichezza (2,7%), flatulenza (1,7%), mal di testa (1,2%), nausea (1,1%)."],
    sources: [
      { label: "RCP Imodium (AIFA)", url: rcp(6015, 23673) },
      { label: "PubChem: loperamide", url: pubchem(3955) },
    ],
  },
  {
    key: "amoxicillina",
    name: "Amoxicillina",
    ema: "amoxicillin",
    chemistry:
      "È una penicillina semisintetica (aminopenicillina): un anello beta-lattamico unito a un anello tiazolidinico, con una catena laterale che contiene un gruppo 4-idrossifenile.",
    molecules: [{ name: "Amoxicillina", formula: "C16H19N3O5S", molarMass: 365.4, pubchemCid: 33613 }],
    action: "È un antibiotico beta-lattamico ad ampio spettro, attivo su molti batteri Gram-positivi e Gram-negativi: impedisce la costruzione della parete cellulare dei batteri.",
    sideEffects: ["Comuni: diarrea, nausea, infiammazione della lingua o della bocca, eruzioni cutanee."],
    sources: [
      { label: "RCP Velamox (AIFA)", url: rcp(3582, 23097) },
      { label: "PubChem: amoxicillina", url: pubchem(33613) },
    ],
  },
];

const BY_KEY = new Map(INGREDIENTS.map((i) => [i.key, i]));

export function ingredientInfo(key: string | null | undefined): IngredientInfo | null {
  return key ? (BY_KEY.get(key) ?? null) : null;
}

const sentences = (s: string) => s.match(/[^.]+\.(?=\s|$)/g)?.map((x) => x.trim()) ?? [s];

/** Due frasi per il riquadro della card: la prima davvero informativa della chimica e la prima dell'azione */
export function ingredientSummary(info: IngredientInfo): string {
  const chem = sentences(info.chemistry).find((x) => x.length >= 40) ?? sentences(info.chemistry)[0];
  return `${chem} ${sentences(info.action)[0]}`;
}

/** La formula con i pedici: C8H9NO2 → C₈H₉NO₂ */
export function formulaWithSubscripts(formula: string): string {
  const sub = "₀₁₂₃₄₅₆₇₈₉";
  return formula.replace(/\d/g, (d) => sub[Number(d)]!);
}
