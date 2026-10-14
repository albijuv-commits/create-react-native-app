import { CONDITIONS } from "@data/conditions";
import { CURE_NON_URGENTI, EMERGENCY_NUMBER, TELEFONO_AMICO, TELEFONO_AZZURRO } from "@data/emergency/helplines";
import photos from "@data/medicines/photos.json";
import { formatItalianDate, SOURCES_CHECKED_AT } from "@/lib/conditions/knowledge-base";
import type { Source } from "@/lib/conditions/schema";
import { BOOKING_SOURCE } from "@/lib/doctors/booking";
import { EMA_ARTICLE57_PAGE } from "@/lib/medicines/eu-brand";
import { INGREDIENTS, INGREDIENTS_CHECKED_ON } from "@/lib/medicines/ingredients";
import { photosFileSchema } from "@/lib/medicines/photos";
import { External, InfoPage, InfoSection, Item, Items } from "~/components/profile/info-page";
import { Txt } from "~/components/ui/text";

const UPDATED = "12 ottobre 2026";
const SECTIONS = [
  { id: "condizioni", title: "Schede delle condizioni" },
  { id: "numeri", title: "Numeri utili e prenotazioni" },
  { id: "farmaci", title: "Farmaci" },
  { id: "mappe", title: "Medici e mappa" },
  { id: "grafica", title: "Grafica e caratteri" },
] as const;

const PUBLISHER_HOME: Record<Source["publisher"], string> = {
  ISSalute: "https://www.issalute.it/",
  "Ministero della Salute": "https://www.salute.gov.it/",
  NHS: "https://www.nhs.uk/",
  MedlinePlus: "https://medlineplus.gov/",
  EpiCentro: "https://www.epicentro.iss.it/",
};

const PICTURES = photosFileSchema.parse(photos);
const HELPLINES = [EMERGENCY_NUMBER, CURE_NON_URGENTI, TELEFONO_AMICO, TELEFONO_AZZURRO];

/** Da dove viene ogni informazione dell'app, come nella pagina Fonti della web app */
export default function FontiScreen() {
  const cited = new Map<Source["publisher"], Set<string>>();
  for (const c of CONDITIONS) for (const s of c.sources) (cited.get(s.publisher) ?? cited.set(s.publisher, new Set()).get(s.publisher)!).add(s.url);
  const publishers = [...cited.entries()].sort((a, b) => b[1].size - a[1].size);

  return (
    <InfoPage
      title="Fonti"
      lead="Orienta non inventa contenuti: ogni informazione viene da una fonte pubblica, citata qui e accanto a ciò che mostra."
      updated={UPDATED}
      sections={SECTIONS}
    >
      <InfoSection id="condizioni" title="Schede delle condizioni">
        <Txt>
          Le {CONDITIONS.length} schede sono scritte a partire da queste fonti sanitarie pubbliche. Ogni scheda elenca in fondo le pagine usate; i link sono stati
          verificati il {formatItalianDate(SOURCES_CHECKED_AT)}.
        </Txt>
        <Items>
          {publishers.map(([publisher, urls]) => (
            <Item key={publisher}>
              <External url={PUBLISHER_HOME[publisher]}>{publisher}</External>: {urls.size === 1 ? "1 pagina" : `${urls.size} pagine`}
            </Item>
          ))}
        </Items>
      </InfoSection>

      <InfoSection id="numeri" title="Numeri utili e prenotazioni">
        <Items>
          {HELPLINES.map((h) => (
            <Item key={h.number}>
              {h.name} ({h.number}): <External url={h.source}>fonte</External>, verificata il {formatItalianDate(h.verifiedAt)}
            </Item>
          ))}
          <Item>
            Come prenotare una visita con il Servizio sanitario: <External url={BOOKING_SOURCE}>Ministero della Salute, ricetta elettronica e CUP</External>
          </Item>
        </Items>
      </InfoSection>

      <InfoSection id="farmaci" title="Farmaci">
        <Items>
          <Item>
            Catalogo, prezzi e regime di fornitura: <External url="https://www.aifa.gov.it/liste-dei-farmaci">Open Data dell&apos;AIFA</External>, licenza CC BY 4.0.
            Le date dei dati sono indicate nel Mercato, sotto il catalogo e in ogni scheda.
          </Item>
          <Item>
            Foglietti illustrativi e Riassunti delle Caratteristiche del Prodotto (RCP):{" "}
            <External url="https://medicinali.aifa.gov.it/">Banca Dati Farmaci dell&apos;AIFA</External>
          </Item>
          <Item>
            Schede dei {INGREDIENTS.length} principi attivi: riassunte dagli RCP ufficiali; formule e masse molari da{" "}
            <External url="https://pubchem.ncbi.nlm.nih.gov/">PubChem</External> e classi chimiche da <External url="https://www.ebi.ac.uk/chebi/">ChEBI</External>,
            verificate il {formatItalianDate(INGREDIENTS_CHECKED_ON)}.
          </Item>
          <Item>
            Marchi negli altri Paesi europei (con il servizio di Orienta):{" "}
            <External url={EMA_ARTICLE57_PAGE}>elenco dei medicinali autorizzati nell&apos;UE e nel SEE dell&apos;EMA</External>, con la data di aggiornamento nella
            scheda. © European Medicines Agency, riprodotto citando la fonte.
          </Item>
          <Item>Foto delle confezioni, con licenza libera:</Item>
        </Items>
        <Items nested>
          {PICTURES.map((p) => (
            <Item key={p.file}>
              {p.shows} ({p.country}): <External url={p.source}>{`${p.author}, ${p.license}`}</External>
            </Item>
          ))}
        </Items>
      </InfoSection>

      <InfoSection id="mappe" title="Medici e mappa">
        <Items>
          <Item>
            Medici e strutture: dati © <External url="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</External>, licenza ODbL, tramite i servizi{" "}
            <External url="https://overpass-api.de/">Overpass API</External> e{" "}
            <External url="https://operations.osmfoundation.org/policies/nominatim/">Nominatim</External>, interrogati dal server di Orienta.
          </Item>
          <Item>Se attiva, la ricerca usa anche Google Places API, con l&apos;attribuzione «Google Maps».</Item>
          <Item>La mappa dei risultati è uno schema disegnato nell&apos;app, con le distanze e le direzioni vere, senza immagini di mappe.</Item>
        </Items>
      </InfoSection>

      <InfoSection id="grafica" title="Grafica e caratteri">
        <Items>
          <Item>Illustrazioni e scene del vetrino sono originali, create per Orienta; non mostrano persone, confezioni reali o marchi.</Item>
          <Item>
            Carattere: <External url="https://fonts.google.com/specimen/Atkinson+Hyperlegible">Atkinson Hyperlegible</External> del Braille Institute; per
            l&apos;attribuzione di Google Maps <External url="https://fonts.google.com/specimen/Roboto">Roboto</External>. Entrambi con licenza{" "}
            <External url="https://openfontlicense.org/">SIL Open Font License</External>.
          </Item>
          <Item>
            Icone: <External url="https://lucide.dev/license">Lucide</External>, licenza ISC.
          </Item>
        </Items>
      </InfoSection>
    </InfoPage>
  );
}
