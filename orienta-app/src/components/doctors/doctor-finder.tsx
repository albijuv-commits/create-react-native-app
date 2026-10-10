import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { FileText, List, Map as MapIcon, Phone, Stethoscope, type LucideIcon } from "lucide-react-native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SPECIALTY_IDS, getSpecialty, type SpecialtyId } from "@data/vocab/specialties";
import nessunRisultato from "@/assets/illustrations/stato-nessun-risultato.webp";
import { DoctorsRequestError } from "@/lib/doctors/client";
import { distanceM } from "@/lib/doctors/geo";
import { DEFAULT_RADIUS_KM, RADIUS_OPTIONS_KM, type Doctor, type DoctorSearchResponse, type RadiusKm } from "@/lib/doctors/schema";
import { Button } from "~/components/ui/button";
import { Segmented } from "~/components/ui/segmented";
import { Txt } from "~/components/ui/text";
import { searchDoctors } from "~/lib/api";
import { clearSummaryForDoctors, useSummaryForDoctors } from "~/lib/doctor-handoff";
import { SPECIALIST_ILLUSTRATIONS } from "~/lib/illustrations";
import { call } from "~/lib/links";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import { useTheme } from "~/theme/theme";
import { GoogleMapsAttribution, OsmCredit } from "./credits";
import { DoctorCard, ExampleTag } from "./doctor-card";
import { DoctorMap } from "./doctor-map";
import { EmailSheet } from "./email-sheet";
import { LocationPicker, type Origin } from "./location-picker";
import { SpecialtyPicker } from "./specialty-picker";

export interface ConditionRef {
  name: string;
  specialist: SpecialtyId;
}

/** L'ultima ricerca finita, con la chiave di chi, dove e quanto lontano: se la chiave è cambiata, se ne sta facendo un'altra */
type SearchResult = { key: string; response: DoctorSearchResponse } | { key: string; error: string };

type Params = { specialista?: string; condizione?: string; consigliato?: string; raggio?: string; vista?: string };

const isSpecialty = (v: string | undefined): v is SpecialtyId => v !== undefined && (SPECIALTY_IDS as readonly string[]).includes(v);
const isRadius = (v: number): v is RadiusKm => (RADIUS_OPTIONS_KM as readonly number[]).includes(v);

const NON_SPECIALIST: ReadonlySet<SpecialtyId> = new Set(["medico-di-base", "pediatra", "pronto-soccorso"]);

/**
 * La ricerca dei professionisti: chi (con il medico di base sempre come primo passo), dove
 * (posizione o città), quanto lontano, in lista o sulla mappa schematica. Specialità, distanza e
 * vista stanno nei parametri della schermata, come nella web app; la posizione no. Si arriva anche
 * dai risultati dell'intervista e dalle schede, con lo specialista già scelto.
 */
export function DoctorFinder({ conditions }: { conditions: Record<string, ConditionRef> }) {
  const params = useLocalSearchParams<Params>();
  const reduced = useReducedMotion();
  const summary = useSummaryForDoctors();
  const { colors } = useTheme();

  const condition = conditions[params.condizione ?? ""] ?? null;
  const specialty: SpecialtyId = isSpecialty(params.specialista) ? params.specialista : (condition?.specialist ?? "medico-di-base");
  const radiusParam = Number(params.raggio);
  const radius: RadiusKm = isRadius(radiusParam) ? radiusParam : DEFAULT_RADIUS_KM;
  // Lo specialista consigliato è quello del link d'arrivo (per i più piccoli può essere il pediatra) e resta tale anche se se ne sceglie un altro
  const recommended: SpecialtyId | null = condition ? (isSpecialty(params.consigliato) ? params.consigliato : specialty) : null;

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState<Doctor | null>(null);

  // Si cerca quando cambiano chi, dove o quanto lontano, anche arrivando dai risultati con un altro specialista
  const key = origin ? `${specialty}|${radius}|${origin.lat}|${origin.lon}|${attempt}` : null;
  useEffect(() => {
    if (!origin || key === null) return;
    const c = new AbortController();
    searchDoctors({ specialty, lat: origin.lat, lon: origin.lon, radiusKm: radius }, c.signal).then(
      (response) => {
        if (c.signal.aborted) return;
        setSelected(null);
        setResult({ key, response });
      },
      (error: unknown) => {
        if (c.signal.aborted) return;
        setResult({ key, error: error instanceof DoctorsRequestError ? error.message : "Qualcosa è andato storto. Riprova tra poco." });
      },
    );
    return () => c.abort();
  }, [key, origin, specialty, radius]);

  const chooseSpecialty = (s: SpecialtyId) => {
    router.setParams({ specialista: s, ...(recommended && !isSpecialty(params.consigliato) ? { consigliato: recommended } : {}) });
  };
  const chooseRadius = (r: RadiusKm) => router.setParams({ raggio: r === DEFAULT_RADIUS_KM ? undefined : String(r) });

  const loading = key !== null && result?.key !== key;
  // Mentre si cerca restano visibili (più chiari) i risultati di prima
  const response = result && "response" in result ? result.response : null;
  const error = !loading && result && "error" in result ? result.error : null;
  // I risultati di Google non si possono mostrare su una mappa che non sia di Google
  const mapAllowed = response?.source !== "google";
  const view = params.vista === "mappa" && mapAllowed ? "mappa" : "lista";

  // Con la posizione del telefono le distanze si ricalcolano qui, con le coordinate esatte che non sono mai uscite dal dispositivo
  const items = useMemo(() => {
    if (!response || !origin) return [];
    return response.doctors
      .map((doctor) => ({ doctor, distance: origin.kind === "gps" ? distanceM(origin, doctor) : doctor.distanceM }))
      .sort((a, b) => a.distance - b.distance);
  }, [response, origin]);

  const specialtyLabel = getSpecialty(specialty).label;
  const nextRadius = RADIUS_OPTIONS_KM.find((r) => r > radius);
  const selectedItem = items.find((i) => i.doctor.id === selected) ?? null;
  const selectedIndex = selectedItem ? items.indexOf(selectedItem) + 1 : 0;
  const source = response?.source ?? "esempio";
  const art = SPECIALIST_ILLUSTRATIONS["medico-di-base"];

  return (
    <View style={styles.finder}>
      {(condition || summary) && (
        <View style={styles.notes}>
          {condition && recommended && (
            <Note icon={Stethoscope} tone="primary">
              <Txt>
                Specialista di riferimento per «{condition.name}»: <Txt bold>{getSpecialty(recommended).label}</Txt>.
              </Txt>
            </Note>
          )}
          {summary && (
            <Note icon={FileText} action={<Button label="Togli" variant="ghost" onPress={clearSummaryForDoctors} hint="Toglie il riepilogo dei sintomi preparato con l'intervista" />}>
              <Txt bold>Il riepilogo dei tuoi sintomi è pronto</Txt>
              <Txt variant="small">Puoi aggiungerlo all&apos;email per il medico. Resta solo su questo telefono.</Txt>
            </Note>
          )}
        </View>
      )}

      <View style={styles.block}>
        <SpecialtyPicker value={specialty} onChange={chooseSpecialty} recommended={recommended} reduced={reduced} />
        {specialty === "pronto-soccorso" ? (
          <View style={[styles.box, { backgroundColor: colors.redSoft }]}>
            <Txt bold tone="red">
              In un&apos;emergenza non cercare: chiama subito il 112.
            </Txt>
            <Button label="Chiama il 112" icon={Phone} variant="danger" onPress={() => call("112")} hint="Apre il telefono con il 112 già composto" />
          </View>
        ) : (
          !NON_SPECIALIST.has(specialty) && (
            <View style={[styles.box, styles.firstStep, { backgroundColor: colors.surface, borderColor: colors.primarySoft }]}>
              {art !== undefined && <Image source={art} style={styles.firstStepArt} contentFit="contain" accessible={false} />}
              <View style={styles.flex}>
                <Txt bold>Primo passo: il medico di base</Txt>
                <Txt variant="small">
                  Ti visita, valuta se serve davvero lo specialista e, con il Servizio sanitario nazionale, ti fa la ricetta per prenotare. Per i bambini e i
                  ragazzi, il pediatra.
                </Txt>
                <Button label="Cerca il medico di base" variant="ghost" onPress={() => chooseSpecialty("medico-di-base")} style={styles.ghostStart} />
              </View>
            </View>
          )
        )}
      </View>

      <LocationPicker origin={origin} onOrigin={setOrigin} />

      {origin && (
        <View style={styles.block}>
          <Txt variant="heading" header>
            Risultati
          </Txt>
          <Segmented
            label="Distanza massima"
            value={String(radius)}
            onChange={(v) => chooseRadius(Number(v) as RadiusKm)}
            options={RADIUS_OPTIONS_KM.map((r) => ({ value: String(r), label: `${r} km` }))}
          />
          <Segmented
            label="Vista"
            value={view}
            onChange={(v) => router.setParams({ vista: v === "mappa" ? "mappa" : undefined })}
            options={[
              { value: "lista", label: "Lista", icon: List },
              { value: "mappa", label: "Mappa", icon: MapIcon, disabled: !mapAllowed },
            ]}
          />

          <View accessibilityLiveRegion="polite" style={styles.status}>
            {loading && <ActivityIndicator color={colors.primary} />}
            <Txt bold style={styles.flex}>
              {loading
                ? `Cerco ${specialtyLabel.toLowerCase()} entro ${radius} km…`
                : response
                  ? `${items.length === 1 ? "1 risultato" : `${items.length} risultati`} entro ${radius} km da ${origin.kind === "gps" ? "te" : origin.label}`
                  : ""}
            </Txt>
          </View>

          {error && (
            <View accessibilityRole="alert" style={[styles.box, { backgroundColor: colors.redSoft }]}>
              <Txt bold tone="red">
                {error}
              </Txt>
              <Button label="Riprova" variant="secondary" onPress={() => setAttempt((a) => a + 1)} />
            </View>
          )}

          {response && <SourceNote response={response} />}
          {response?.source === "google" && (
            <Txt variant="small" tone="inkMuted">
              Con i risultati di Google la mappa non è disponibile: usa «Indicazioni».
            </Txt>
          )}

          {response && items.length === 0 && !loading && (
            <View style={[styles.box, styles.empty, { backgroundColor: colors.surface2 }]}>
              <Image source={nessunRisultato} style={styles.emptyArt} contentFit="contain" accessible={false} />
              <View style={styles.flex}>
                <Txt bold>Nessun risultato entro {radius} km.</Txt>
                <Txt variant="small" tone="inkMuted">
                  {response.source === "osm" ? "Su OpenStreetMap non tutti gli studi sono segnati. " : ""}
                  Prova ad allargare la ricerca{specialty !== "medico-di-base" ? " o a cercare il medico di base" : ""}.
                </Txt>
                <View style={styles.emptyActions}>
                  {nextRadius && <Button label={`Cerca entro ${nextRadius} km`} variant="secondary" onPress={() => chooseRadius(nextRadius)} />}
                  {specialty !== "medico-di-base" && <Button label="Medico di base" variant="ghost" onPress={() => chooseSpecialty("medico-di-base")} />}
                </View>
              </View>
            </View>
          )}

          {items.length > 0 && (
            <View aria-busy={loading} style={[styles.results, loading && styles.dim]}>
              {view === "mappa" ? (
                <>
                  <DoctorMap origin={origin} items={items} radiusKm={radius} selectedId={selected} onSelect={setSelected} reduced={reduced} />
                  {selectedItem ? (
                    <DoctorCard doctor={selectedItem.doctor} index={selectedIndex} distance={selectedItem.distance} source={source} onEmail={setEmailTo} highlighted />
                  ) : (
                    <View style={[styles.hint, { backgroundColor: colors.surface2 }]}>
                      <Txt variant="small">Tocca un numero per vedere i contatti. Lo stesso numero è nella vista lista.</Txt>
                    </View>
                  )}
                </>
              ) : (
                <View role="list" style={styles.results}>
                  {items.map((item, i) => (
                    <View key={item.doctor.id} role="listitem">
                      <DoctorCard doctor={item.doctor} index={i + 1} distance={item.distance} source={source} onEmail={setEmailTo} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <EmailSheet doctor={emailTo} specialtyLabel={specialtyLabel} summary={summary} onClose={() => setEmailTo(null)} />
    </View>
  );
}

function Note({ icon: Icon, children, action, tone = "neutral" }: { icon: LucideIcon; children: ReactNode; action?: ReactNode; tone?: "primary" | "neutral" }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.note, { backgroundColor: tone === "primary" ? colors.primarySoft : colors.surface2 }]}>
      <Icon color={colors.primary} size={24} style={styles.noteIcon} />
      <View style={styles.flex}>{children}</View>
      {action}
    </View>
  );
}

/** Da dove arrivano i risultati: i dati di esempio sono sempre etichettati, gli altri citano la fonte */
function SourceNote({ response }: { response: DoctorSearchResponse }) {
  const { colors } = useTheme();
  if (response.source === "esempio") {
    return (
      <View accessible role="status" style={[styles.box, styles.exampleBox, { backgroundColor: colors.amberSoft, borderColor: colors.amber }]}>
        <ExampleTag />
        <Txt variant="small">{response.notice ?? "Questi studi non esistono: servono solo a mostrare come funziona la sezione."}</Txt>
      </View>
    );
  }
  return (
    <View style={styles.sourceNote}>
      {response.notice && <Txt bold>{response.notice}</Txt>}
      {response.source === "google" ? (
        <View style={styles.googleLine}>
          <Txt variant="small" tone="inkMuted">
            Risultati da
          </Txt>
          <GoogleMapsAttribution />
        </View>
      ) : (
        <OsmCredit before="Dati © " after=", licenza ODbL." />
      )}
      <Txt variant="small" tone="inkMuted">
        Contatti e orari possono non essere aggiornati: chiedi conferma quando chiami.
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  finder: { gap: 28 },
  notes: { gap: 12 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 24, padding: 16 },
  noteIcon: { marginTop: 2 },
  flex: { flex: 1, gap: 4 },
  block: { gap: 16 },
  box: { gap: 12, borderRadius: 24, padding: 16 },
  firstStep: { flexDirection: "row", alignItems: "flex-start", borderWidth: 2 },
  firstStepArt: { width: 56, height: 56 },
  ghostStart: { marginLeft: -8, alignSelf: "flex-start" },
  status: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 24 },
  empty: { flexDirection: "row", alignItems: "center" },
  emptyArt: { width: 88, height: 88 },
  emptyActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  results: { gap: 12 },
  dim: { opacity: 0.6 },
  hint: { borderRadius: 16, padding: 16 },
  exampleBox: { borderWidth: 2, borderStyle: "dashed", gap: 6 },
  sourceNote: { gap: 4 },
  googleLine: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
});
