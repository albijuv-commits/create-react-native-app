import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Il catalogo dei medicinali in SQLite (Drizzle ORM). Una riga per confezione, identificata dal
 * codice AIC a 9 cifre. I dati arrivano dagli Open Data dell'AIFA (licenza CC BY 4.0).
 */
export const medicines = sqliteTable(
  "medicines",
  {
    aic: text("aic").primaryKey(),
    /** Nome commerciale leggibile («Tachipirina») e quello ufficiale («TACHIPIRINA») */
    name: text("name").notNull(),
    officialName: text("official_name").notNull(),
    /** Dosaggio e confezione, dalla descrizione AIFA ripulita */
    description: text("description").notNull(),
    company: text("company").notNull(),
    form: text("form").notNull(),
    formFamily: text("form_family").notNull(),
    activeIngredient: text("active_ingredient").notNull(),
    /** Il principio attivo senza sali né idrati, per raggruppare marchi e aziende (ingredient-key.ts) */
    ingredientKey: text("ingredient_key"),
    /** Chiave di dosaggio confrontabile («875 mg + 125 mg»), se riconosciuta */
    strength: text("strength"),
    atc: text("atc"),
    atcGroup: text("atc_group"),
    atcClass: text("atc_class"),
    supplyCode: text("supply_code"),
    /** «A» (rimborsabile SSN) o «H» (ospedaliero) secondo le liste AIFA; null altrimenti */
    reimbursementClass: text("reimbursement_class"),
    price: real("price"),
    priceDate: text("price_date"),
    priceSource: text("price_source"),
    referencePrice: real("reference_price"),
    units: integer("units"),
    equivalenceGroup: text("equivalence_group"),
    leafletUrl: text("leaflet_url"),
    /**
     * Foto con licenza libera (data/medicines/photos.json): indirizzo, autore e licenza, pagina della
     * fonte, cosa mostra e Paese in cui è venduta la confezione fotografata. Senza foto si usa
     * l'illustrazione della forma.
     */
    imageUrl: text("image_url"),
    imageCredit: text("image_credit"),
    imageSource: text("image_source"),
    imageCaption: text("image_caption"),
    imageCountry: text("image_country"),
    searchText: text("search_text").notNull(),
  },
  (t) => [
    index("medicines_name_idx").on(t.name),
    index("medicines_form_idx").on(t.formFamily),
    index("medicines_atc_idx").on(t.atcGroup),
    index("medicines_supply_idx").on(t.supplyCode),
    index("medicines_group_idx").on(t.equivalenceGroup),
    index("medicines_price_idx").on(t.price),
    index("medicines_ingredient_idx").on(t.ingredientKey, t.strength, t.formFamily),
  ],
);

export const catalogMeta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Medicine = typeof medicines.$inferSelect;
export type NewMedicine = typeof medicines.$inferInsert;
