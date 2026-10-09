/**
 * L'email precompilata per chiedere un appuntamento. La persona la rivede e la modifica nella
 * propria app di posta: Orienta non invia nulla.
 */

export interface DoctorEmail {
  subject: string;
  body: string;
}

/**
 * Alcune app di posta troncano o rifiutano i link mailto troppo lunghi (circa 2000 caratteri in
 * tutto): il limite vale per il testo come finisce nel link, cioè codificato.
 */
export const MAILTO_BODY_LIMIT = 1800;

const SHORTENED_NOTE = "(Riepilogo abbreviato: il testo completo lo porto alla visita.)";

export function buildDoctorEmail({ specialtyLabel, summary }: { specialtyLabel: string | null; summary: string | null }): DoctorEmail {
  const visit = specialtyLabel ? `una visita (${specialtyLabel.toLowerCase()})` : "una visita";
  const lines = ["Buongiorno,", "", `vorrei chiedere un appuntamento per ${visit}. Potete indicarmi le prime disponibilità e come prenotare?`, ""];
  if (summary?.trim()) {
    lines.push("Qui sotto trovate un riepilogo dei miei sintomi, preparato con l'app Orienta. Non è una diagnosi.", "", summary.trim(), "");
  }
  lines.push("Grazie, cordiali saluti", "[Nome e cognome]", "[Numero di telefono]");
  return { subject: summary?.trim() ? "Richiesta di appuntamento, con riepilogo dei sintomi" : "Richiesta di appuntamento", body: lines.join("\n") };
}

/** Quanto occupa il testo nel link: a capo CRLF e caratteri codificati (uno spazio vale 3, una lettera accentata 6) */
export function encodedLength(text: string): number {
  return encodeURIComponent(text.replace(/\r?\n/g, "\r\n")).length;
}

/** Accorcia il riepilogo (a righe intere) finché il testo codificato sta nel limite del link mailto */
export function fitBody(body: string, limit = MAILTO_BODY_LIMIT): string {
  if (encodedLength(body) <= limit) return body;
  const closingStart = body.lastIndexOf("\nGrazie, cordiali saluti");
  const closing = closingStart >= 0 ? body.slice(closingStart) : "";
  const head = closingStart >= 0 ? body.slice(0, closingStart) : body;
  const shortened = (lines: readonly string[]) => `${lines.join("\n").trimEnd()}\n\n${SHORTENED_NOTE}\n${closing}`;
  const kept: string[] = [];
  for (const line of head.split("\n")) {
    if (encodedLength(shortened([...kept, line])) > limit) break;
    kept.push(line);
  }
  return shortened(kept);
}

/** RFC 6068: l'indirizzo resta in chiaro (è già validato), oggetto e testo sono codificati, a capo = CRLF */
export function mailtoHref(to: string, email: DoctorEmail): string {
  const body = fitBody(email.body).replace(/\r?\n/g, "\r\n");
  return `mailto:${to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(body)}`;
}
