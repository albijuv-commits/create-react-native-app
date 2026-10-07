import "server-only";
import type { SpecialtyId } from "@data/vocab/specialties";

/**
 * Come si cerca ogni professionista nei due servizi reali.
 * - Google Places: una ricerca testuale in italiano vicino alla posizione.
 * - OpenStreetMap: i valori di `healthcare:speciality` documentati nel wiki
 *   (https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality), le radici da cercare nel nome
 *   delle strutture sanitarie e, dove serve, selettori Overpass già pronti.
 * Sono tutte costanti: nessun testo scritto dalla persona finisce nelle query.
 */
export interface OsmSearch {
  specialities: readonly string[];
  names: readonly string[];
  selectors: readonly string[];
}

export interface SpecialtySearch {
  google: string;
  osm: OsmSearch;
}

const osm = (specialities: string[], names: string[], selectors: string[] = []): OsmSearch => ({ specialities, names, selectors });

export const SPECIALTY_SEARCH: Record<SpecialtyId, SpecialtySearch> = {
  // Molti studi di medicina generale su OpenStreetMap non indicano la specialità
  "medico-di-base": {
    google: "medico di base",
    osm: osm(["general"], ["medic[oi] di (base|famiglia)", "medicina generale"], ['["amenity"="doctors"][!"healthcare:speciality"]']),
  },
  pediatra: { google: "pediatra", osm: osm(["paediatrics"], ["pediatr"]) },
  otorinolaringoiatra: { google: "otorinolaringoiatra", osm: osm(["otolaryngology"], ["otorino"]) },
  allergologo: { google: "allergologo", osm: osm(["allergology"], ["allergolog"]) },
  oculista: { google: "oculista", osm: osm(["ophthalmology"], ["oculist", "oftalmolog"]) },
  neurologo: { google: "neurologo", osm: osm(["neurology"], ["neurolog"]) },
  gastroenterologo: { google: "gastroenterologo", osm: osm(["gastroenterology"], ["gastroenterolog"]) },
  urologo: { google: "urologo", osm: osm(["urology"], ["urolog"]) },
  // I consultori familiari offrono visite ginecologiche
  ginecologo: { google: "ginecologo", osm: osm(["gynaecology"], ["ginecolog", "consultorio"]) },
  dermatologo: { google: "dermatologo", osm: osm(["dermatology", "dermatovenereology", "venereology"], ["dermatolog"]) },
  pneumologo: { google: "pneumologo", osm: osm(["pulmonology"], ["pneumolog"]) },
  ortopedico: { google: "ortopedico", osm: osm(["orthopaedics"], ["ortoped"]) },
  fisiatra: { google: "fisiatra", osm: osm(["physiatry"], ["fisiatr"]) },
  "medicina-del-sonno": { google: "centro medicina del sonno", osm: osm([], ["medicina del sonno", "disturbi del sonno", "polisonnograf"]) },
  dentista: { google: "dentista", osm: osm([], ["dentist", "odontoiatr"], ['["amenity"="dentist"]', '["healthcare"="dentist"]']) },
  psicologo: { google: "psicologo psicoterapeuta", osm: osm([], ["psicolog", "psicoterap"], ['["healthcare"="psychotherapist"]']) },
  // I Centri di salute mentale sono il servizio pubblico di riferimento
  psichiatra: { google: "psichiatra", osm: osm(["psychiatry"], ["psichiatr", "salute mentale"]) },
  ematologo: { google: "ematologo", osm: osm(["haematology"], ["ematolog"]) },
  endocrinologo: { google: "endocrinologo", osm: osm(["endocrinology"], ["endocrinolog"]) },
  cardiologo: { google: "cardiologo", osm: osm(["cardiology"], ["cardiolog"]) },
  diabetologo: { google: "diabetologo", osm: osm(["diabetology"], ["diabetolog", "centro diabet"]) },
  infettivologo: { google: "infettivologo", osm: osm(["infectious_diseases"], ["infettiv"]) },
  "pronto-soccorso": {
    google: "pronto soccorso",
    osm: osm([], [], ['["amenity"="hospital"]["emergency"="yes"]', '["healthcare"="hospital"]["emergency"="yes"]']),
  },
};
