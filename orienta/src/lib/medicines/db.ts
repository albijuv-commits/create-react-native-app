import "server-only";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";
import seed from "@data/medicines/seed.json";
import { MEDICINES_DDL } from "./ddl";
import * as schema from "./schema";

export type MedicinesDb = BetterSQLite3Database<typeof schema>;

/**
 * Il catalogo dei medicinali. Se c'è il database importato dall'AIFA (npm run import:aifa) si usa
 * quello, in sola lettura; altrimenti, o con MEDICINES_SOURCE=esempio, si crea in memoria il
 * campione di esempio (data/medicines/seed.json), sempre etichettato come tale nell'app.
 */
function open(): MedicinesDb {
  const file = process.env.MEDICINES_DB_PATH?.trim() || path.join(process.cwd(), "data", "medicines", "orienta.db");
  const forceSeed = process.env.MEDICINES_SOURCE?.trim().toLowerCase() === "esempio";
  // Il percorso si sceglie all'avvio: il database va distribuito con l'app, non tracciato nel build
  if (!forceSeed && existsSync(/*turbopackIgnore: true*/ file)) {
    return drizzle(new Database(file, { readonly: true, fileMustExist: true }), { schema });
  }
  const sqlite = new Database(":memory:");
  sqlite.exec(MEDICINES_DDL);
  const db = drizzle(sqlite, { schema });
  db.insert(schema.medicines).values(seed.medicines as schema.NewMedicine[]).run();
  db.insert(schema.catalogMeta)
    .values(Object.entries(seed.meta).map(([key, value]) => ({ key, value: String(value) })))
    .run();
  return db;
}

let instance: MedicinesDb | null = null;

export function medicinesDb(): MedicinesDb {
  instance ??= open();
  return instance;
}
