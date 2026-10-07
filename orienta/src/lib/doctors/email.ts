/**
 * L'email precompilata per chiedere un appuntamento. La persona la rivede e la modifica nella
 * propria app di posta: Orienta non invia nulla.
 */

export interface DoctorEmail {
  subject: string;
  body: string;
}

/** Alcune app di posta troncano o rifiutano i link mailto troppo lunghi */
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

/** Accorcia il riepilogo (a righe intere) finché il testo sta nel limite del link mailto */
export function fitBody(body: string, limit = MAILTO_BODY_LIMIT): string {
  if (body.length <= limit) return body;
  const closingStart = body.lastIndexOf("\nGrazie, cordiali saluti");
  const closing = closingStart >= 0 ? body.slice(closingStart) : "";
  const head = closingStart >= 0 ? body.slice(0, closingStart) : body;
  const room = limit - closing.length - SHORTENED_NOTE.length - 2;
  const lines = head.split("\n");
  const kept: string[] = [];
  let size = 0;
  for (const line of lines) {
    if (size + line.length + 1 > room) break;
    kept.push(line);
    size += line.length + 1;
  }
  return `${kept.join("\n").trimEnd()}\n\n${SHORTENED_NOTE}\n${closing}`.slice(0, limit);
}

/** RFC 6068: l'indirizzo resta in chiaro (è già validato), oggetto e testo sono codificati, a capo = CRLF */
export function mailtoHref(to: string, email: DoctorEmail): string {
  const body = fitBody(email.body).replace(/\r?\n/g, "\r\n");
  return `mailto:${to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(body)}`;
}
