import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { clearSummaryForDoctors, readSummaryForDoctors, saveSummaryForDoctors } from "~/lib/doctor-handoff";
import { shareSummaryPdf, summaryHtml } from "~/lib/summary-pdf";

jest.mock("expo-print", () => ({ printToFileAsync: jest.fn(), printAsync: jest.fn() }));
jest.mock("expo-sharing", () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
const mockDelete = jest.fn();
jest.mock("expo-file-system", () => ({ File: jest.fn().mockImplementation(() => ({ delete: mockDelete })) }));

const print = Print as jest.Mocked<typeof Print>;
const sharing = Sharing as jest.Mocked<typeof Sharing>;

const SUMMARY = [
  "Riepilogo per il medico",
  "Generato il 10/10/2026 da Orienta",
  "Cosa ho descritto",
  "- Mal di gola <da ieri> & febbre",
  "",
  "Metodo: regole fisse",
].join("\n");

describe("PDF del riepilogo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("titoli come nel PDF della web app e testo sempre protetto", () => {
    const html = summaryHtml(SUMMARY);
    expect(html).toContain("<h1>Riepilogo per il medico</h1>");
    expect(html).toContain("<h2>Cosa ho descritto</h2>");
    expect(html).toContain('<p class="item">Mal di gola &lt;da ieri&gt; &amp; febbre</p>');
    expect(html).toContain("<p>Metodo: regole fisse</p>");
    expect(html).not.toContain("<da ieri>");
    expect(html).toContain("Questa non è una diagnosi");
  });

  it("crea il PDF sul telefono, lo condivide e poi lo cancella", async () => {
    sharing.isAvailableAsync.mockResolvedValue(true);
    print.printToFileAsync.mockResolvedValue({ uri: "file:///cache/riepilogo.pdf", numberOfPages: 1 });
    sharing.shareAsync.mockResolvedValue(undefined);
    await expect(shareSummaryPdf(SUMMARY)).resolves.toBe("condiviso");
    expect(print.printToFileAsync).toHaveBeenCalledWith({ html: summaryHtml(SUMMARY) });
    expect(sharing.shareAsync).toHaveBeenCalledWith("file:///cache/riepilogo.pdf", expect.objectContaining({ mimeType: "application/pdf" }));
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("cancella il file anche se la condivisione non va a buon fine", async () => {
    sharing.isAvailableAsync.mockResolvedValue(true);
    print.printToFileAsync.mockResolvedValue({ uri: "file:///cache/riepilogo.pdf", numberOfPages: 1 });
    sharing.shareAsync.mockRejectedValue(new Error("annullata"));
    await expect(shareSummaryPdf(SUMMARY)).rejects.toThrow("annullata");
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("senza condivisione disponibile apre la stampa", async () => {
    sharing.isAvailableAsync.mockResolvedValue(false);
    print.printAsync.mockResolvedValue(undefined);
    await expect(shareSummaryPdf(SUMMARY)).resolves.toBe("stampa");
    expect(print.printToFileAsync).not.toHaveBeenCalled();
  });
});

describe("riepilogo per i Medici", () => {
  afterEach(() => clearSummaryForDoctors());

  it("resta solo in memoria e scade dopo 6 ore", () => {
    const now = Date.UTC(2026, 9, 10, 9, 0);
    saveSummaryForDoctors("Riepilogo", now);
    expect(readSummaryForDoctors(now + 60_000)).toBe("Riepilogo");
    expect(readSummaryForDoctors(now + 6 * 60 * 60 * 1000)).toBeNull();
    // Scaduto, sparisce del tutto
    expect(readSummaryForDoctors(now)).toBeNull();
  });

  it("un testo vuoto non si salva", () => {
    saveSummaryForDoctors("   ");
    expect(readSummaryForDoctors()).toBeNull();
  });
});
