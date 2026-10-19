import { Directory, File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { isSummaryHeading } from "@/lib/triage/summary";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Il riepilogo per il medico come pagina HTML da stampare in PDF, con gli stessi titoli del PDF della web app */
export function summaryHtml(text: string): string {
  const body = text
    .split("\n")
    .map((line, i) => {
      if (line.trim() === "") return '<div class="gap"></div>';
      if (i === 0) return `<h1>${escapeHtml(line)}</h1>`;
      if (isSummaryHeading(line, i)) return `<h2>${escapeHtml(line)}</h2>`;
      if (line.startsWith("- ")) return `<p class="item">${escapeHtml(line.slice(2))}</p>`;
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<style>
  @page { margin: 18mm; }
  body { font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #1a1b2e; }
  h1 { font-size: 17pt; margin: 0 0 6pt; }
  h2 { font-size: 11pt; margin: 10pt 0 2pt; }
  p { margin: 0 0 2pt; }
  .item { padding-left: 12pt; text-indent: -8pt; }
  .item::before { content: "• "; }
  .gap { height: 4pt; }
  footer { margin-top: 18pt; font-size: 9pt; color: #646478; }
</style>
</head>
<body>
${body}
<footer>Orienta · Questa non è una diagnosi</footer>
</body>
</html>`;
}

/**
 * I PDF del riepilogo creati in precedenza: expo-print li mette nella cartella temporanea «Print»
 * (su iOS e su Android), che ricrea quando serve.
 */
export function deleteSummaryPdfs(): void {
  if (Platform.OS === "web") return;
  const folder = new Directory(Paths.cache, "Print");
  if (folder.exists) folder.delete();
}

/** Sul web (solo un aiuto per lo sviluppo) si stampa il riepilogo in una cornice nascosta, non la pagina */
function printOnWeb(html: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  if (!win) {
    frame.remove();
    throw new Error("Stampa non disponibile");
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  setTimeout(() => frame.remove(), 1000);
}

/**
 * Crea il PDF sul telefono e apre la condivisione (al medico, in una email, nei file): niente passa
 * da un server. Su iPhone il file si cancella appena la condivisione è finita; su Android alcune app
 * (Drive, Bluetooth, Quick Share) lo leggono più tardi, quindi lì si cancella alla condivisione
 * successiva o con «Elimina tutti i miei dati». Sul web apre la stampa del browser.
 */
export async function shareSummaryPdf(text: string): Promise<"condiviso" | "stampa"> {
  const html = summaryHtml(text);
  if (Platform.OS === "web") {
    printOnWeb(html);
    return "stampa";
  }
  if (!(await Sharing.isAvailableAsync())) {
    await Print.printAsync({ html });
    return "stampa";
  }
  try {
    deleteSummaryPdfs();
  } catch {
    // Il sistema svuota comunque la cartella temporanea
  }
  const { uri } = await Print.printToFileAsync({ html });
  try {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Riepilogo per il medico" });
  } finally {
    if (Platform.OS === "ios") {
      try {
        new File(uri).delete();
      } catch {
        // Il sistema svuota comunque la cartella temporanea
      }
    }
  }
  return "condiviso";
}
