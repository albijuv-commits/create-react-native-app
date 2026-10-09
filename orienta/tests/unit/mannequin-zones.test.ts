import { describe, expect, it } from "vitest";
import { MANNEQUIN_HEIGHT, mannequinZone } from "@/components/body-map/mannequin-zones";

const at = (h: number) => h * MANNEQUIN_HEIGHT;

describe("zone del manichino scolpito", () => {
  it("riconosce le parti del viso davanti", () => {
    expect(mannequinZone(0, at(0.875), 0.18)).toBe("naso");
    expect(mannequinZone(0.05, at(0.905), 0.15)).toBe("occhi");
    expect(mannequinZone(0, at(0.84), 0.14)).toBe("bocca");
    expect(mannequinZone(0.16, at(0.87), 0)).toBe("orecchie");
    expect(mannequinZone(0, at(0.97), 0)).toBe("testa");
    expect(mannequinZone(0, at(0.9), -0.18)).toBe("testa");
  });

  it("separa collo e nuca, petto e schiena", () => {
    expect(mannequinZone(0, at(0.78), 0.02)).toBe("collo");
    expect(mannequinZone(0, at(0.78), -0.12)).toBe("nuca");
    expect(mannequinZone(0, at(0.66), 0.08)).toBe("petto");
    expect(mannequinZone(0, at(0.66), -0.15)).toBe("schiena-alta");
    expect(mannequinZone(0, at(0.52), -0.12)).toBe("schiena-bassa");
  });

  it("divide la pancia in fasce dall'alto in basso", () => {
    expect(mannequinZone(0, at(0.58), 0.08)).toBe("stomaco");
    expect(mannequinZone(0, at(0.53), 0.08)).toBe("pancia");
    expect(mannequinZone(0, at(0.45), 0.06)).toBe("basso-ventre");
  });

  it("braccia, mani, spalle, gambe e piedi", () => {
    expect(mannequinZone(0.2, at(0.73), 0)).toBe("spalle");
    expect(mannequinZone(0.3, at(0.55), 0)).toBe("braccia");
    expect(mannequinZone(-0.42, at(0.4), 0)).toBe("mani");
    expect(mannequinZone(0.1, at(0.25), 0)).toBe("gambe");
    expect(mannequinZone(0.1, at(0.02), 0.1)).toBe("piedi");
  });
});
