import { describe, expect, it } from "vitest";
import { detectPlatform, directionsUrl, emailAddress, openingHoursLines, phoneLink, websiteUrl } from "@/lib/doctors/contact";
import { buildDoctorEmail, encodedLength, fitBody, MAILTO_BODY_LIMIT, mailtoHref } from "@/lib/doctors/email";
import { destination, distanceM, formatDistance, roundCoord, roundPoint } from "@/lib/doctors/geo";
import { doctorSearchRequestSchema } from "@/lib/doctors/schema";

describe("geo", () => {
  it("calcola le distanze in linea d'aria", () => {
    const duomo = { lat: 45.4642, lon: 9.19 };
    const colosseo = { lat: 41.8902, lon: 12.4922 };
    expect(distanceM(duomo, colosseo) / 1000).toBeCloseTo(477, -1);
    expect(distanceM(duomo, duomo)).toBe(0);
  });

  it("destination e distanceM sono coerenti", () => {
    const start = { lat: 45.4642, lon: 9.19 };
    for (const [d, b] of [
      [450, 35],
      [9300, 205],
      [21000, 130],
    ] as const) {
      expect(distanceM(start, destination(start, d, b))).toBeCloseTo(d, 0);
    }
  });

  it("arrotonda la posizione a circa 100 metri", () => {
    expect(roundCoord(45.464213)).toBe(45.464);
    expect(roundPoint({ lat: 41.890251, lon: 12.492373 })).toEqual({ lat: 41.89, lon: 12.492 });
    expect(distanceM({ lat: 45.464213, lon: 9.189982 }, roundPoint({ lat: 45.464213, lon: 9.189982 }))).toBeLessThan(80);
  });

  it("formatta le distanze in italiano", () => {
    expect(formatDistance(4)).toBe("10 m");
    expect(formatDistance(347)).toBe("350 m");
    expect(formatDistance(1234)).toBe("1,2 km");
    expect(formatDistance(9960)).toBe("10,0 km");
    expect(formatDistance(14_500)).toBe("15 km");
  });
});

describe("telefono", () => {
  it("accetta i formati più comuni e costruisce il link tel:", () => {
    expect(phoneLink("+39 02 1234 5678")).toEqual({ display: "+39 02 1234 5678", href: "tel:+390212345678" });
    expect(phoneLink("02-1234567")).toEqual({ display: "02-1234567", href: "tel:021234567" });
    expect(phoneLink("0039 06 123456")?.href).toBe("tel:+3906123456");
    expect(phoneLink("(06) 123.456")?.href).toBe("tel:06123456");
  });

  it("con più numeri prende il primo", () => {
    expect(phoneLink("+39 02 111111; +39 02 222222")?.href).toBe("tel:+3902111111");
    expect(phoneLink("02 111111, 02 222222")?.display).toBe("02 111111");
  });

  it("scarta ciò che non è un numero", () => {
    expect(phoneLink("chiamare in orario d'ufficio")).toBeNull();
    expect(phoneLink("12")).toBeNull();
    expect(phoneLink("+39 1234567890123456")).toBeNull();
    expect(phoneLink("")).toBeNull();
    expect(phoneLink(undefined)).toBeNull();
  });
});

describe("email e sito", () => {
  it("valida le email", () => {
    expect(emailAddress("studio.rossi@esempio.it")).toBe("studio.rossi@esempio.it");
    expect(emailAddress("mailto:info@esempio.it")).toBe("info@esempio.it");
    expect(emailAddress("a@esempio.it; b@esempio.it")).toBe("a@esempio.it");
    expect(emailAddress("non è un'email")).toBeNull();
    expect(emailAddress("info@esempio")).toBeNull();
    expect(emailAddress('x"@esempio.it')).toBeNull();
  });

  it("accetta solo siti http e https", () => {
    expect(websiteUrl("https://www.esempio.it/studio")).toBe("https://www.esempio.it/studio");
    expect(websiteUrl("www.esempio.it")).toBe("https://www.esempio.it/");
    expect(websiteUrl("esempio.it/contatti")).toBe("https://esempio.it/contatti");
    expect(websiteUrl("javascript:alert(1)")).toBeNull();
    expect(websiteUrl("ftp://esempio.it")).toBeNull();
    expect(websiteUrl("https://utente:password@esempio.it")).toBeNull();
    expect(websiteUrl("un testo qualsiasi")).toBeNull();
    expect(websiteUrl("http://localhost")).toBeNull();
  });
});

describe("orari di OpenStreetMap", () => {
  it("traduce giorni, mesi e chiusure", () => {
    expect(openingHoursLines("Mo-Fr 09:00-13:00,15:00-19:00; Sa 09:00-12:00; Su off")).toEqual([
      "Lun–Ven 09:00–13:00, 15:00–19:00",
      "Sab 09:00–12:00",
      "Dom chiuso",
    ]);
    expect(openingHoursLines("24/7")).toEqual(["Sempre aperto"]);
    expect(openingHoursLines('Mo,We 08:30-12:30 "su appuntamento"; PH off')).toEqual(["Lun, Mer 08:30–12:30 (su appuntamento)", "Festivi chiuso"]);
    expect(openingHoursLines("Aug off")).toEqual(["ago chiuso"]);
  });

  it("ignora valori vuoti o enormi", () => {
    expect(openingHoursLines("")).toBeNull();
    expect(openingHoursLines(null)).toBeNull();
    expect(openingHoursLines("x".repeat(500))).toBeNull();
  });
});

describe("indicazioni", () => {
  const place = { lat: 45.4642, lon: 9.19, name: "Studio Bianchi", googleMaps: null };

  it("riconosce iPhone e iPad", () => {
    expect(detectPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("ios");
    expect(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5)).toBe("ios");
    expect(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0)).toBe("altro");
    expect(detectPlatform("Mozilla/5.0 (Linux; Android 14)")).toBe("altro");
  });

  it("apre Mappe di Apple su iOS e Google Maps altrove", () => {
    expect(directionsUrl(place, "ios")).toBe("https://maps.apple.com/?daddr=45.464200,9.190000&q=Studio%20Bianchi");
    expect(directionsUrl(place, "altro")).toBe("https://www.google.com/maps/dir/?api=1&destination=45.464200,9.190000");
  });

  it("per i risultati di Google usa il link fornito da Google", () => {
    const google = { ...place, googleMaps: { place: "https://maps.google.com/?cid=1", directions: "https://www.google.com/maps/dir//x" } };
    expect(directionsUrl(google, "ios")).toBe("https://www.google.com/maps/dir//x");
    expect(directionsUrl({ ...google, googleMaps: { place: "https://maps.google.com/?cid=1", directions: null } }, "altro")).toBe("https://maps.google.com/?cid=1");
  });
});

describe("email precompilata", () => {
  it("senza riepilogo chiede solo l'appuntamento", () => {
    const email = buildDoctorEmail({ specialtyLabel: "Urologo", summary: null });
    expect(email.subject).toBe("Richiesta di appuntamento");
    expect(email.body).toContain("vorrei chiedere un appuntamento per una visita (urologo).");
    expect(email.body).not.toContain("riepilogo");
    expect(email.body).toContain("[Nome e cognome]");
  });

  it("con il riepilogo lo include e dice che non è una diagnosi", () => {
    const email = buildDoctorEmail({ specialtyLabel: null, summary: "Riepilogo per il medico\n- Età: 27 anni" });
    expect(email.subject).toContain("riepilogo dei sintomi");
    expect(email.body).toContain("Non è una diagnosi.");
    expect(email.body).toContain("- Età: 27 anni");
  });

  it("accorcia il riepilogo a righe intere, tenendo i saluti", () => {
    const summary = Array.from({ length: 120 }, (_, i) => `- riga ${i} con un po' di testo per allungare`).join("\n");
    const body = buildDoctorEmail({ specialtyLabel: "Cardiologo", summary }).body;
    const fitted = fitBody(body);
    expect(encodedLength(fitted)).toBeLessThanOrEqual(MAILTO_BODY_LIMIT);
    expect(fitted).toContain("Riepilogo abbreviato");
    expect(fitted).toContain("[Numero di telefono]");
    expect(fitted).not.toMatch(/riga \d+ con un po' di test$/m);
  });

  it("il limite conta il testo codificato: spazi, a capo e lettere accentate pesano di più", () => {
    const summary = Array.from({ length: 40 }, (_, i) => `- è già più forte, perché sì (${i})`).join("\n");
    const body = buildDoctorEmail({ specialtyLabel: null, summary }).body;
    expect(body.length).toBeLessThan(MAILTO_BODY_LIMIT);
    expect(encodedLength(body)).toBeGreaterThan(MAILTO_BODY_LIMIT);
    const href = mailtoHref("studio@esempio.it", { subject: "Richiesta di appuntamento", body });
    expect(href.length).toBeLessThan(2000);
    expect(decodeURIComponent(href)).toContain("Riepilogo abbreviato");
  });

  it("il link mailto lascia l'indirizzo in chiaro e codifica oggetto e testo con a capo CRLF", () => {
    const href = mailtoHref("studio@esempio.it", { subject: "Richiesta di appuntamento", body: "Buongiorno,\n\nriga" });
    expect(href.startsWith("mailto:studio@esempio.it?subject=Richiesta%20di%20appuntamento&body=")).toBe(true);
    expect(href).toContain("Buongiorno%2C%0D%0A%0D%0Ariga");
  });
});

describe("richiesta di ricerca", () => {
  it("accetta solo specialità e distanze previste", () => {
    expect(doctorSearchRequestSchema.safeParse({ specialty: "urologo", lat: 45.46, lon: 9.19, radiusKm: 10 }).success).toBe(true);
    expect(doctorSearchRequestSchema.safeParse({ specialty: "urologo", lat: 45.46, lon: 9.19, radiusKm: 3 }).success).toBe(false);
    expect(doctorSearchRequestSchema.safeParse({ specialty: "chirurgo-plastico", lat: 45.46, lon: 9.19, radiusKm: 10 }).success).toBe(false);
    expect(doctorSearchRequestSchema.safeParse({ specialty: "urologo", lat: 95, lon: 9.19, radiusKm: 10 }).success).toBe(false);
  });
});

describe("segnaposto della mappa", () => {
  it("i nomi presi da OpenStreetMap non possono iniettare codice HTML", async () => {
    const { escapeHtml } = await import("@/lib/escape-html");
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(escapeHtml("Studio Dell'Acqua & C.")).toBe("Studio Dell&#39;Acqua &amp; C.");
  });
});
