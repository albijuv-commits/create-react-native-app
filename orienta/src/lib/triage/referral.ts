import type { SpecialtyId } from "@data/vocab/specialties";

/**
 * Il riferimento giusto per l'età. Sotto i 14 anni quello che per un adulto è il medico di base
 * diventa il pediatra; dai 14 anni in su, al contrario, una condizione affidata al pediatra (per
 * esempio la varicella) porta al medico di base.
 */
export function specialistForAge(id: SpecialtyId, age: number): SpecialtyId {
  if (age < 14 && id === "medico-di-base") return "pediatra";
  if (age >= 14 && id === "pediatra") return "medico-di-base";
  return id;
}
