/**
 * Numeri di emergenza e di ascolto. Numeri e orari sono stati verificati sui siti ufficiali
 * alla data indicata in `verifiedAt`: ricontrollarli prima di ogni rilascio.
 */
export interface Helpline {
  name: string;
  /** Come si legge e si scrive il numero */
  number: string;
  /** Valore per il link tel: */
  tel: string;
  /** Orari e costo, come indicati dalla fonte */
  hours: string;
  /** A chi si rivolge */
  audience: string;
  source: string;
  verifiedAt: string;
}

export const EMERGENCY_NUMBER: Helpline = {
  name: "Numero unico di emergenza",
  number: "112",
  tel: "112",
  hours: "gratuito, sempre attivo, anche senza credito",
  audience: "per qualsiasi emergenza sanitaria, di sicurezza o incendio",
  source: "https://www.salute.gov.it/new/it/tema/112-118-e-pronto-soccorso/",
  verifiedAt: "2026-10-07",
};

export const TELEFONO_AMICO: Helpline = {
  name: "Telefono Amico Italia",
  number: "02 2327 2327",
  tel: "+390223272327",
  hours: "tutti i giorni, 24 ore su 24",
  audience: "per chiunque viva un momento difficile e abbia bisogno di parlare",
  source: "https://www.telefonoamico.it/cosa-facciamo/come-contattarci/",
  verifiedAt: "2026-10-07",
};

export const TELEFONO_AZZURRO: Helpline = {
  name: "Telefono Azzurro",
  number: "19696",
  tel: "19696",
  hours: "gratuito, 24 ore su 24, 7 giorni su 7",
  audience: "per bambini e ragazzi fino a 18 anni, e per gli adulti che si preoccupano per loro",
  source: "https://azzurro.it/",
  verifiedAt: "2026-10-07",
};

export const CURE_NON_URGENTI: Helpline = {
  name: "Numero europeo per le cure non urgenti",
  number: "116117",
  tel: "116117",
  hours: "gratuito, 24 ore su 24, nelle regioni dove è attivo",
  audience: "per consigli e cure mediche non urgenti, anche quando il medico di base non è disponibile; collega alla guardia medica",
  source: "https://www.salute.gov.it/new/it/tema/nuova-assistenza-distrettuale/numero-europeo-cure-non-urgenti-116117/",
  verifiedAt: "2026-10-07",
};
