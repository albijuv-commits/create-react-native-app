/** Rende innocuo un testo che finisce dentro codice HTML scritto a mano (ad esempio i segnaposto di Leaflet) */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}
