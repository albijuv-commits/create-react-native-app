import { router } from "expo-router";
import { ChevronDown, PlayCircle, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { URGENCY } from "@/lib/design/urgency";
import type { HistoryEntry } from "@/lib/storage/history";
import { SummaryActions } from "~/components/triage/doctor-summary";
import { Button } from "~/components/ui/button";
import { Txt } from "~/components/ui/text";
import { announceOnIOS } from "~/lib/a11y";
import { clearSessions, deleteSession, useHistory } from "~/lib/history";
import { LEVEL_UI } from "~/lib/urgency";
import { useTheme } from "~/theme/theme";

const COMPATIBILITY = { alta: "compatibilità alta", media: "compatibilità media", bassa: "compatibilità bassa" } as const;
const when = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** La scheda di una condizione si apre nella pila del Profilo: «Indietro» riporta allo storico */
const openCondition = (id: string) => router.push({ pathname: "/profilo/condizione/[id]", params: { id } });

/** Una conferma prima di eliminare: non si può annullare */
function Confirm({ question, confirmLabel, onConfirm, onCancel }: { question: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  return (
    <View accessibilityLiveRegion="polite" style={[styles.confirm, { backgroundColor: colors.redSoft }]}>
      <Txt variant="small" bold>
        {question}
      </Txt>
      <View style={styles.confirmRow}>
        <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
        <Button label="Annulla" variant="ghost" onPress={onCancel} />
      </View>
    </View>
  );
}

function Entry({ entry }: { entry: HistoryEntry }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [failed, setFailed] = useState(false);
  const ui = LEVEL_UI[entry.urgency];
  const Icon = ui.icon;
  const at = when.format(new Date(entry.createdAt));
  const none = entry.unidentified || entry.conditions.length === 0;

  const remove = async () => {
    try {
      await deleteSession(entry.id);
      announceOnIOS("Sessione eliminata dallo storico.");
    } catch {
      setFailed(true);
    }
  };

  return (
    <View role="listitem" style={[styles.entry, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={styles.entryHead}>
        <View style={[styles.badge, { backgroundColor: colors[ui.soft] }]}>
          <Icon color={colors[ui.color]} size={24} />
        </View>
        <View style={styles.flexGap}>
          <Txt variant="small" tone="inkMuted">
            {at} · {entry.age} anni · {entry.source === "ai" ? "con l'AI" : "metodo semplificato"}
          </Txt>
          <Txt bold tone={ui.color}>
            {URGENCY[entry.urgency].label}
          </Txt>
          {none ? (
            <Txt variant="small">Nessuna corrispondenza chiara con le schede di Orienta.</Txt>
          ) : (
            <View role="list" style={styles.conditions}>
              {entry.conditions.map((c) => (
                <Txt key={c.id} role="listitem" variant="small">
                  <Txt variant="small" bold tone="primary" role="link" accessibilityHint="Apre la scheda" onPress={() => openCondition(c.id)} style={styles.link}>
                    {c.name}
                  </Txt>
                  <Txt variant="small" tone="inkMuted">{`, ${COMPATIBILITY[c.compatibility]}`}</Txt>
                </Txt>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={[styles.details, { backgroundColor: colors.surface2 }]}>
        <Pressable role="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.detailsHead}>
          <Txt bold tone="primary" style={styles.flex}>
            Riepilogo per il medico
          </Txt>
          <ChevronDown color={colors.primary} size={20} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
        </Pressable>
        {open && (
          <View style={styles.detailsBody}>
            <Txt variant="small" selectable>
              {entry.summary}
            </Txt>
            <SummaryActions text={entry.summary} />
          </View>
        )}
      </View>

      {confirm ? (
        <Confirm question="Eliminare questa sessione dallo storico?" confirmLabel="Sì, elimina" onConfirm={() => void remove()} onCancel={() => setConfirm(false)} />
      ) : (
        <Button label="Elimina" icon={Trash2} variant="ghost" onPress={() => setConfirm(true)} hint={`Elimina la sessione del ${at}`} />
      )}
      {failed && (
        <Txt variant="small" bold tone="red" accessibilityLiveRegion="polite">
          Non riusciamo a eliminarla. Riprova.
        </Txt>
      )}
    </View>
  );
}

/** Le sessioni salvate su questo telefono, dalla più recente */
export function HistoryList() {
  const { colors } = useTheme();
  const history = useHistory();
  const [confirmAll, setConfirmAll] = useState(false);
  const [clearFailed, setClearFailed] = useState(false);

  if (history.status === "loading") {
    return (
      <View accessibilityLiveRegion="polite" style={styles.row}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Txt variant="small" tone="inkMuted">
          Apro lo storico…
        </Txt>
      </View>
    );
  }
  if (history.status === "unavailable") {
    return (
      <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
        <Txt variant="small">Non riusciamo a leggere lo storico su questo telefono. Riprova più tardi.</Txt>
      </View>
    );
  }
  if (history.sessions.length === 0) {
    return (
      <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
        <Txt variant="small">Non hai sessioni salvate. Alla fine di un&apos;intervista puoi salvarla con «Salva nello storico»: resta solo su questo telefono.</Txt>
        <Button label="Inizia un'intervista" icon={PlayCircle} variant="secondary" onPress={() => router.navigate("/sintomi/intervista")} />
      </View>
    );
  }

  const clearAll = async () => {
    setConfirmAll(false);
    try {
      await clearSessions();
      setClearFailed(false);
      announceOnIOS("Storico svuotato.");
    } catch {
      setClearFailed(true);
    }
  };

  return (
    <View style={styles.list}>
      <Txt variant="small" tone="inkMuted">
        {history.sessions.length === 1 ? "1 sessione salvata" : `${history.sessions.length} sessioni salvate`} su questo telefono.
      </Txt>
      <View role="list" style={styles.list}>
        {history.sessions.map((e) => (
          <Entry key={e.id} entry={e} />
        ))}
      </View>
      {confirmAll ? (
        <Confirm question="Eliminare tutte le sessioni dello storico?" confirmLabel="Sì, svuota lo storico" onConfirm={() => void clearAll()} onCancel={() => setConfirmAll(false)} />
      ) : (
        <Button label="Svuota lo storico" icon={Trash2} variant="ghost" onPress={() => setConfirmAll(true)} />
      )}
      {clearFailed && (
        <Txt variant="small" bold tone="red" accessibilityLiveRegion="polite">
          Non riusciamo a svuotare lo storico. Riprova.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  box: { gap: 12, borderRadius: 24, padding: 16 },
  list: { gap: 12 },
  entry: { gap: 12, borderWidth: 1, borderRadius: 24, padding: 16 },
  entryHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: 2 },
  conditions: { gap: 2 },
  link: { textDecorationLine: "underline" },
  details: { borderRadius: 16 },
  detailsHead: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, paddingHorizontal: 16 },
  detailsBody: { gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  confirm: { gap: 8, borderRadius: 16, padding: 12 },
  confirmRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
