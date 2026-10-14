import * as Location from "expo-location";

export interface Point {
  lat: number;
  lon: number;
}

/** Un problema con la posizione, con il messaggio da mostrare; `settings` se si risolve dalle impostazioni */
export class LocationError extends Error {
  constructor(
    message: string,
    readonly settings = false,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 15_000;
/** Una posizione di pochi minuti fa va bene per cercare i medici vicini (come maximumAge nella web app) */
const MAX_AGE_MS = 5 * 60 * 1000;

/** I messaggi propongono la città o il CAP solo se si possono scrivere (con il servizio di Orienta) */
export function locationMessages(placeSearch: boolean) {
  return placeSearch
    ? {
        denied: "Non hai dato il permesso di usare la posizione. Scrivi la città o il CAP, oppure attiva la posizione per Orienta nelle impostazioni del telefono.",
        off: "La localizzazione del telefono è spenta. Accendila nelle impostazioni, oppure scrivi la città o il CAP.",
        unavailable: "Non riusciamo a trovare la tua posizione in questo momento. Scrivi la città o il CAP.",
        timeout: "La posizione ci sta mettendo troppo. Riprova, oppure scrivi la città o il CAP.",
      }
    : {
        denied: "Non hai dato il permesso di usare la posizione. Puoi attivarla per Orienta nelle impostazioni del telefono.",
        off: "La localizzazione del telefono è spenta. Accendila nelle impostazioni e riprova.",
        unavailable: "Non riusciamo a trovare la tua posizione in questo momento. Riprova tra poco.",
        timeout: "La posizione ci sta mettendo troppo. Riprova tra poco.",
      };
}

function timeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new LocationError(message)), ms));
}

/**
 * La posizione del telefono, solo dopo il permesso della persona e solo per la ricerca in corso:
 * non si salva. Basta la precisione media (non serve il GPS preciso). `placeSearch` dice se, in
 * alternativa, si può scrivere la città o il CAP.
 */
export async function currentPosition({ placeSearch }: { placeSearch: boolean }): Promise<Point> {
  const messages = locationMessages(placeSearch);
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") throw new LocationError(messages.denied, !permission.canAskAgain);
  if (!(await Location.hasServicesEnabledAsync())) throw new LocationError(messages.off, true);
  try {
    const recent = await Location.getLastKnownPositionAsync({ maxAge: MAX_AGE_MS, requiredAccuracy: 1000 });
    const pos = recent ?? (await Promise.race([Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), timeout(TIMEOUT_MS, messages.timeout)]));
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch (error) {
    if (error instanceof LocationError) throw error;
    throw new LocationError(messages.unavailable);
  }
}
