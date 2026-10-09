// File generato da scripts/gen-illustrations.mjs: non modificarlo a mano.
import type { BodyAreaId } from "@data/vocab/body";
import type { SpecialtyId } from "@data/vocab/specialties";
import c_acne from "@/assets/illustrations/condizione-acne.webp";
import c_allergia_acari from "@/assets/illustrations/condizione-allergia-acari.webp";
import c_anemia from "@/assets/illustrations/condizione-anemia.webp";
import c_ansia from "@/assets/illustrations/condizione-ansia.webp";
import c_apnee_notturne from "@/assets/illustrations/condizione-apnee-notturne.webp";
import c_asma from "@/assets/illustrations/condizione-asma.webp";
import c_bronchite from "@/assets/illustrations/condizione-bronchite.webp";
import c_bruxismo from "@/assets/illustrations/condizione-bruxismo.webp";
import c_cefalea_tensiva from "@/assets/illustrations/condizione-cefalea-tensiva.webp";
import c_cistite from "@/assets/illustrations/condizione-cistite.webp";
import c_colon_irritabile from "@/assets/illustrations/condizione-colon-irritabile.webp";
import c_colpo_di_calore from "@/assets/illustrations/condizione-colpo-di-calore.webp";
import c_congiuntivite from "@/assets/illustrations/condizione-congiuntivite.webp";
import c_covid_19 from "@/assets/illustrations/condizione-covid-19.webp";
import c_depressione from "@/assets/illustrations/condizione-depressione.webp";
import c_dermatite_atopica from "@/assets/illustrations/condizione-dermatite-atopica.webp";
import c_dermatite_contatto from "@/assets/illustrations/condizione-dermatite-contatto.webp";
import c_diabete_tipo_2 from "@/assets/illustrations/condizione-diabete-tipo-2.webp";
import c_disidratazione from "@/assets/illustrations/condizione-disidratazione.webp";
import c_distorsione from "@/assets/illustrations/condizione-distorsione.webp";
import c_emicrania from "@/assets/illustrations/condizione-emicrania.webp";
import c_faringite_tonsillite from "@/assets/illustrations/condizione-faringite-tonsillite.webp";
import c_gastroenterite from "@/assets/illustrations/condizione-gastroenterite.webp";
import c_herpes_labiale from "@/assets/illustrations/condizione-herpes-labiale.webp";
import c_influenza from "@/assets/illustrations/condizione-influenza.webp";
import c_insonnia from "@/assets/illustrations/condizione-insonnia.webp";
import c_intossicazione_monossido from "@/assets/illustrations/condizione-intossicazione-monossido.webp";
import c_ipertensione from "@/assets/illustrations/condizione-ipertensione.webp";
import c_ipotiroidismo from "@/assets/illustrations/condizione-ipotiroidismo.webp";
import c_mal_di_schiena from "@/assets/illustrations/condizione-mal-di-schiena.webp";
import c_mononucleosi from "@/assets/illustrations/condizione-mononucleosi.webp";
import c_orticaria from "@/assets/illustrations/condizione-orticaria.webp";
import c_otite from "@/assets/illustrations/condizione-otite.webp";
import c_psoriasi from "@/assets/illustrations/condizione-psoriasi.webp";
import c_raffreddore from "@/assets/illustrations/condizione-raffreddore.webp";
import c_reflusso from "@/assets/illustrations/condizione-reflusso.webp";
import c_rinite_allergica from "@/assets/illustrations/condizione-rinite-allergica.webp";
import c_sinusite from "@/assets/illustrations/condizione-sinusite.webp";
import c_tendinite from "@/assets/illustrations/condizione-tendinite.webp";
import c_varicella from "@/assets/illustrations/condizione-varicella.webp";
import s_allergologo from "@/assets/illustrations/specialista-allergologo.webp";
import s_cardiologo from "@/assets/illustrations/specialista-cardiologo.webp";
import s_dentista from "@/assets/illustrations/specialista-dentista.webp";
import s_dermatologo from "@/assets/illustrations/specialista-dermatologo.webp";
import s_diabetologo from "@/assets/illustrations/specialista-diabetologo.webp";
import s_ematologo from "@/assets/illustrations/specialista-ematologo.webp";
import s_endocrinologo from "@/assets/illustrations/specialista-endocrinologo.webp";
import s_fisiatra from "@/assets/illustrations/specialista-fisiatra.webp";
import s_gastroenterologo from "@/assets/illustrations/specialista-gastroenterologo.webp";
import s_ginecologo from "@/assets/illustrations/specialista-ginecologo.webp";
import s_infettivologo from "@/assets/illustrations/specialista-infettivologo.webp";
import s_medicina_del_sonno from "@/assets/illustrations/specialista-medicina-del-sonno.webp";
import s_medico_di_base from "@/assets/illustrations/specialista-medico-di-base.webp";
import s_neurologo from "@/assets/illustrations/specialista-neurologo.webp";
import s_oculista from "@/assets/illustrations/specialista-oculista.webp";
import s_ortopedico from "@/assets/illustrations/specialista-ortopedico.webp";
import s_otorinolaringoiatra from "@/assets/illustrations/specialista-otorinolaringoiatra.webp";
import s_pediatra from "@/assets/illustrations/specialista-pediatra.webp";
import s_pneumologo from "@/assets/illustrations/specialista-pneumologo.webp";
import s_pronto_soccorso from "@/assets/illustrations/specialista-pronto-soccorso.webp";
import s_psichiatra from "@/assets/illustrations/specialista-psichiatra.webp";
import s_psicologo from "@/assets/illustrations/specialista-psicologo.webp";
import s_urologo from "@/assets/illustrations/specialista-urologo.webp";
import a_corpo from "@/assets/illustrations/area-corpo.webp";
import a_digestione from "@/assets/illustrations/area-digestione.webp";
import a_mente from "@/assets/illustrations/area-mente.webp";
import a_muscoli from "@/assets/illustrations/area-muscoli.webp";
import a_orl from "@/assets/illustrations/area-orl.webp";
import a_pelle from "@/assets/illustrations/area-pelle.webp";
import a_respiro from "@/assets/illustrations/area-respiro.webp";
import a_testa from "@/assets/illustrations/area-testa.webp";
import a_urinario from "@/assets/illustrations/area-urinario.webp";

/** L'illustrazione di ogni condizione */
export const CONDITION_ILLUSTRATIONS: Readonly<Record<string, number>> = {
  "acne": c_acne,
  "allergia-acari": c_allergia_acari,
  "anemia": c_anemia,
  "ansia": c_ansia,
  "apnee-notturne": c_apnee_notturne,
  "asma": c_asma,
  "bronchite": c_bronchite,
  "bruxismo": c_bruxismo,
  "cefalea-tensiva": c_cefalea_tensiva,
  "cistite": c_cistite,
  "colon-irritabile": c_colon_irritabile,
  "colpo-di-calore": c_colpo_di_calore,
  "congiuntivite": c_congiuntivite,
  "covid-19": c_covid_19,
  "depressione": c_depressione,
  "dermatite-atopica": c_dermatite_atopica,
  "dermatite-contatto": c_dermatite_contatto,
  "diabete-tipo-2": c_diabete_tipo_2,
  "disidratazione": c_disidratazione,
  "distorsione": c_distorsione,
  "emicrania": c_emicrania,
  "faringite-tonsillite": c_faringite_tonsillite,
  "gastroenterite": c_gastroenterite,
  "herpes-labiale": c_herpes_labiale,
  "influenza": c_influenza,
  "insonnia": c_insonnia,
  "intossicazione-monossido": c_intossicazione_monossido,
  "ipertensione": c_ipertensione,
  "ipotiroidismo": c_ipotiroidismo,
  "mal-di-schiena": c_mal_di_schiena,
  "mononucleosi": c_mononucleosi,
  "orticaria": c_orticaria,
  "otite": c_otite,
  "psoriasi": c_psoriasi,
  "raffreddore": c_raffreddore,
  "reflusso": c_reflusso,
  "rinite-allergica": c_rinite_allergica,
  "sinusite": c_sinusite,
  "tendinite": c_tendinite,
  "varicella": c_varicella,
};

/** L'illustrazione di ogni professionista di riferimento */
export const SPECIALIST_ILLUSTRATIONS: Readonly<Partial<Record<SpecialtyId, number>>> = {
  "allergologo": s_allergologo,
  "cardiologo": s_cardiologo,
  "dentista": s_dentista,
  "dermatologo": s_dermatologo,
  "diabetologo": s_diabetologo,
  "ematologo": s_ematologo,
  "endocrinologo": s_endocrinologo,
  "fisiatra": s_fisiatra,
  "gastroenterologo": s_gastroenterologo,
  "ginecologo": s_ginecologo,
  "infettivologo": s_infettivologo,
  "medicina-del-sonno": s_medicina_del_sonno,
  "medico-di-base": s_medico_di_base,
  "neurologo": s_neurologo,
  "oculista": s_oculista,
  "ortopedico": s_ortopedico,
  "otorinolaringoiatra": s_otorinolaringoiatra,
  "pediatra": s_pediatra,
  "pneumologo": s_pneumologo,
  "pronto-soccorso": s_pronto_soccorso,
  "psichiatra": s_psichiatra,
  "psicologo": s_psicologo,
  "urologo": s_urologo,
};

/** L'illustrazione di ogni area del corpo, per i riquadri del filtro */
export const AREA_ILLUSTRATIONS: Readonly<Record<BodyAreaId, number>> = {
  "corpo": a_corpo,
  "digestione": a_digestione,
  "mente": a_mente,
  "muscoli": a_muscoli,
  "orl": a_orl,
  "pelle": a_pelle,
  "respiro": a_respiro,
  "testa": a_testa,
  "urinario": a_urinario,
};
