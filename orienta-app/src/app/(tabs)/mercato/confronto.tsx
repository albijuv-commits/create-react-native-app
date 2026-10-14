import { ComparePanel } from "~/components/medicines/compare-panel";
import { PageHeader, Screen } from "~/components/ui/layout";

export default function ConfrontoScreen() {
  return (
    <Screen>
      <PageHeader title="Confronto" lead="Fino a tre confezioni affiancate: prezzo, dosaggio, forma e regime di fornitura." />
      <ComparePanel />
    </Screen>
  );
}
