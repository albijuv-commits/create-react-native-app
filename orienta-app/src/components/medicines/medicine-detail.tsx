import { FileDown, Info } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, type Text } from "react-native";
import { atcGroupLabel } from "@/lib/medicines/atc";
import { FORM_FAMILY_LABEL } from "@/lib/medicines/forms";
import { ingredientInfo } from "@/lib/medicines/ingredients";
import { supplyBadge, SUPPLY_BADGE_LABEL, SUPPLY_CODE_DESCRIPTION, type SupplyCode } from "@/lib/medicines/regime";
import { displayCompany, formatEuro, formatItalianDay, sentenceCase } from "@/lib/medicines/text";
import type { MedicineDetailResponse, MedicineSummary } from "@/lib/medicines/types";
import { Txt } from "~/components/ui/text";
import { openSource } from "~/lib/links";
import { medicinePhoto } from "~/lib/medicine-photo";
import { useSectionJump } from "~/lib/use-section-jump";
import { useTheme } from "~/theme/theme";
import { ReimbursableBadge, SupplyBadge } from "./badges";
import { openMedicine } from "./brands-disclosure";
import { BrandsSection } from "./brands-section";
import { EuBrands } from "./eu-brands";
import { IngredientSection } from "./ingredient-section";
import { CompareButton, FavoriteButton } from "./list-buttons";
import { MedicineImage, PhotoCredit } from "./medicine-image";
import { ExampleDataNotice, ExternalButton, ONLINE_CHECK } from "./notices";
import { Price } from "./price";

const EQUIVALENTS_FAQ = "https://www.aifa.gov.it/domande-e-risposte-su-farmaci-equivalenti";
const EQUIVALENTS_FIRST = 8;

type SectionId = "prezzo" | "principio-attivo" | "equivalenti" | "marchi" | "in-europa";

/** Dove si trova e cosa serve, secondo il regime di fornitura */
function whereToGet(code: SupplyCode | null): string {
  switch (supplyBadge(code)) {
    case "senza-ricetta":
      return "Si compra in farmacia o in parafarmacia. Online solo nei siti autorizzati dal Ministero della Salute, riconoscibili dal logo identificativo.";
    case "con-ricetta":
      return "Si ritira in farmacia con la ricetta. I medicinali con ricetta non si possono vendere online.";
    case "ospedaliero":
    case "specialista":
      return "Non si compra in farmacia.";
    default:
      return "Il regime di fornitura non è indicato nei dati AIFA: chiedi al farmacista.";
  }
}

function EquivalentRow({ g, self, lowest, markLowest, first }: { g: MedicineSummary; self: boolean; lowest: number | null; markLowest: boolean; first: boolean }) {
  const { colors } = useTheme();
  const isLowest = lowest !== null && g.price === lowest;
  return (
    <View
      role="listitem"
      style={[styles.eqRow, self && { backgroundColor: colors.primarySoft }, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}
    >
      <View style={styles.flex}>
        {self ? (
          <Txt bold>
            {g.name}{" "}
            <Txt variant="small" tone="inkMuted">
              (questa confezione)
            </Txt>
          </Txt>
        ) : (
          <Txt bold tone="primary" role="link" accessibilityHint="Apre la scheda" onPress={() => openMedicine(g.aic)} style={styles.link}>
            {g.name}
          </Txt>
        )}
        <Txt variant="small" tone="inkMuted">
          {displayCompany(g.company)}
        </Txt>
        {isLowest && markLowest && (
          <Txt variant="small" bold tone="accent">
            Prezzo più basso del gruppo
          </Txt>
        )}
      </View>
      {g.price !== null ? (
        <Txt bold tone={isLowest && !markLowest ? "accent" : "ink"} style={styles.eqPrice}>
          {formatEuro(g.price)}
        </Txt>
      ) : (
        <Txt variant="small" tone="inkMuted" style={styles.eqPrice}>
          Prezzo non indicato
        </Txt>
      )}
    </View>
  );
}

/**
 * La scheda di una confezione, come nella web app: informazioni principali, foglietto illustrativo
 * ufficiale, avviso di chiedere consiglio, il principio attivo, farmaci equivalenti dal più
 * economico, marchi e aziende, gli stessi principi attivi in Europa. Niente linguaggio pubblicitario.
 */
export function MedicineDetail({ data }: { data: MedicineDetailResponse }) {
  const { colors } = useTheme();
  const { medicine: m, equivalents, info, brands, europe } = data;
  const [allEquivalents, setAllEquivalents] = useState(false);
  const { scroller, place, heading, jump } = useSectionJump<SectionId>();

  const ingredient = ingredientInfo(m.ingredientKey);
  const code = m.supplyCode;
  const badge = supplyBadge(code);
  const sorted = [m, ...equivalents].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || a.name.localeCompare(b.name, "it"));
  // La confezione aperta resta sempre visibile tra le prime righe dell'elenco
  const selfIndex = sorted.findIndex((g) => g.aic === m.aic);
  const group =
    selfIndex >= EQUIVALENTS_FIRST
      ? [...sorted.slice(0, EQUIVALENTS_FIRST - 1), sorted[selfIndex]!, ...sorted.filter((_, i) => i >= EQUIVALENTS_FIRST - 1 && i !== selfIndex)]
      : sorted;
  const lowest = group.find((g) => g.price !== null)?.price ?? null;
  const lowestCount = lowest === null ? 0 : group.filter((g) => g.price === lowest).length;
  const shownGroup = allEquivalents ? group : group.slice(0, EQUIVALENTS_FIRST);
  const atcLabel = atcGroupLabel(m.atcGroup);
  const otc = code === "OTC" || code === "SOP";
  const showBrands = brands !== null && brands.brands.length > 1;
  const routeLabel = europe?.sameRoute ? (europe.brands[0]?.routes.find((r) => europe.brands.every((b) => b.routes.includes(r))) ?? null) : null;
  const hasPhoto = medicinePhoto(m.imageUrl) !== null;
  const sections = (
    [
      ["prezzo", "Prezzo", true],
      ["principio-attivo", "Principio attivo", ingredient !== null],
      ["equivalenti", "Equivalenti", true],
      ["marchi", "Marchi e aziende", showBrands],
      ["in-europa", "In Europa", europe !== null],
    ] as const
  )
    .filter(([, , shown]) => shown)
    .map(([id, label]) => ({ id, label }));
  const leaflet = m.leafletUrl;


  const facts: [string, string][] = [
    ["Principio attivo", m.activeIngredient],
    ["Dosaggio e confezione", m.description],
    ["Forma farmaceutica", `${m.form} (${FORM_FAMILY_LABEL[m.formFamily].toLowerCase()})`],
    ["Titolare dell'autorizzazione", displayCompany(m.company)],
    ["Codice AIC", m.aic],
    ["Categoria terapeutica (ATC)", [m.atc, atcLabel, m.atcClass ? sentenceCase(m.atcClass) : null].filter(Boolean).join(" · ") || "Non indicata"],
    [
      "Classe di rimborsabilità",
      m.reimbursementClass === "A"
        ? "A: rimborsabile dal Servizio sanitario nazionale"
        : m.reimbursementClass === "H"
          ? "H: a carico del Servizio sanitario, in ambito ospedaliero"
          : "Non presente nelle liste di Classe A e H",
    ],
  ];

  return (
    <ScrollView ref={scroller} style={[styles.fill, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      {info.source === "esempio" && <ExampleDataNotice count={info.count} />}

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={[styles.art, { backgroundColor: hasPhoto ? "#ffffff" : colors.surface2 }]}>
            <MedicineImage medicine={m} size={hasPhoto ? 120 : 104} />
          </View>
          <View style={styles.headerText}>
            <Txt variant="small" bold tone="primary">
              {m.activeIngredient}
            </Txt>
            <Txt variant="title" header>
              {m.name}
            </Txt>
            <Txt variant="small">{m.description}</Txt>
            <View style={styles.badges}>
              <SupplyBadge code={code} />
              {m.reimbursementClass === "A" && <ReimbursableBadge />}
            </View>
          </View>
        </View>
        {hasPhoto && (
          <View style={styles.caption}>
            {m.imageCaption ? <Txt variant="small">Nella foto: {m.imageCaption}.</Txt> : null}
            <PhotoCredit medicine={m} />
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        <FavoriteButton aic={m.aic} name={m.name} />
        <CompareButton aic={m.aic} name={m.name} />
      </View>

      {sections.length > 2 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navRow} contentContainerStyle={styles.navContent} accessibilityLabel="In questa scheda">
          {sections.map((s) => (
            <Pressable
              key={s.id}
              role="button"
              accessibilityHint="Scorre fino alla sezione"
              onPress={() => jump(s.id)}
              style={({ pressed }) => [styles.navChip, { borderColor: colors.line, backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            >
              <Txt variant="small" bold tone="primary">
                {s.label}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View onLayout={(e) => place("prezzo", e.nativeEvent.layout.y)} style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <Txt ref={(node: Text | null) => heading("prezzo", node)} bold header>
          Prezzo
        </Txt>
        <Price medicine={m} size="lg" />
        {m.referencePrice !== null && (
          <>
            <Txt variant="small">
              Prezzo di riferimento SSN:{" "}
              <Txt variant="small" bold style={styles.tabular}>
                {formatEuro(m.referencePrice)}
              </Txt>
              . È il limite di rimborso del Servizio sanitario per i farmaci equivalenti: se si sceglie una confezione più cara, la differenza è a carico di chi la
              acquista.
            </Txt>
            <ExternalButton label="Domande e risposte AIFA" url={EQUIVALENTS_FAQ} />
          </>
        )}
      </View>

      <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
        <Txt bold header>
          {SUPPLY_BADGE_LABEL[badge]}
          {code ? <Txt tone="inkMuted">{` (${code})`}</Txt> : null}
        </Txt>
        {code && <Txt variant="small">{SUPPLY_CODE_DESCRIPTION[code]}</Txt>}
        <Txt variant="small">{whereToGet(code)}</Txt>
        {badge === "senza-ricetta" && <ExternalButton label="Verifica un sito di vendita online" url={ONLINE_CHECK} hint="Ministero della Salute, si apre nel browser" />}
      </View>

      <View style={[styles.advice, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
        <Info color={colors.primary} size={24} style={styles.icon} />
        <View style={styles.flexGap}>
          <Txt bold>Chiedi consiglio al medico o al farmacista.</Txt>
          <Txt variant="small">Prima di usare un medicinale leggi il foglietto illustrativo. Orienta non consiglia farmaci per i tuoi sintomi.</Txt>
        </View>
      </View>

      {leaflet && (
        <Pressable
          role="link"
          accessibilityLabel="Foglietto illustrativo ufficiale, PDF dalla Banca Dati Farmaci dell'AIFA"
          accessibilityHint="Si apre nel browser"
          onPress={() => openSource(leaflet)}
          style={({ pressed }) => [
            styles.leaflet,
            { borderColor: colors.primary, backgroundColor: pressed ? colors.primarySoft : colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <FileDown color={colors.primary} size={24} />
          <View style={styles.flex}>
            <Txt bold tone="primary">
              Foglietto illustrativo ufficiale
            </Txt>
            <Txt variant="small" tone="inkMuted">
              PDF dalla Banca Dati Farmaci dell&apos;AIFA
            </Txt>
          </View>
        </Pressable>
      )}

      <View style={styles.section}>
        <Txt variant="heading" header>
          Informazioni principali
        </Txt>
        <View style={[styles.facts, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          {facts.map(([label, value], i) => (
            <View key={label} accessible style={[styles.fact, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
              <Txt variant="small" tone="inkMuted">
                {label}
              </Txt>
              <Txt bold>{value}</Txt>
            </View>
          ))}
        </View>
      </View>

      {ingredient && (
        <View onLayout={(e) => place("principio-attivo", e.nativeEvent.layout.y)}>
          <IngredientSection info={ingredient} headingRef={(node: Text | null) => heading("principio-attivo", node)} />
        </View>
      )}

      <View onLayout={(e) => place("equivalenti", e.nativeEvent.layout.y)} style={styles.section}>
        <View style={styles.head}>
          <Txt ref={(node: Text | null) => heading("equivalenti", node)} variant="heading" header>
            Farmaci equivalenti
          </Txt>
          <Txt variant="small" tone="inkMuted">
            Stesso principio attivo, dosaggio e forma, dal prezzo più basso.
          </Txt>
        </View>
        {equivalents.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface2 }]}>
            <Txt variant="small">Nel catalogo non ci sono equivalenti di questa confezione.</Txt>
          </View>
        ) : (
          <>
            {lowestCount > 3 && lowest !== null && (
              <Txt variant="small">
                <Txt variant="small" bold tone="accent">
                  {lowestCount} confezioni
                </Txt>{" "}
                hanno il prezzo più basso del gruppo,{" "}
                <Txt variant="small" bold style={styles.tabular}>
                  {formatEuro(lowest)}
                </Txt>
                .
              </Txt>
            )}
            <View role="list" style={[styles.facts, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              {shownGroup.map((g, i) => (
                <EquivalentRow key={g.aic} g={g} self={g.aic === m.aic} lowest={lowest} markLowest={lowestCount <= 3} first={i === 0} />
              ))}
            </View>
            {!allEquivalents && group.length > EQUIVALENTS_FIRST && (
              <Pressable role="button" onPress={() => setAllEquivalents(true)} style={styles.more}>
                <Txt bold tone="primary" style={styles.link}>
                  Mostra gli altri {group.length - EQUIVALENTS_FIRST} equivalenti
                </Txt>
              </Pressable>
            )}
          </>
        )}
      </View>

      {showBrands && (
        <View onLayout={(e) => place("marchi", e.nativeEvent.layout.y)}>
          <BrandsSection brands={brands} selfName={m.name} otc={otc} headingRef={(node: Text | null) => heading("marchi", node)} />
        </View>
      )}

      {europe && (
        <View onLayout={(e) => place("in-europa", e.nativeEvent.layout.y)}>
          <EuBrands
            ingredient={ingredient?.name ?? m.activeIngredient}
            brands={europe.brands}
            countries={europe.countries}
            sameRoute={europe.sameRoute}
            routeLabel={routeLabel}
            updated={europe.updated}
            sourceUrl={europe.url}
            headingRef={(node: Text | null) => heading("in-europa", node)}
          />
        </View>
      )}

      <Txt variant="small" tone="inkMuted">
        Fonte: AIFA, Open Data (licenza CC BY 4.0).
        {info.registryDate ? ` Anagrafica al ${formatItalianDay(info.registryDate)}.` : ""}
        {m.priceDate ? ` Prezzo al ${formatItalianDay(m.priceDate)}.` : ""}
      </Txt>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 24, width: "100%", maxWidth: 640, alignSelf: "center" },
  header: { gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  art: { borderRadius: 24, padding: 8 },
  headerText: { flex: 1, gap: 6, paddingTop: 4 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 4 },
  caption: { gap: 2 },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  navRow: { marginHorizontal: -20 },
  navContent: { paddingHorizontal: 20, gap: 8 },
  navChip: { minHeight: 44, justifyContent: "center", borderWidth: 2, borderRadius: 999, paddingHorizontal: 16 },
  box: { gap: 8, borderWidth: 1, borderColor: "transparent", borderRadius: 24, padding: 20 },
  tabular: { fontVariant: ["tabular-nums"] },
  advice: { flexDirection: "row", gap: 12, borderWidth: 2, borderRadius: 24, padding: 16 },
  icon: { marginTop: 2 },
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: 4 },
  leaflet: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, borderWidth: 2, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
  section: { gap: 12 },
  head: { gap: 4 },
  facts: { borderWidth: 1, borderRadius: 24, overflow: "hidden" },
  fact: { gap: 2, paddingHorizontal: 16, paddingVertical: 12 },
  emptyBox: { borderRadius: 24, padding: 16 },
  eqRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  eqPrice: { textAlign: "right", fontVariant: ["tabular-nums"], flexShrink: 0 },
  more: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  link: { textDecorationLine: "underline" },
});
