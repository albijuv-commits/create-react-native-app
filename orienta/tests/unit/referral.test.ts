import { describe, expect, it } from "vitest";
import { CONDITIONS } from "@data/conditions";
import { specialistForAge } from "@/lib/triage/referral";

describe("riferimento per età", () => {
  it("sotto i 14 anni il medico di base diventa il pediatra", () => {
    expect(specialistForAge("medico-di-base", 8)).toBe("pediatra");
    expect(specialistForAge("medico-di-base", 13)).toBe("pediatra");
    expect(specialistForAge("medico-di-base", 14)).toBe("medico-di-base");
  });

  it("dai 14 anni in su una condizione affidata al pediatra porta al medico di base", () => {
    const varicella = CONDITIONS.find((c) => c.id === "varicella")!;
    expect(varicella.specialist.id).toBe("pediatra");
    expect(specialistForAge(varicella.specialist.id, 34)).toBe("medico-di-base");
    expect(specialistForAge(varicella.specialist.id, 14)).toBe("medico-di-base");
    expect(specialistForAge(varicella.specialist.id, 6)).toBe("pediatra");
  });

  it("gli altri specialisti non cambiano con l'età", () => {
    for (const age of [3, 34]) {
      expect(specialistForAge("otorinolaringoiatra", age)).toBe("otorinolaringoiatra");
      expect(specialistForAge("dermatologo", age)).toBe("dermatologo");
    }
  });
});
