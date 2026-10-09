/**
 * Minuscolo, senza accenti né punteggiatura, spazi singoli:
 * «Ho un po' di FEBBRE, dall'altro ieri!» → «ho un po di febbre dall altro ieri».
 * È la forma su cui lavorano la ricerca, il riconoscimento dei sintomi e i segnali d'allarme.
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
