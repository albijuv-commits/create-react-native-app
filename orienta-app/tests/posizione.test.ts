import * as Location from "expo-location";
import { currentPosition, LocationError, locationMessages } from "~/lib/location";

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const loc = Location as jest.Mocked<typeof Location>;
const position = (lat: number, lon: number) => ({ coords: { latitude: lat, longitude: lon }, timestamp: 0 }) as unknown as Location.LocationObject;
const granted = { status: "granted", canAskAgain: true } as unknown as Location.LocationPermissionResponse;

describe("posizione del telefono", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loc.requestForegroundPermissionsAsync.mockResolvedValue(granted);
    loc.hasServicesEnabledAsync.mockResolvedValue(true);
    loc.getLastKnownPositionAsync.mockResolvedValue(null);
  });

  it("chiede il permesso e usa una posizione di pochi minuti fa, se c'è", async () => {
    loc.getLastKnownPositionAsync.mockResolvedValue(position(45.4642, 9.19));
    await expect(currentPosition({ placeSearch: true })).resolves.toEqual({ lat: 45.4642, lon: 9.19 });
    expect(loc.getLastKnownPositionAsync).toHaveBeenCalledWith({ maxAge: 5 * 60 * 1000, requiredAccuracy: 1000 });
    expect(loc.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("altrimenti la chiede con precisione media", async () => {
    loc.getCurrentPositionAsync.mockResolvedValue(position(44.49, 11.34));
    await expect(currentPosition({ placeSearch: true })).resolves.toEqual({ lat: 44.49, lon: 11.34 });
    expect(loc.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: Location.Accuracy.Balanced });
  });

  it("permesso negato per sempre: si rimanda alle impostazioni", async () => {
    loc.requestForegroundPermissionsAsync.mockResolvedValue({ status: "denied", canAskAgain: false } as unknown as Location.LocationPermissionResponse);
    const error = await currentPosition({ placeSearch: true }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(LocationError);
    expect((error as LocationError).settings).toBe(true);
    expect((error as LocationError).message).toMatch(/^Non hai dato il permesso di usare la posizione/);
  });

  it("localizzazione spenta", async () => {
    loc.hasServicesEnabledAsync.mockResolvedValue(false);
    await expect(currentPosition({ placeSearch: true })).rejects.toThrow("La localizzazione del telefono è spenta");
  });

  it("se la posizione non arriva entro 15 secondi lo dice", async () => {
    jest.useFakeTimers();
    loc.getCurrentPositionAsync.mockReturnValue(new Promise(() => {}));
    const result = currentPosition({ placeSearch: true }).catch((e: unknown) => e);
    await jest.advanceTimersByTimeAsync(15_000);
    expect(((await result) as Error).message).toBe("La posizione ci sta mettendo troppo. Riprova, oppure scrivi la città o il CAP.");
    jest.useRealTimers();
  });

  it("senza il servizio di Orienta la città non si può scrivere, e i messaggi non la propongono", async () => {
    loc.requestForegroundPermissionsAsync.mockResolvedValue({ status: "denied", canAskAgain: false } as unknown as Location.LocationPermissionResponse);
    const denied = (await currentPosition({ placeSearch: false }).catch((e: unknown) => e)) as LocationError;
    expect(denied.message).toBe("Non hai dato il permesso di usare la posizione. Puoi attivarla per Orienta nelle impostazioni del telefono.");
    expect(denied.settings).toBe(true);

    loc.requestForegroundPermissionsAsync.mockResolvedValue(granted);
    loc.getCurrentPositionAsync.mockRejectedValue(new Error("nessun fornitore di posizione"));
    await expect(currentPosition({ placeSearch: false })).rejects.toThrow("Non riusciamo a trovare la tua posizione in questo momento. Riprova tra poco.");
    for (const message of Object.values(locationMessages(false))) expect(message).not.toMatch(/città|CAP/);
  });
});
