import type { ConditionInput } from "./schema";

/**
 * Aiuto per scrivere una scheda con il controllo dei tipi.
 * La validazione completa (Zod) avviene in `data/conditions/index.ts` e nei test.
 */
export function defineCondition(condition: ConditionInput): ConditionInput {
  return condition;
}
