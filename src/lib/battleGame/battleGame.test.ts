import { describe, expect, it } from "vitest";
import type { Unidade } from "@/data/catalog";
import unidadesPt from "@/data/locale/pt/unidades_aom.json";
import battleResultsJson from "@/data/unidades_aom_battle_results.json";
import type { PrecomputedBattleResult } from "@/lib/battleSimulator/precompute";
import {
  buildBattleResultIndex,
  buildRoundPlan,
  createRng,
  filterAttackerPool,
  filterDefenderPool,
  isHeroUnit,
  isMythUnit,
  listEligibleHeroes,
  lookupBattleResult,
  pickDeckHero,
  pickDefender,
  resolvePlayerChoice,
  summarizeRun,
  willAgeUp,
  type RoundRecord,
} from "@/lib/battleGame";

const units = unidadesPt as Unidade[];
const battleResults = battleResultsJson as PrecomputedBattleResult[];

function byId(id: number): Unidade {
  const u = units.find((x) => x.id === id);
  if (!u) throw new Error(`missing ${id}`);
  return u;
}

describe("battleGame plan", () => {
  it("gera cronograma 4/4/2 começando na Clássica", () => {
    const plan = buildRoundPlan();
    expect(plan).toHaveLength(10);
    expect(plan.map((r) => r.eraId)).toEqual([2, 2, 2, 2, 3, 3, 3, 3, 4, 4]);
    expect(plan[0]!.index).toBe(0);
    expect(plan[9]!.index).toBe(9);
  });

  it("detecta avanço de Era nas rodadas 5 e 9 (índices 3→4 e 7→8)", () => {
    const plan = buildRoundPlan();
    expect(willAgeUp(plan, 3)).toBe(true);
    expect(willAgeUp(plan, 7)).toBe(true);
    expect(willAgeUp(plan, 0)).toBe(false);
    expect(willAgeUp(plan, 9)).toBe(false);
  });
});

describe("battleGame filters", () => {
  it("monta deck sem míticas e com no máximo 1 herói", () => {
    const hero = pickDeckHero(units, 1, 2, createRng(7));
    expect(hero).not.toBeNull();

    const classic = filterAttackerPool(units, 1, 2, hero?.id);
    expect(classic.length).toBeGreaterThan(0);
    expect(classic.every((u) => u.panteao?.[0]?.id === 1)).toBe(true);
    expect(classic.every((u) => !isMythUnit(u))).toBe(true);
    expect(classic.filter((u) => isHeroUnit(u))).toHaveLength(1);
    expect(classic.some((u) => u.id === hero!.id)).toBe(true);
  });

  it("permite heróis arcaicos no deck da Clássica", () => {
    const archaicHeroes = listEligibleHeroes(units, 1, 2).filter(
      (u) => u.era?.[0]?.id === 1,
    );
    expect(archaicHeroes.length).toBeGreaterThan(0);
  });

  it("mantém pools não vazios para todos os panteões nas 3 eras", () => {
    for (const pantheonId of [1, 2, 3, 4, 5, 6, 7]) {
      for (const eraId of [2, 3, 4] as const) {
        const hero = pickDeckHero(units, pantheonId, eraId, createRng(pantheonId * 10 + eraId));
        expect(filterAttackerPool(units, pantheonId, eraId, hero?.id).length).toBeGreaterThan(0);
        expect(filterDefenderPool(units, eraId, []).length).toBeGreaterThan(0);
      }
    }
  });

  it("evita repetir defensores enquanto houver opções", () => {
    const pool = filterDefenderPool(units, 2, []);
    const used = pool.slice(0, 3).map((u) => u.id);
    const next = filterDefenderPool(units, 2, used);
    expect(next.every((u) => !used.includes(u.id))).toBe(true);
  });
});

describe("battleGame lookup", () => {
  const index = buildBattleResultIndex(battleResults);

  it("Toxotes (3) vence Hoplita (1) no lookup pré-calculado", () => {
    const result = lookupBattleResult(index, 3, 1);
    expect(result?.winner).toBe("attacker");
    expect(result?.mode).toBe("mode_category_battle");
  });

  it("resolve escolha do jogador como win/loss/draw", () => {
    const win = resolvePlayerChoice(index, 3, 1);
    expect(win?.outcome).toBe("win");

    const loss = resolvePlayerChoice(index, 1, 3);
    expect(loss?.outcome).toBe("loss");
  });

  it("empata quando atacante e defensor são a mesma unidade", () => {
    const same = resolvePlayerChoice(index, 1, 1);
    expect(same?.outcome).toBe("draw");
  });
});

describe("battleGame run", () => {
  it("sorteio com seed é reproduzível", () => {
    const a = pickDefender(units, 2, [], createRng(42));
    const b = pickDefender(units, 2, [], createRng(42));
    expect(a?.id).toBe(b?.id);
  });

  it("derrota e empate contabilizam e o resumo agrega por Era", () => {
    const history: RoundRecord[] = [
      {
        index: 0,
        eraId: 2,
        defenderId: 2,
        attackerId: 1,
        outcome: "win",
        mode: "mode_category_battle",
      },
      {
        index: 1,
        eraId: 2,
        defenderId: 3,
        attackerId: 1,
        outcome: "loss",
        mode: "mode_category_battle",
      },
      {
        index: 4,
        eraId: 3,
        defenderId: byId(40).id,
        attackerId: 1,
        outcome: "draw",
        mode: "attributes_fallback",
      },
    ];
    const summary = summarizeRun(history);
    expect(summary.wins).toBe(1);
    expect(summary.losses).toBe(1);
    expect(summary.draws).toBe(1);
    expect(summary.byEra[2].wins).toBe(1);
    expect(summary.byEra[2].losses).toBe(1);
    expect(summary.byEra[3].draws).toBe(1);
  });
});
