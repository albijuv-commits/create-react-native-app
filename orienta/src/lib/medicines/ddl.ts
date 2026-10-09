/**
 * Le tabelle del catalogo, nella stessa forma dello schema Drizzle (schema.ts). Un test controlla
 * che le colonne coincidano. Serve sia allo script di importazione sia al catalogo di esempio
 * creato in memoria quando il file del database non c'è.
 */
export const MEDICINES_DDL = `
CREATE TABLE IF NOT EXISTS medicines (
  aic TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  official_name TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  form TEXT NOT NULL,
  form_family TEXT NOT NULL,
  active_ingredient TEXT NOT NULL,
  ingredient_key TEXT,
  strength TEXT,
  atc TEXT,
  atc_group TEXT,
  atc_class TEXT,
  supply_code TEXT,
  reimbursement_class TEXT,
  price REAL,
  price_date TEXT,
  price_source TEXT,
  reference_price REAL,
  units INTEGER,
  equivalence_group TEXT,
  leaflet_url TEXT,
  image_url TEXT,
  image_credit TEXT,
  image_source TEXT,
  image_caption TEXT,
  image_country TEXT,
  search_text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS medicines_name_idx ON medicines (name);
CREATE INDEX IF NOT EXISTS medicines_form_idx ON medicines (form_family);
CREATE INDEX IF NOT EXISTS medicines_atc_idx ON medicines (atc_group);
CREATE INDEX IF NOT EXISTS medicines_supply_idx ON medicines (supply_code);
CREATE INDEX IF NOT EXISTS medicines_group_idx ON medicines (equivalence_group);
CREATE INDEX IF NOT EXISTS medicines_price_idx ON medicines (price);
CREATE INDEX IF NOT EXISTS medicines_ingredient_idx ON medicines (ingredient_key, strength, form_family);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
