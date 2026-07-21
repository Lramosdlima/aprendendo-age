import type { Unidade } from "@/data/catalog";
import { firstNumId } from "@/lib/entityRefs";
import {
  getDefenderTypeIds,
  resolveBattleTypeId,
} from "@/lib/battleSimulator/classification";
import { pickRandomUnit } from "./run";
import type { PlayableEraId } from "./types";

/**
 * Unidades humanas (não-herói) disponíveis na Era atual (filtro cumulativo):
 * Clássica → era 2; Heróica → 2–3; Mítica → 2–4.
 * Arcaica (1) e Maravilha (5) ficam de fora.
 */
export function isUnitEligibleForCurrentEra(
  unit: Unidade,
  currentEraId: PlayableEraId,
): boolean {
  const eraId = firstNumId(unit.era);
  if (eraId == null) return false;
  return eraId >= 2 && eraId <= currentEraId;
}

/** Heróis podem vir da Arcaica (1) até a Era atual. */
export function isHeroEligibleForCurrentEra(
  unit: Unidade,
  currentEraId: PlayableEraId,
): boolean {
  const eraId = firstNumId(unit.era);
  if (eraId == null) return false;
  return eraId >= 1 && eraId <= currentEraId;
}

export function isMythUnit(unit: Unidade): boolean {
  return getDefenderTypeIds(unit).has("unidade_mitica");
}

export function isHeroUnit(unit: Unidade): boolean {
  for (const item of unit.tipo ?? []) {
    const id = resolveBattleTypeId(item.type, item.icon);
    if (id === "heroi") return true;
  }
  return false;
}

/** Soldados/humanos do panteão (sem míticas e sem heróis). */
export function filterAttackerSoldiers(
  units: readonly Unidade[],
  pantheonId: number,
  currentEraId: PlayableEraId,
): Unidade[] {
  return units.filter(
    (u) =>
      firstNumId(u.panteao) === pantheonId &&
      !isMythUnit(u) &&
      !isHeroUnit(u) &&
      isUnitEligibleForCurrentEra(u, currentEraId),
  );
}

/** Heróis elegíveis do panteão (era 1…atual), sem míticas. */
export function listEligibleHeroes(
  units: readonly Unidade[],
  pantheonId: number,
  currentEraId: PlayableEraId,
): Unidade[] {
  return units.filter(
    (u) =>
      firstNumId(u.panteao) === pantheonId &&
      isHeroUnit(u) &&
      !isMythUnit(u) &&
      isHeroEligibleForCurrentEra(u, currentEraId),
  );
}

export function pickDeckHero(
  units: readonly Unidade[],
  pantheonId: number,
  currentEraId: PlayableEraId,
  rng: () => number = Math.random,
): Unidade | null {
  return pickRandomUnit(listEligibleHeroes(units, pantheonId, currentEraId), rng);
}

/**
 * Deck do atacante: soldados cumulativos da Era + exatamente 1 herói sorteado
 * (passado por `deckHeroId`). Unidades míticas nunca entram.
 */
export function filterAttackerPool(
  units: readonly Unidade[],
  pantheonId: number,
  currentEraId: PlayableEraId,
  deckHeroId?: number | null,
): Unidade[] {
  const soldiers = filterAttackerSoldiers(units, pantheonId, currentEraId);
  if (deckHeroId == null) return soldiers;

  const hero = units.find(
    (u) =>
      u.id === deckHeroId &&
      firstNumId(u.panteao) === pantheonId &&
      isHeroUnit(u) &&
      !isMythUnit(u) &&
      isHeroEligibleForCurrentEra(u, currentEraId),
  );
  if (!hero) return soldiers;
  return [...soldiers, hero];
}

export function filterDefenderPool(
  units: readonly Unidade[],
  currentEraId: PlayableEraId,
  usedDefenderIds: readonly number[],
): Unidade[] {
  const used = new Set(usedDefenderIds);
  const fresh = units.filter(
    (u) => isUnitEligibleForCurrentEra(u, currentEraId) && !used.has(u.id),
  );
  if (fresh.length > 0) return fresh;
  // Se esgotou opções inéditas, permite repetir.
  return units.filter((u) => isUnitEligibleForCurrentEra(u, currentEraId));
}
