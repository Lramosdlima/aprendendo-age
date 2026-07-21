import type { Unidade } from "@/data/catalog";
import type { PrecomputedBattleResult } from "@/lib/battleSimulator/precompute";
import { filterDefenderPool } from "./filters";
import { lookupBattleResult, mapPlayerOutcome, type BattleResultIndex } from "./lookup";
import type { PlayableEraId, RoundOutcome, RoundRecord, RunSummary } from "./types";

/** RNG determinístico (mulberry32) para testes. */
export function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickRandomUnit(
  pool: readonly Unidade[],
  rng: () => number = Math.random,
): Unidade | null {
  if (pool.length === 0) return null;
  const idx = Math.floor(rng() * pool.length);
  return pool[idx] ?? null;
}

export function pickDefender(
  units: readonly Unidade[],
  currentEraId: PlayableEraId,
  usedDefenderIds: readonly number[],
  rng: () => number = Math.random,
): Unidade | null {
  return pickRandomUnit(filterDefenderPool(units, currentEraId, usedDefenderIds), rng);
}

export function resolvePlayerChoice(
  index: BattleResultIndex,
  attackerId: number,
  defenderId: number,
): { outcome: RoundOutcome; result: PrecomputedBattleResult } | null {
  if (attackerId === defenderId) {
    return {
      outcome: "draw",
      result: {
        attacker: String(attackerId),
        defender: String(defenderId),
        winner: "draw",
        winner_name: null,
        mode: "attributes_fallback",
        attacker_id: attackerId,
        defender_id: defenderId,
      },
    };
  }
  const result = lookupBattleResult(index, attackerId, defenderId);
  if (!result) return null;
  return { outcome: mapPlayerOutcome(result.winner), result };
}

export function emptyEraStats(): RunSummary["byEra"] {
  return {
    2: { rounds: 0, wins: 0, losses: 0, draws: 0 },
    3: { rounds: 0, wins: 0, losses: 0, draws: 0 },
    4: { rounds: 0, wins: 0, losses: 0, draws: 0 },
  };
}

export function summarizeRun(history: readonly RoundRecord[]): RunSummary {
  const byEra = emptyEraStats();
  let wins = 0;
  let losses = 0;
  let draws = 0;

  for (const row of history) {
    const bucket = byEra[row.eraId];
    bucket.rounds += 1;
    if (row.outcome === "win") {
      wins += 1;
      bucket.wins += 1;
    } else if (row.outcome === "loss") {
      losses += 1;
      bucket.losses += 1;
    } else {
      draws += 1;
      bucket.draws += 1;
    }
  }

  return {
    totalRounds: history.length,
    wins,
    losses,
    draws,
    byEra,
    history: [...history],
  };
}
