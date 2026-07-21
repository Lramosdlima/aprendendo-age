import type { PrecomputedBattleResult } from "@/lib/battleSimulator/precompute";
import type { RoundOutcome } from "./types";

export type BattleResultIndex = Map<string, PrecomputedBattleResult>;

export function battlePairKey(attackerId: number, defenderId: number): string {
  return `${attackerId}|${defenderId}`;
}

export function buildBattleResultIndex(
  results: readonly PrecomputedBattleResult[],
): BattleResultIndex {
  const map: BattleResultIndex = new Map();
  for (const result of results) {
    map.set(battlePairKey(result.attacker_id, result.defender_id), result);
  }
  return map;
}

export function lookupBattleResult(
  index: BattleResultIndex,
  attackerId: number,
  defenderId: number,
): PrecomputedBattleResult | null {
  return index.get(battlePairKey(attackerId, defenderId)) ?? null;
}

export function mapPlayerOutcome(
  winner: PrecomputedBattleResult["winner"],
): RoundOutcome {
  if (winner === "attacker") return "win";
  if (winner === "defender") return "loss";
  return "draw";
}
