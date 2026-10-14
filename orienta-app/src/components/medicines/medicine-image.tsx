import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import type { MedicineSummary } from "@/lib/medicines/types";
import { Txt } from "~/components/ui/text";
import { openSource } from "~/lib/links";
import { medicinePhoto } from "~/lib/medicine-photo";
import { FormArt } from "./form-art";

/** L'immagine del farmaco: una foto con licenza libera se c'è, altrimenti l'illustrazione della forma */
export function MedicineImage({ medicine: m, size }: { medicine: Pick<MedicineSummary, "imageUrl" | "formFamily">; size: number }) {
  const photo = medicinePhoto(m.imageUrl);
  if (photo !== null) return <Image source={photo} style={[styles.photo, { width: size, height: size }]} contentFit="contain" accessible={false} />;
  return <FormArt family={m.formFamily} size={size} />;
}

/** Autore, licenza e fonte della foto; se la confezione è estera lo si dice */
export function PhotoCredit({ medicine: m }: { medicine: Pick<MedicineSummary, "imageUrl" | "imageCredit" | "imageSource" | "imageCountry"> }) {
  if (!m.imageCredit || medicinePhoto(m.imageUrl) === null) return null;
  const foreign = m.imageCountry && m.imageCountry !== "Italia";
  const source = m.imageSource;
  return (
    <Txt variant="small" tone="inkMuted">
      {foreign ? (
        <Txt variant="small" bold>
          Foto di una confezione venduta in {m.imageCountry}: può essere diversa da quella italiana.{" "}
        </Txt>
      ) : null}
      Foto:{" "}
      {source ? (
        <Txt variant="small" tone="inkMuted" role="link" accessibilityHint="Si apre nel browser" onPress={() => openSource(source)} style={styles.link}>
          {m.imageCredit}
        </Txt>
      ) : (
        m.imageCredit
      )}
    </Txt>
  );
}

const styles = StyleSheet.create({
  photo: { borderRadius: 12, backgroundColor: "#ffffff" },
  link: { textDecorationLine: "underline" },
});
