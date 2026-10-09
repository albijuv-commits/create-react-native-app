import { connection } from "next/server";
import { formatItalianDate } from "@/lib/conditions/catalog";
import { catalogInfo } from "@/lib/medicines/queries";
import { CatalogSource, ExampleDataNotice } from "./notices";

/*
 * Il catalogo si sceglie all'avvio del server (database AIFA o campione di esempio): etichetta,
 * date e prezzi si leggono a ogni richiesta, non durante la build. better-sqlite3 è sincrono,
 * quindi senza connection() le query finirebbero nella pagina prerenderizzata.
 */

/** «DATI DI ESEMPIO» quando il catalogo è il campione */
export async function ExampleDataLabel() {
  await connection();
  const info = catalogInfo();
  return info.source === "esempio" ? <ExampleDataNotice count={info.count} /> : null;
}

/** Fonte e date dei dati AIFA */
export async function CatalogSourceLine() {
  await connection();
  return <CatalogSource info={catalogInfo()} />;
}

/** La frase sulle date del catalogo nella pagina Fonti */
export async function CatalogDates() {
  await connection();
  const info = catalogInfo();
  const day = (iso: string | null | undefined) => (iso ? formatItalianDate(iso) : null);
  return info.source === "esempio"
    ? " In questa installazione si vede il campione di esempio."
    : ` Anagrafica al ${day(info.registryDate)}, liste di Classe A al ${day(info.classADate)}, lista di trasparenza al ${day(info.transparencyDate)}.`;
}
