import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearSummaryForDoctors } from "./doctor-handoff";
import { forgetSessions } from "./history";
import { clearMedicineLists } from "./medicine-lists";
import { deleteSummaryPdfs } from "./summary-pdf";

/**
 * «Elimina tutti i miei dati»: tutto ciò che Orienta ha conservato su questo telefono.
 * - storico delle sessioni, preferenze e città predefinita, preferiti e confronto del Mercato
 *   (AsyncStorage, tutte le chiavi che iniziano con «orienta:»);
 * - il riepilogo per il medico passato alla sezione Medici (solo in memoria);
 * - un'intervista lasciata a metà (in memoria): chi la mostra si iscrive con onEraseAll;
 * - eventuali PDF del riepilogo rimasti nella cartella temporanea (expo-print li crea in «Print»).
 * Le preferenze nel tema le riporta ai valori di partenza chi chiama, con resetPrefs.
 * Sul server non c'è niente da eliminare: Orienta non conserva dati delle persone.
 */
export const STORAGE_PREFIX = "orienta:";

export type ErasePart = "dati salvati sul telefono" | "PDF temporanei";

const listeners = new Set<() => void>();

/** Avvisa le schermate aperte (per esempio l'intervista) che i dati sono stati eliminati */
export function onEraseAll(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function eraseAllMyData(): Promise<{ failed: ErasePart[] }> {
  const failed: ErasePart[] = [];
  clearSummaryForDoctors();
  forgetSessions();
  try {
    await clearMedicineLists();
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(STORAGE_PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch {
    failed.push("dati salvati sul telefono");
  }
  try {
    deleteSummaryPdfs();
  } catch {
    failed.push("PDF temporanei");
  }
  listeners.forEach((l) => l());
  return { failed };
}
