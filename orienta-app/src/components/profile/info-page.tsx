import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View, type Text } from "react-native";
import { Txt } from "~/components/ui/text";
import { focusLater } from "~/lib/a11y";
import { openSource } from "~/lib/links";
import { useReducedMotion } from "~/lib/use-reduced-motion";
import { useTheme } from "~/theme/theme";

type Register = { place: (id: string, y: number) => void; heading: (id: string, node: Text | null) => void };

const SectionsContext = createContext<Register | null>(null);

/**
 * Le pagine informative del Profilo, come nella web app: titolo, data dell'ultimo aggiornamento,
 * indice delle sezioni. Toccando una voce dell'indice la pagina scorre fino alla sezione e
 * VoiceOver o TalkBack si spostano sul suo titolo.
 */
export function InfoPage({ title, lead, updated, sections, children }: { title: string; lead: string; updated: string; sections: readonly { id: string; title: string }[]; children: ReactNode }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const scroller = useRef<ScrollView>(null);
  const offsets = useRef(new Map<string, number>());
  const headings = useRef(new Map<string, Text>());

  const place = useCallback((id: string, y: number) => {
    offsets.current.set(id, y);
  }, []);
  const heading = useCallback((id: string, node: Text | null) => {
    if (node) headings.current.set(id, node);
    else headings.current.delete(id);
  }, []);

  const jump = (id: string) => {
    const y = offsets.current.get(id);
    if (y === undefined) return;
    scroller.current?.scrollTo({ y: Math.max(0, y - 12), animated: !reduced });
    focusLater({ current: headings.current.get(id) ?? null }, reduced ? 100 : 450);
  };

  return (
    <SectionsContext.Provider value={{ place, heading }}>
      <ScrollView ref={scroller} style={[styles.fill, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Txt variant="display" tone="primary" header>
            {title}
          </Txt>
          <Txt tone="inkMuted">{lead}</Txt>
          <Txt variant="small" tone="inkMuted">
            Ultimo aggiornamento: {updated}
          </Txt>
        </View>
        <View accessibilityLabel="In questa pagina" style={[styles.index, { backgroundColor: colors.surface2 }]}>
          {sections.map((s, i) => (
            <Pressable key={s.id} role="button" accessibilityHint="Scorre fino alla sezione" onPress={() => jump(s.id)} style={styles.indexItem}>
              <Txt bold tone="primary">
                {i + 1}.{" "}
                <Txt bold tone="primary" style={styles.underline}>
                  {s.title}
                </Txt>
              </Txt>
            </Pressable>
          ))}
        </View>
        {children}
      </ScrollView>
    </SectionsContext.Provider>
  );
}

export function InfoSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const register = useContext(SectionsContext);
  return (
    <View onLayout={(e) => register?.place(id, e.nativeEvent.layout.y)} style={styles.section}>
      <Txt ref={(node: Text | null) => register?.heading(id, node)} variant="heading" header>
        {title}
      </Txt>
      {children}
    </View>
  );
}

/** Una voce di elenco con il pallino; il testo può contenere parti in grassetto e link */
export function Item({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View role="listitem" style={styles.item}>
      <View style={[styles.dot, { backgroundColor: colors.ink }]} />
      <Txt style={styles.flex}>{children}</Txt>
    </View>
  );
}

/** Un elenco puntato; `nested` lo rientra sotto la voce precedente */
export function Items({ children, nested = false }: { children: ReactNode; nested?: boolean }) {
  return (
    <View role="list" style={[styles.items, nested && styles.nested]}>
      {children}
    </View>
  );
}

/** Un link esterno dentro il testo: si apre nel browser, sopra l'app */
export function External({ url, children }: { url: string; children: string }) {
  return (
    <Txt bold tone="primary" role="link" accessibilityHint="Si apre nel browser" onPress={() => openSource(url)} style={styles.underline}>
      {children}
    </Txt>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return <Txt bold>{children}</Txt>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 28, width: "100%", maxWidth: 640, alignSelf: "center" },
  header: { gap: 8 },
  index: { borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
  indexItem: { minHeight: 44, justifyContent: "center" },
  underline: { textDecorationLine: "underline" },
  section: { gap: 12 },
  items: { gap: 8 },
  nested: { paddingLeft: 16 },
  item: { flexDirection: "row", gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 11 },
  flex: { flex: 1 },
});
