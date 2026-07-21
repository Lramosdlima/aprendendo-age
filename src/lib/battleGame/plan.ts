import type { PlayableEraId, RoundPlan } from "./types";

/** Clássica / Heróica / Mítica — ordem do cronograma padrão. */
export const PLAYABLE_ERA_IDS: readonly PlayableEraId[] = [2, 3, 4];

/** Padrão: 4 clássica + 4 heróica + 2 mítica. */
export const DEFAULT_ERA_ROUND_COUNTS: readonly [number, number, number] = [4, 4, 2];

export function buildRoundPlan(
  counts: readonly [number, number, number] = DEFAULT_ERA_ROUND_COUNTS,
): RoundPlan[] {
  const plan: RoundPlan[] = [];
  let index = 0;
  for (let i = 0; i < PLAYABLE_ERA_IDS.length; i++) {
    const eraId = PLAYABLE_ERA_IDS[i]!;
    const n = counts[i] ?? 0;
    for (let j = 0; j < n; j++) {
      plan.push({ index, eraId });
      index += 1;
    }
  }
  return plan;
}

/** True se a próxima rodada muda de Era em relação à atual. */
export function willAgeUp(plan: readonly RoundPlan[], currentRoundIndex: number): boolean {
  const current = plan[currentRoundIndex];
  const next = plan[currentRoundIndex + 1];
  if (!current || !next) return false;
  return next.eraId !== current.eraId;
}
