/**
 * Il PDF del riepilogo per il medico, creato nel browser: niente passa da un server.
 * jsPDF si carica solo quando la persona chiede il PDF.
 */

const PAGE = { width: 210, height: 297, margin: 18 } as const;

/** Le righe che fanno da titolo di sezione nel testo del riepilogo */
function isHeading(line: string, index: number): boolean {
  return index === 0 || (index > 1 && !line.startsWith("- ") && !line.startsWith("Metodo:") && line.length <= 90);
}

export async function downloadSummaryPdf(text: string, generatedAt: Date): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const width = PAGE.width - PAGE.margin * 2;
  const bottom = PAGE.height - PAGE.margin - 6;
  let y = PAGE.margin + 4;

  text.split("\n").forEach((line, i) => {
    if (line.trim() === "") {
      y += 3;
      return;
    }
    const title = i === 0;
    doc.setFont("helvetica", isHeading(line, i) ? "bold" : "normal");
    doc.setFontSize(title ? 17 : 11);
    const lineHeight = title ? 8 : 5.4;
    for (const part of doc.splitTextToSize(line, width) as string[]) {
      if (y > bottom) {
        doc.addPage();
        y = PAGE.margin + 4;
      }
      doc.text(part, PAGE.margin, y);
      y += lineHeight;
    }
    if (title) y += 2;
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Orienta · Questa non è una diagnosi · Pagina ${p} di ${pages}`, PAGE.margin, PAGE.height - 10);
  }
  doc.save(`riepilogo-orienta-${generatedAt.toISOString().slice(0, 10)}.pdf`);
}
