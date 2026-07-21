import type { RoundOutcome } from "./types";

export const INITIAL_FAVOR = 10;
export const FAVOR_PER_WIN = 10;

export const FAVOR_EFFECT_COSTS = {
  revealDefenderCategory: 20,
  revealDeckUnitCategory: 10,
} as const;

export type FavorEffectId = keyof typeof FAVOR_EFFECT_COSTS;

export function canPurchaseFavorEffect(
  favor: number,
  effect: FavorEffectId,
): boolean {
  return favor >= FAVOR_EFFECT_COSTS[effect];
}

export function purchaseFavorEffect(
  favor: number,
  effect: FavorEffectId,
): number | null {
  if (!canPurchaseFavorEffect(favor, effect)) return null;
  return favor - FAVOR_EFFECT_COSTS[effect];
}

export function rewardFavor(
  favor: number,
  outcome: RoundOutcome,
): number {
  return outcome === "win" ? favor + FAVOR_PER_WIN : favor;
}
