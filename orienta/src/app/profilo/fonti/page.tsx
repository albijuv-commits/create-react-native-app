import type { Metadata } from "next";
import { CURE_NON_URGENTI, EMERGENCY_NUMBER, TELEFONO_AMICO, TELEFONO_AZZURRO } from "@data/emergency/helplines";
import { CONDITIONS } from "@data/conditions";
import euBrands from "@data/medicines/eu-brands.json";
import photos from "@data/medicines/photos.json";
import { BOOKING_SOURCE } from "@/components/doctors/booking-info";
import { External, InfoPage, InfoSection } from "@/components/profile/info-page";
import { formatItalianDate, SOURCES_CHECKED_AT } from "@/lib/conditions/catalog";
import type { Source } from "@/lib/conditions/schema";
import { EMA_ARTICLE57_PAGE } from "@/lib/medicines/eu-brands";
import { INGREDIENTS, INGREDIENTS_CHECKED_ON } from "@/lib/medicines/ingredients";
import { photosFileSchema } from "@/lib/medicines/photos";
import { catalogInfo } from "@/lib/medicines/queries";

export const metadata: Metadata = { title: "Fonti", description: "Da dove vengono schede, dati sui farmaci, numeri utili e mappe." };

const UPDATED = "7 ottobre 2026";
const SECTIONS = [
  { id: "condizioni", title: "Schede delle condizioni" },
  { id: "numeri", title: "Numeri utili e prenotazioni" },
  { id: "farmaci", title: "Farmaci" },
  { id: "mappe", title: "Medici e mappe" },
  { id: "grafica", title: "Grafica e caratteri" },
] as const;

const PUBLISHER_HOME: Record<Source["publisher"], string> = {
  ISSalute: "https://www.issalute.it/",
  "Ministero della Salute": "https://www.salute.gov.it/",
  NHS: "https://www.nhs.uk/",
  MedlinePlus: "https://medlineplus.gov/",
  EpiCentro: "https://www.epicentro.iss.it/",
};

const day = (iso: string | null | undefined) => (iso ? formatItalianDate(iso) : null);

export default function FontiPage() {
  const cited = new Map<Source["publisher"], Set<string>>();
  for (const c of CONDITIONS) for (const s of c.sources) (cited.get(s.publisher) ?? cited.set(s.publisher, new Set()).get(s.publisher)!).add(s.url);
  const publishers = [...cited.entries()].sort((a, b) => b[1].size - a[1].size);
  const catalog = catalogInfo();
  const pictures = photosFileSchema.parse(photos);
  const helplines = [EMERGENCY_NUMBER, CURE_NON_URGENTI, TELEFONO_AMICO, TELEFONO_AZZURRO];

  return (
    <InfoPage
      title="Fonti"
      lead="Orienta non inventa contenuti: ogni informazione viene da una fonte pubblica, citata qui e accanto a ciò che mostra."
      updated={UPDATED}
      sections={[...SECTIONS]}
    >
      <InfoSection id="condizioni" title="Schede delle condizioni">
        <p>
          Le {CONDITIONS.length} schede sono scritte a partire da queste fonti sanitarie pubbliche. Ogni scheda elenca in fondo le pagine usate; i link sono
          stati verificati il {day(SOURCES_CHECKED_AT)}.
        </p>
        <ul>
          {publishers.map(([publisher, urls]) => (
            <li key={publisher}>
              <External href={PUBLISHER_HOME[publisher]}>{publisher}</External>: {urls.size === 1 ? "1 pagina" : `${urls.size} pagine`}
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection id="numeri" title="Numeri utili e prenotazioni">
        <ul>
          {helplines.map((h) => (
            <li key={h.number}>
              {h.name} ({h.number}): <External href={h.source}>fonte</External>, verificata il {day(h.verifiedAt)}
            </li>
          ))}
          <li>
            Come prenotare una visita con il Servizio sanitario: <External href={BOOKING_SOURCE}>Ministero della Salute, ricetta elettronica e CUP</External>
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="farmaci" title="Farmaci">
        <ul>
          <li>
            Catalogo, prezzi e regime di fornitura: <External href="https://www.aifa.gov.it/liste-dei-farmaci">Open Data dell&apos;AIFA</External>, licenza CC BY
            4.0.
            {catalog.source === "esempio"
              ? " In questa installazione si vede il campione di esempio."
              : ` Anagrafica al ${day(catalog.registryDate)}, liste di Classe A al ${day(catalog.classADate)}, lista di trasparenza al ${day(catalog.transparencyDate)}.`}
          </li>
          <li>
            Foglietti illustrativi e Riassunti delle Caratteristiche del Prodotto (RCP): <External href="https://medicinali.aifa.gov.it/">Banca Dati Farmaci dell&apos;AIFA</External>
          </li>
          <li>
            Schede dei {INGREDIENTS.length} principi attivi: riassunte dagli RCP ufficiali; formule e masse molari da{" "}
            <External href="https://pubchem.ncbi.nlm.nih.gov/">PubChem</External> e classi chimiche da <External href="https://www.ebi.ac.uk/chebi/">ChEBI</External>,
            verificate il {day(INGREDIENTS_CHECKED_ON)}.
          </li>
          <li>
            Marchi negli altri Paesi europei: <External href={EMA_ARTICLE57_PAGE}>elenco dei medicinali autorizzati nell&apos;UE e nel SEE dell&apos;EMA</External>
            {euBrands.updated && <>, aggiornato al {day(euBrands.updated)}</>}. © European Medicines Agency, riprodotto citando la fonte.
          </li>
          <li>
            Foto delle confezioni, con licenza libera:
            <ul className="mt-1">
              {pictures.map((p) => (
                <li key={p.file}>
                  {p.shows} ({p.country}): <External href={p.source}>{`${p.author}, ${p.license}`}</External>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="mappe" title="Medici e mappe">
        <ul>
          <li>
            Medici, strutture e mappa: dati © <External href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</External>, licenza ODbL, tramite
            i servizi <External href="https://overpass-api.de/">Overpass API</External> e{" "}
            <External href="https://operations.osmfoundation.org/policies/nominatim/">Nominatim</External>.
          </li>
          <li>Se attiva, la ricerca usa anche Google Places API, con l&apos;attribuzione «Google Maps».</li>
          <li>
            Mappa interattiva: <External href="https://leafletjs.com/">Leaflet</External>.
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="grafica" title="Grafica e caratteri">
        <ul>
          <li>Illustrazioni, scene del vetrino e modelli 3D sono originali, creati per Orienta; non mostrano persone, confezioni reali o marchi.</li>
          <li>
            Carattere: <External href="https://fonts.google.com/specimen/Atkinson+Hyperlegible">Atkinson Hyperlegible</External> del Braille Institute, licenza{" "}
            <External href="https://openfontlicense.org/">SIL Open Font License</External>.
          </li>
          <li>
            Icone: <External href="https://lucide.dev/license">Lucide</External>, licenza ISC.
          </li>
        </ul>
      </InfoSection>
    </InfoPage>
  );
}
