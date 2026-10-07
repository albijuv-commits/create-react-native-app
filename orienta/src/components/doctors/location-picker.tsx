"use client";

import { LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import mappa from "@/assets/illustrations/stato-mappa.webp";
import { Button } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { DoctorsRequestError, fetchPlace } from "@/lib/doctors/client";

export interface Origin {
  kind: "gps" | "luogo";
  label: string;
  lat: number;
  lon: number;
}

const GEO_ERRORS: Record<number, string> = {
  1: "Non hai dato il permesso di usare la posizione. Scrivi la città o il CAP, oppure attiva la posizione nelle impostazioni del browser.",
  2: "Non riusciamo a trovare la tua posizione in questo momento. Scrivi la città o il CAP.",
  3: "La posizione ci sta mettendo troppo. Riprova, oppure scrivi la città o il CAP.",
};

/**
 * Dove cercare: la posizione del browser (con il permesso della persona) oppure città o CAP.
 * La ricerca del luogo parte solo all'invio: Nominatim non permette il completamento automatico.
 */
export function LocationPicker({ origin, onOrigin }: { origin: Origin | null; onOrigin: (origin: Origin) => void }) {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<"posizione" | "luogo" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const inputId = useId();
  const open = !origin || editing;

  const choose = (next: Origin) => {
    setError(null);
    setEditing(false);
    onOrigin(next);
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setError("Il tuo browser non può indicare la posizione: scrivi la città o il CAP.");
      return;
    }
    setBusy("posizione");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(null);
        choose({ kind: "gps", label: "La tua posizione", lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        setBusy(null);
        setError(GEO_ERRORS[err.code] ?? GEO_ERRORS[2]!);
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const search = async (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setError("Scrivi il nome di una città o un CAP.");
      return;
    }
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setBusy("luogo");
    setError(null);
    try {
      const place = await fetchPlace(q, c.signal);
      if (c.signal.aborted) return;
      if (!place) setError(`Non troviamo «${q}». Controlla come è scritto, oppure prova con il CAP.`);
      else choose({ kind: "luogo", ...place });
    } catch (e) {
      if (c.signal.aborted) return;
      setError(e instanceof DoctorsRequestError ? e.message : "Qualcosa è andato storto. Riprova tra poco.");
    } finally {
      if (!c.signal.aborted) setBusy(null);
    }
  };

  return (
    <section aria-labelledby="dove-titolo" className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 id="dove-titolo" className="min-w-0 flex-1 text-heading font-bold">
          Dove?
        </h2>
        {!origin && <TiltIllustration src={mappa} sizes="72px" className="w-18 shrink-0" />}
      </div>

      {origin && (
        <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <MapPin aria-hidden className="size-6 shrink-0 text-primary" />
          <p className="min-w-0 flex-1">
            <span className="block text-small text-ink-muted">Vicino a</span>
            <span className="block font-bold">{origin.label}</span>
          </p>
          {!editing && (
            <Button variant="ghost" onClick={() => setEditing(true)} aria-label={`Cambia posizione, ora: ${origin.label}`}>
              Cambia
            </Button>
          )}
        </div>
      )}

      {open && (
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={locate}
            disabled={busy !== null}
            icon={busy === "posizione" ? <LoaderCircle aria-hidden className="size-6 animate-spin" /> : <LocateFixed aria-hidden className="size-6" />}
          >
            {busy === "posizione" ? "Cerco la tua posizione…" : "Usa la mia posizione"}
          </Button>

          <div aria-hidden className="flex items-center gap-3 text-small text-ink-muted">
            <span className="h-px flex-1 bg-line" />
            oppure
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={search} className="space-y-2" noValidate>
            <label htmlFor={inputId} className="block font-bold">
              Città o CAP
            </label>
            <div className="flex gap-2">
              <input
                id={inputId}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={80}
                autoComplete="address-level2"
                enterKeyHint="search"
                placeholder="Ad esempio Bologna o 40121"
                className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 text-body placeholder:text-ink-muted/80 focus:border-primary focus:outline-none focus-visible:outline-3 focus-visible:outline-focus"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={busy !== null}
                className="min-h-12"
                icon={busy === "luogo" ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Search aria-hidden className="size-5" />}
              >
                Cerca
              </Button>
            </div>
          </form>

          {error && (
            <p role="alert" className="text-small font-bold text-red">
              {error}
            </p>
          )}

          <p className="text-small text-ink-muted">
            La posizione serve solo per questa ricerca: prima di cercare la arrotondiamo a circa 100 metri e non la salviamo.
          </p>
          {origin && (
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Annulla
            </Button>
          )}
        </div>
      )}
      <p className="text-[0.8125rem] text-ink-muted">
        Luoghi cercati con Nominatim · dati ©{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          OpenStreetMap contributors
          <span className="sr-only"> (si apre in una nuova scheda)</span>
        </a>
      </p>
    </section>
  );
}
