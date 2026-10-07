/**
 * Professionisti di riferimento. Nella fase 4 ogni voce riceverà i termini di ricerca
 * per Google Places e i tag OpenStreetMap.
 */
export const SPECIALTIES = [
  { id: "medico-di-base", label: "Medico di base", description: "Il primo riferimento per quasi tutti i disturbi: ti visita, prescrive esami e, se serve, ti indirizza a uno specialista." },
  { id: "pediatra", label: "Pediatra", description: "Il medico dei bambini e dei ragazzi fino ai 14 anni (in alcuni casi fino ai 16)." },
  { id: "otorinolaringoiatra", label: "Otorinolaringoiatra", description: "Si occupa di orecchie, naso, seni nasali e gola." },
  { id: "allergologo", label: "Allergologo", description: "Individua le allergie con test specifici e imposta la terapia, compresa l'immunoterapia." },
  { id: "oculista", label: "Oculista", description: "Si occupa della salute degli occhi e della vista." },
  { id: "neurologo", label: "Neurologo", description: "Si occupa del sistema nervoso, comprese le cefalee e l'emicrania." },
  { id: "gastroenterologo", label: "Gastroenterologo", description: "Si occupa di stomaco, intestino e apparato digerente." },
  { id: "urologo", label: "Urologo", description: "Si occupa di reni, vescica e vie urinarie." },
  { id: "ginecologo", label: "Ginecologo", description: "Si occupa della salute dell'apparato riproduttivo femminile." },
  { id: "dermatologo", label: "Dermatologo", description: "Si occupa di pelle, capelli e unghie." },
  { id: "pneumologo", label: "Pneumologo", description: "Si occupa di polmoni e vie respiratorie." },
  { id: "ortopedico", label: "Ortopedico", description: "Si occupa di ossa, articolazioni, legamenti e tendini." },
  { id: "fisiatra", label: "Fisiatra", description: "Medico della riabilitazione: valuta il dolore muscolare e articolare e imposta esercizi e fisioterapia." },
  { id: "medicina-del-sonno", label: "Specialista in medicina del sonno", description: "Valuta i disturbi del sonno, spesso in un centro dedicato, anche con esami notturni." },
  { id: "dentista", label: "Dentista", description: "Si occupa di denti, gengive e articolazione della mandibola." },
  { id: "psicologo", label: "Psicologo o psicoterapeuta", description: "Offre colloqui e percorsi di psicoterapia, ad esempio la terapia cognitivo-comportamentale." },
  { id: "psichiatra", label: "Psichiatra", description: "Medico specialista della salute mentale: fa diagnosi e può prescrivere farmaci." },
  { id: "ematologo", label: "Ematologo", description: "Si occupa delle malattie del sangue." },
  { id: "endocrinologo", label: "Endocrinologo", description: "Si occupa di ormoni e ghiandole, come la tiroide." },
  { id: "cardiologo", label: "Cardiologo", description: "Si occupa di cuore e circolazione, compresa la pressione alta." },
  { id: "diabetologo", label: "Diabetologo", description: "Segue le persone con diabete, spesso in un centro diabetologico." },
  { id: "infettivologo", label: "Infettivologo", description: "Si occupa delle malattie infettive." },
  { id: "pronto-soccorso", label: "Pronto soccorso", description: "Per le emergenze. Se la situazione è grave chiama il 112." },
] as const;

export type SpecialtyId = (typeof SPECIALTIES)[number]["id"];
export const SPECIALTY_IDS = SPECIALTIES.map((s) => s.id) as [SpecialtyId, ...SpecialtyId[]];

export function getSpecialty(id: SpecialtyId) {
  const s = SPECIALTIES.find((x) => x.id === id);
  if (!s) throw new Error(`Specialità sconosciuta: ${id}`);
  return s;
}
