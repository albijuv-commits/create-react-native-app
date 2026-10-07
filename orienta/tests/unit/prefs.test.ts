import { describe, expect, it } from "vitest";
import { DEFAULT_PREFS, parsePrefs, resolveTheme } from "@/lib/prefs/prefs";
import { maxUrgency } from "@/lib/design/urgency";

describe("preferenze", () => {
  it("usa i default con input vuoto o non valido", () => {
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(parsePrefs("non json")).toEqual(DEFAULT_PREFS);
    expect(parsePrefs(JSON.stringify({ theme: "viola" }))).toEqual(DEFAULT_PREFS);
  });

  it("legge preferenze valide", () => {
    expect(parsePrefs(JSON.stringify({ theme: "dark", textSize: "large" }))).toEqual({
      theme: "dark",
      textSize: "large",
      defaultCity: "",
    });
  });

  it("risolve il tema automatico", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });
});

describe("urgenza", () => {
  it("restituisce il livello più urgente", () => {
    expect(maxUrgency([])).toBe("home");
    expect(maxUrgency(["gp", "home", "soon"])).toBe("soon");
    expect(maxUrgency(["er", "gp"])).toBe("er");
  });
});
