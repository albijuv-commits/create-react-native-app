"use client";

import { FileText, List, LoaderCircle, Map as MapIcon, Phone, Stethoscope } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import nessunRisultato from "@/assets/illustrations/stato-nessun-risultato.webp";
import { SPECIALTY_IDS, getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { cn } from "@/lib/cn";
import { DoctorsRequestError, fetchDoctors } from "@/lib/doctors/client";
import { detectPlatform, type Platform } from "@/lib/doctors/contact";
import { distanceM } from "@/lib/doctors/geo";
import { clearSummaryForDoctors, readSummaryForDoctors } from "@/lib/doctors/handoff";
import { DEFAULT_RADIUS_KM, RADIUS_OPTIONS_KM, type Doctor, type DoctorSearchResponse, type RadiusKm } from "@/lib/doctors/schema";
import { SPECIALIST_ILLUSTRATIONS } from "@/lib/illustrations/specialists";
import { useUrlParams } from "@/lib/use-url-params";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { DoctorCard } from "./doctor-card";
import { EmailSheet } from "./email-sheet";
import { GoogleMapsAttribution } from "./google-attribution";
import { LocationPicker, type Origin } from "./location-picker";
import { SpecialtyPicker } from "./specialty-picker";

/* Leaflet (codice e stili) arriva solo quando si apre la vista mappa */
const DoctorMap = dynamic(() => import("./doctor-map").then((m) => m.DoctorMap), {
  ssr: false,
  loading: () => <div className="h-[min(60vh,26rem)] w-full rounded-3xl bg-surface-2" />,
});

export interface ConditionRef {
  name: string;
  specialist: SpecialtyId;
}

type SearchState =
  | { status: "idle" }
  | { status: "loading"; previous: DoctorSearchResponse | null }
  | { status: "done"; response: DoctorSearchResponse }
  | { status: "error"; message: string };

const isSpecialty = (v: string | null): v is SpecialtyId => v !== null && (SPECIALTY_IDS as readonly string[]).includes(v);
const isRadius = (v: number): v is RadiusKm => (RADIUS_OPTIONS_KM as readonly number[]).includes(v);

const SUMMARY_EVENT = "orienta:riepilogo";
function subscribeSummary(onChange: () => void) {
  window.addEventListener(SUMMARY_EVENT, onChange);
  return () => window.removeEventListener(SUMMARY_EVENT, onChange);
}

const NON_SPECIALIST: ReadonlySet<SpecialtyId> = new Set(["medico-di-base", "pediatra", "pronto-soccorso"]);

/**
 * La ricerca dei professionisti: chi (con il medico di base sempre come primo passo), dove
 * (posizione o città), quanto lontano, in lista o sulla mappa. Specialità, distanza e vista
 * restano nell'indirizzo; la posizione no.
 */
export function DoctorFinder({ conditions }: { conditions: Record<string, ConditionRef> }) {
  const [params, updateParams] = useUrlParams();
  const reduced = usePrefersReducedMotion();
  const summary = useSyncExternalStore(subscribeSummary, () => readSummaryForDoctors(), () => null);

  const condition = conditions[params.get("condizione") ?? ""] ?? null;
  const specialtyParam = params.get("specialista");
  const specialty: SpecialtyId = isSpecialty(specialtyParam) ? specialtyParam : (condition?.specialist ?? "medico-di-base");
  const radiusParam = Number(params.get("raggio"));
  const radius: RadiusKm = isRadius(radiusParam) ? radiusParam : DEFAULT_RADIUS_KM;
  // Lo specialista consigliato è quello del link d'arrivo (per i più piccoli può essere il pediatra) e resta tale anche se se ne sceglie un altro
  const recommendedParam = params.get("consigliato");
  const recommended: SpecialtyId | null = condition ? (isSpecialty(recommendedParam) ? recommendedParam : specialty) : null;

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [selected, setSelected] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState<Doctor | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const search = async (o: Origin, s: SpecialtyId, r: RadiusKm) => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setState((prev) => ({ status: "loading", previous: prev.status === "done" ? prev.response : prev.status === "loading" ? prev.previous : null }));
    try {
      const response = await fetchDoctors({ specialty: s, lat: o.lat, lon: o.lon, radiusKm: r }, c.signal);
      if (c.signal.aborted) return;
      setSelected(null);
      setState({ status: "done", response });
    } catch (error) {
      if (c.signal.aborted) return;
      setState({ status: "error", message: error instanceof DoctorsRequestError ? error.message : "Qualcosa è andato storto. Riprova tra poco." });
    }
  };

  const chooseOrigin = (o: Origin) => {
    setOrigin(o);
    void search(o, specialty, radius);
  };
  const chooseSpecialty = (s: SpecialtyId) => {
    updateParams({ specialista: s, ...(recommended && !isSpecialty(recommendedParam) ? { consigliato: recommended } : {}) });
    if (origin) void search(origin, s, radius);
  };
  const chooseRadius = (r: RadiusKm) => {
    updateParams({ raggio: r === DEFAULT_RADIUS_KM ? null : String(r) });
    if (origin) void search(origin, specialty, r);
  };

  const response = state.status === "done" ? state.response : state.status === "loading" ? state.previous : null;
  const mapAllowed = response?.source !== "google";
  const view = params.get("vista") === "mappa" && mapAllowed ? "mappa" : "lista";

  // Con la posizione del telefono le distanze si ricalcolano qui, con le coordinate esatte che non sono mai uscite dal dispositivo
  const items = useMemo(() => {
    if (!response || !origin) return [];
    return response.doctors
      .map((doctor) => ({ doctor, distance: origin.kind === "gps" ? distanceM(origin, doctor) : doctor.distanceM }))
      .sort((a, b) => a.distance - b.distance);
  }, [response, origin]);
  const mapDoctors = useMemo(() => items.map((i) => i.doctor), [items]);

  const platform: Platform = typeof navigator === "undefined" ? "altro" : detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
  const specialtyLabel = getSpecialty(specialty).label;
  const nextRadius = RADIUS_OPTIONS_KM.find((r) => r > radius);
  const selectedItem = items.find((i) => i.doctor.id === selected) ?? null;
  const selectedIndex = selectedItem ? items.indexOf(selectedItem) + 1 : 0;

  const card = (item: (typeof items)[number], index: number, highlighted = false) => (
    <DoctorCard
      doctor={item.doctor}
      index={index}
      distance={item.distance}
      source={response?.source ?? "esempio"}
      platform={platform}
      onEmail={setEmailTo}
      highlighted={highlighted}
    />
  );

  return (
    <div className="space-y-7">
      {(condition || summary) && (
        <div className="space-y-3">
          {condition && recommended && (
            <Note icon={<Stethoscope aria-hidden className="size-6 text-primary" />} tone="primary">
              Specialista di riferimento per «{condition.name}»: <strong>{getSpecialty(recommended).label}</strong>.
            </Note>
          )}
          {summary && (
            <Note
              icon={<FileText aria-hidden className="size-6 text-primary" />}
              action={
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearSummaryForDoctors();
                    window.dispatchEvent(new Event(SUMMARY_EVENT));
                  }}
                >
                  Togli
                </Button>
              }
            >
              <span className="block font-bold">Il riepilogo dei tuoi sintomi è pronto</span>
              <span className="block text-small">Puoi aggiungerlo all&apos;email per il medico. Resta solo su questo dispositivo.</span>
            </Note>
          )}
        </div>
      )}

      <div className="space-y-4">
        <SpecialtyPicker value={specialty} onChange={chooseSpecialty} recommended={recommended} reduced={reduced} />
        {specialty === "pronto-soccorso" ? (
          <div className="space-y-3 rounded-3xl bg-red-soft p-4">
            <p className="font-bold text-red">In un&apos;emergenza non cercare: chiama subito il 112.</p>
            <ButtonAnchor href="tel:112" variant="danger" className="w-full" icon={<Phone aria-hidden className="size-5" />}>
              Chiama il 112
            </ButtonAnchor>
          </div>
        ) : (
          !NON_SPECIALIST.has(specialty) && (
            <div className="flex items-start gap-3 rounded-3xl border-2 border-primary/25 bg-surface p-4">
              {SPECIALIST_ILLUSTRATIONS["medico-di-base"] && (
                <Image src={SPECIALIST_ILLUSTRATIONS["medico-di-base"]} alt="" sizes="56px" className="size-14 shrink-0" />
              )}
              <div className="min-w-0 space-y-1">
                <p className="font-bold">Primo passo: il medico di base</p>
                <p className="text-small">
                  Ti visita, valuta se serve davvero lo specialista e, con il Servizio sanitario nazionale, ti fa la ricetta per prenotare. Per i
                  bambini e i ragazzi, il pediatra.
                </p>
                <Button variant="ghost" className="-ml-4" onClick={() => chooseSpecialty("medico-di-base")}>
                  Cerca il medico di base
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      <LocationPicker origin={origin} onOrigin={chooseOrigin} />

      {origin && (
        <section aria-labelledby="risultati-titolo" className="space-y-4">
          <div className="space-y-3">
            <h2 id="risultati-titolo" className="text-heading font-bold">
              Risultati
            </h2>
            <Segmented
              legend="Distanza massima"
              name="raggio"
              value={radius}
              onChange={chooseRadius}
              options={RADIUS_OPTIONS_KM.map((r) => ({ value: r, label: `${r} km` }))}
            />
            <Segmented
              legend="Vista"
              name="vista"
              value={view}
              onChange={(v) => updateParams({ vista: v === "mappa" ? "mappa" : null })}
              options={[
                { value: "lista", label: "Lista", icon: <List aria-hidden className="size-5" /> },
                { value: "mappa", label: "Mappa", icon: <MapIcon aria-hidden className="size-5" />, disabled: !mapAllowed },
              ]}
            />
          </div>

          <p aria-live="polite" className="flex items-center gap-2 font-bold">
            {state.status === "loading" && <LoaderCircle aria-hidden className="size-5 animate-spin text-primary" />}
            {state.status === "loading"
              ? `Cerco ${specialtyLabel.toLowerCase()} entro ${radius} km…`
              : state.status === "done"
                ? `${items.length === 1 ? "1 risultato" : `${items.length} risultati`} entro ${radius} km da ${origin.kind === "gps" ? "te" : origin.label}`
                : state.status === "error"
                  ? ""
                  : ""}
          </p>

          {state.status === "error" && (
            <div role="alert" className="space-y-3 rounded-3xl bg-red-soft p-4">
              <p className="font-bold text-red">{state.message}</p>
              <Button variant="secondary" onClick={() => void search(origin, specialty, radius)}>
                Riprova
              </Button>
            </div>
          )}

          {response && <SourceNote response={response} />}
          {response?.source === "google" && <p className="text-small text-ink-muted">Con i risultati di Google la mappa non è disponibile: usa «Indicazioni».</p>}

          {response && items.length === 0 && state.status === "done" && (
            <div className="flex items-center gap-4 rounded-3xl bg-surface-2 p-5">
              <TiltIllustration src={nessunRisultato} sizes="88px" className="w-22 shrink-0" />
              <div className="min-w-0 space-y-2">
                <p className="font-bold">Nessun risultato entro {radius} km.</p>
                <p className="text-small text-ink-muted">
                  {response.source === "osm" && "Su OpenStreetMap non tutti gli studi sono segnati. "}
                  Prova ad allargare la ricerca{specialty !== "medico-di-base" ? " o a cercare il medico di base" : ""}.
                </p>
                <div className="flex flex-wrap gap-2">
                  {nextRadius && (
                    <Button variant="secondary" onClick={() => chooseRadius(nextRadius)}>
                      Cerca entro {nextRadius} km
                    </Button>
                  )}
                  {specialty !== "medico-di-base" && (
                    <Button variant="ghost" onClick={() => chooseSpecialty("medico-di-base")}>
                      Medico di base
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className={cn("space-y-3 transition-opacity duration-200", state.status === "loading" && "opacity-60")} aria-busy={state.status === "loading"}>
              {view === "mappa" ? (
                <>
                  <DoctorMap origin={origin} doctors={mapDoctors} selectedId={selected} onSelect={setSelected} reduced={reduced} />
                  {selectedItem ? (
                    card(selectedItem, selectedIndex, true)
                  ) : (
                    <p className="rounded-2xl bg-surface-2 p-4 text-small">Tocca un segnaposto per vedere i contatti. Lo stesso numero è nella vista lista.</p>
                  )}
                </>
              ) : (
                <ol className="space-y-3">
                  {items.map((item, i) => (
                    <li key={item.doctor.id}>{card(item, i + 1)}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </section>
      )}

      <EmailSheet doctor={emailTo} specialtyLabel={specialtyLabel} summary={summary} onClose={() => setEmailTo(null)} />
    </div>
  );
}

function Note({ icon, children, action, tone = "neutral" }: { icon: ReactNode; children: ReactNode; action?: ReactNode; tone?: "primary" | "neutral" }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-3xl p-4", tone === "primary" ? "bg-primary-soft" : "bg-surface-2")}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="min-w-0 flex-1">{children}</p>
      {action && <span className="-my-1 shrink-0">{action}</span>}
    </div>
  );
}

function SourceNote({ response }: { response: DoctorSearchResponse }) {
  if (response.source === "esempio") {
    return (
      <div role="status" className="space-y-1 rounded-2xl border-2 border-dashed border-amber bg-amber-soft p-4">
        <p className="font-bold text-amber">DATI DI ESEMPIO</p>
        <p className="text-small">{response.notice ?? "Questi studi non esistono: servono solo a mostrare come funziona la sezione."}</p>
      </div>
    );
  }
  return (
    <div className="space-y-1 text-small text-ink-muted">
      {response.notice && <p className="font-bold text-ink">{response.notice}</p>}
      {response.source === "google" ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          Risultati da <GoogleMapsAttribution />
        </p>
      ) : (
        <p>
          Dati ©{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
            OpenStreetMap contributors
            <span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
          , licenza ODbL.
        </p>
      )}
      <p>Contatti e orari possono non essere aggiornati: chiedi conferma quando chiami.</p>
    </div>
  );
}

function Segmented<T extends string | number>({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string; icon?: ReactNode; disabled?: boolean }>;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <div className="flex gap-1 rounded-2xl bg-surface-2 p-1">
        {options.map((o) => (
          <label
            key={String(o.value)}
            className={cn(
              "relative flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-small font-bold text-ink-muted",
              "transition-[background-color,color] duration-150 ease-out",
              "has-checked:bg-surface has-checked:text-primary has-checked:shadow-sm",
              "has-focus-visible:outline-3 has-focus-visible:outline-focus",
              o.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.icon}
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
