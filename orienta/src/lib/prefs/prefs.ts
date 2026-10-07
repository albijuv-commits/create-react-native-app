import { z } from "zod";

export const PREFS_STORAGE_KEY = "orienta:prefs";

export const prefsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]).default("system"),
  textSize: z.enum(["normal", "large", "xlarge"]).default("normal"),
  defaultCity: z.string().trim().max(80).default(""),
});

export type Prefs = z.infer<typeof prefsSchema>;

export const DEFAULT_PREFS: Prefs = prefsSchema.parse({});

/** Legge le preferenze da una stringa JSON; qualsiasi valore non valido torna al default. */
export function parsePrefs(raw: string | null | undefined): Prefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const result = prefsSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function resolveTheme(theme: Prefs["theme"], systemPrefersDark: boolean): "light" | "dark" {
  if (theme === "system") return systemPrefersDark ? "dark" : "light";
  return theme;
}

/**
 * Script inline eseguito prima del primo paint: applica tema e dimensione del testo
 * senza flash. Volutamente minimale e senza dipendenze.
 */
export const PREFS_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  PREFS_STORAGE_KEY,
)})||"{}");var t=p.theme;var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.dataset.theme=d?"dark":"light";if(p.textSize==="large"||p.textSize==="xlarge")r.dataset.textSize=p.textSize;}catch(e){}})();`;
