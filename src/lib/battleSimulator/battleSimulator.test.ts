import { describe, expect, it } from "vitest";
import type { Unidade } from "@/data/catalog";
import unidadesPt from "@/data/locale/pt/unidades_aom.json";
import unidadesEn from "@/data/locale/en/unidades_aom.json";
import {
  channelEffectiveDps,
  computeDirectionalDamage,
  getDefenderTypeIds,
  precomputeAllBattleResults,
  precomputeBattleResult,
  resolveBestMultiplier,
  resolveBattleTypeId,
  simulateBattle,
} from "@/lib/battleSimulator";

const pt = unidadesPt as Unidade[];
const en = unidadesEn as Unidade[];

function byId(list: Unidade[], id: number): Unidade {
  const u = list.find((x) => x.id === id);
  if (!u) throw new Error(`unidade id=${id} não encontrada`);
  return u;
}

function unit(partial: Partial<Unidade> & Pick<Unidade, "id" | "nome" | "tipo" | "icon">): Unidade {
  return {
    panteao: [],
    era: [],
    ...partial,
  };
}

describe("classification", () => {
  it("normaliza tipos PT e EN pelo rótulo e ícone", () => {
    expect(resolveBattleTypeId("Infantaria", "aomr_type_infantry_icon")).toBe("infantaria");
    expect(resolveBattleTypeId("Infantry", undefined)).toBe("infantaria");
    expect(resolveBattleTypeId("Mythic", "aomr_type_myth_unit_icon")).toBe("unidade_mitica");
    expect(resolveBattleTypeId("Artilharia", "aomr_type_archer_icon")).toBe("artilharia");
    expect(resolveBattleTypeId("Hero", "aomr_type_hero_icon")).toBe("heroi");
  });

  it("deriva soldado_humano para Inf/Cav/Art", () => {
    const hoplita = byId(pt, 1);
    const types = getDefenderTypeIds(hoplita);
    expect(types.has("infantaria")).toBe(true);
    expect(types.has("soldado_humano")).toBe(true);
  });

  it("escolhe o maior multiplicador compatível quando há vários tipos", () => {
    const attacker = unit({
      id: 9001,
      nome: "Atacante multi",
      icon: "x",
      tipo: [{ type: "Infantaria", icon: "aomr_type_infantry_icon" }],
      multiplicador: [
        { type: "Cavalaria", icon: "aomr_type_cavalry_icon", value: "1.25" },
        { type: "Herói", icon: "aomr_type_hero_icon", value: "2" },
        { type: "Unidade mítica", icon: "aomr_type_myth_unit_icon", value: "3" },
      ],
    });
    const defender = unit({
      id: 9002,
      nome: "Herói mítico",
      icon: "y",
      tipo: [
        { type: "Herói", icon: "aomr_type_hero_icon" },
        { type: "Unidade mítica", icon: "aomr_type_myth_unit_icon" },
      ],
    });
    const match = resolveBestMultiplier(attacker, defender);
    expect(match.factor).toBe(3);
    expect(match.matchedType).toBe("unidade_mitica");
  });

  it("ignora multiplicador não numérico e usa fator neutro 1", () => {
    const attacker = unit({
      id: 9003,
      nome: "Texto",
      icon: "x",
      tipo: [{ type: "Infantaria", icon: "aomr_type_infantry_icon" }],
      multiplicador: [
        {
          type: "Cavalaria",
          icon: "aomr_type_cavalry_icon",
          value: "10 (dano divino) ignora armaduras",
        },
      ],
      dano_cortante: 5,
      velocidade_de_ataque_atk_s: 1,
    });
    // parseMultiplicadorCompareNumber pega o leading "10" — usar texto sem número
    attacker.multiplicador = [
      { type: "Cavalaria", icon: "aomr_type_cavalry_icon", value: "especial" },
    ];
    const defender = byId(pt, 2); // Hippeis / Cavalaria
    const match = resolveBestMultiplier(attacker, defender);
    expect(match.factor).toBe(1);
    expect(match.matchedType).toBeNull();
  });

  it("funciona com unidades EN pelo mesmo id", () => {
    const toxotesEn = byId(en, 3);
    const hoplitaEn = byId(en, 1);
    const match = resolveBestMultiplier(toxotesEn, hoplitaEn);
    expect(match.factor).toBe(1.25);
  });
});

describe("damage", () => {
  it("aplica armadura só em cortante/perfurante", () => {
    // 10 * 1 * 1 * (1 - 0.5) = 5
    expect(channelEffectiveDps(10, 1, 1, 50)).toBe(5);
    // contundente sem armadura
    expect(channelEffectiveDps(10, 1, 1, null)).toBe(10);
    // armadura 100% zera
    expect(channelEffectiveDps(10, 1.25, 1, 100)).toBe(0);
  });

  it("calcula DPS efetivo Toxotes → Hoplita com multiplicador e anti-perfuração", () => {
    const toxotes = byId(pt, 3);
    const hoplita = byId(pt, 1);
    const d = computeDirectionalDamage(toxotes, hoplita);
    // 6 * 1.25 * 1 * (1 - 0.10) = 6.75
    expect(d.multiplier.factor).toBe(1.25);
    expect(d.effectiveDpsPerUnit).toBeCloseTo(6.75, 5);
  });

  it("Hoplita → Toxotes sem multiplicador, com anti-corte do Toxotes", () => {
    const hoplita = byId(pt, 1);
    const toxotes = byId(pt, 3);
    const d = computeDirectionalDamage(hoplita, toxotes);
    // 8 * 1 * 1 * (1 - 0.15) = 6.8
    expect(d.multiplier.factor).toBe(1);
    expect(d.effectiveDpsPerUnit).toBeCloseTo(6.8, 5);
  });
});

describe("simulateBattle combat", () => {
  it("Hoplita 1×1 vence Toxotes no combate real (stats > categoria)", () => {
    const result = simulateBattle(
      { unidade: byId(pt, 1) },
      { unidade: byId(pt, 3) },
    );
    expect(result.mode).toBe("combat");
    if (result.mode !== "combat") return;
    expect(result.winner).toBe("a");
    expect(result.durationSeconds).toBeGreaterThan(0);
  });

  it("triângulo: Hippeis tem vantagem de multiplicador vs Toxotes", () => {
    const match = resolveBestMultiplier(byId(pt, 2), byId(pt, 3));
    expect(match.factor).toBe(1.5);
    expect(match.matchedType).toBe("artilharia");
  });

  it("grupos: mais unidades alteram o vencedor", () => {
    // 1 Hoplita vs 1 Toxotes → Hoplita
    const one = simulateBattle(
      { unidade: byId(pt, 1), quantity: 1 },
      { unidade: byId(pt, 3), quantity: 1 },
    );
    expect(one.mode).toBe("combat");
    if (one.mode === "combat") expect(one.winner).toBe("a");

    // muitos Toxotes vs 1 Hoplita → Toxotes
    const many = simulateBattle(
      { unidade: byId(pt, 1), quantity: 1 },
      { unidade: byId(pt, 3), quantity: 20 },
    );
    expect(many.mode).toBe("combat");
    if (many.mode === "combat") expect(many.winner).toBe("b");
  });

  it("empate quando ambos morrem no mesmo segundo", () => {
    const a = unit({
      id: 9101,
      nome: "A",
      icon: "a",
      tipo: [{ type: "Infantaria", icon: "aomr_type_infantry_icon" }],
      pontos_de_vida: 10,
      dano_cortante: 10,
      velocidade_de_ataque_atk_s: 1,
      armadura_anticorte: 0,
      armadura_antiperfurante: 0,
    });
    const b = unit({
      id: 9102,
      nome: "B",
      icon: "b",
      tipo: [{ type: "Infantaria", icon: "aomr_type_infantry_icon" }],
      pontos_de_vida: 10,
      dano_cortante: 10,
      velocidade_de_ataque_atk_s: 1,
      armadura_anticorte: 0,
      armadura_antiperfurante: 0,
    });
    const result = simulateBattle({ unidade: a }, { unidade: b });
    expect(result.mode).toBe("combat");
    if (result.mode !== "combat") return;
    expect(result.winner).toBe("draw");
    expect(result.durationSeconds).toBe(1);
  });

  it("impasse quando nenhum lado causa dano", () => {
    const scout = unit({
      id: 9103,
      nome: "Scout",
      icon: "s",
      tipo: [{ type: "Unidade mítica", icon: "aomr_type_myth_unit_icon" }],
      pontos_de_vida: 50,
      velocidade_de_ataque_atk_s: 0,
      dps: 0,
      armadura_anticorte: 50,
      armadura_antiperfurante: 50,
    });
    const result = simulateBattle({ unidade: scout }, { unidade: scout });
    expect(result.mode).toBe("combat");
    if (result.mode === "combat") expect(result.winner).toBe("stalemate");
  });

  it("Jasão tem multiplicador alto vs Minotauro", () => {
    const jason = byId(pt, 58);
    const minotaur = byId(pt, 40);
    const match = resolveBestMultiplier(jason, minotaur);
    expect(match.factor).toBe(12);
    expect(match.matchedType).toBe("unidade_mitica");
  });
});

describe("simulateBattle mode_category_battle", () => {
  it("padrão é false (modo combate)", () => {
    const result = simulateBattle(
      { unidade: byId(pt, 1) },
      { unidade: byId(pt, 3) },
    );
    expect(result.mode).toBe("combat");
  });

  it("Toxotes vence Hoplita só pela categoria, apesar dos stats", () => {
    const combat = simulateBattle(
      { unidade: byId(pt, 3) },
      { unidade: byId(pt, 1) },
    );
    expect(combat.mode).toBe("combat");
    if (combat.mode === "combat") {
      // Toxotes perde no combate real 1×1
      expect(combat.winner).toBe("b");
    }

    const category = simulateBattle(
      { unidade: byId(pt, 3) },
      { unidade: byId(pt, 1) },
      { mode_category_battle: true },
    );
    expect(category.mode).toBe("category");
    if (category.mode !== "category") return;
    expect(category.winner).toBe("a");
    expect(category.sideA.factor).toBe(1.25);
    expect(category.sideB.factor).toBe(1);
  });

  it("quantidade e stats não alteram o modo categoria", () => {
    const result = simulateBattle(
      { unidade: byId(pt, 3), quantity: 1 },
      { unidade: byId(pt, 1), quantity: 50 },
      { mode_category_battle: true },
    );
    expect(result.mode).toBe("category");
    if (result.mode === "category") expect(result.winner).toBe("a");
  });

  it("vantagens iguais empatam", () => {
    const a = unit({
      id: 9201,
      nome: "A",
      icon: "a",
      tipo: [{ type: "Infantaria", icon: "aomr_type_infantry_icon" }],
      multiplicador: [
        { type: "Cavalaria", icon: "aomr_type_cavalry_icon", value: "1.5" },
      ],
    });
    const b = unit({
      id: 9202,
      nome: "B",
      icon: "b",
      tipo: [{ type: "Cavalaria", icon: "aomr_type_cavalry_icon" }],
      multiplicador: [
        { type: "Infantaria", icon: "aomr_type_infantry_icon", value: "1.5" },
      ],
    });
    const result = simulateBattle(
      { unidade: a },
      { unidade: b },
      { mode_category_battle: true },
    );
    expect(result.mode).toBe("category");
    if (result.mode === "category") {
      expect(result.winner).toBe("draw");
      expect(result.sideA.factor).toBe(1.5);
      expect(result.sideB.factor).toBe(1.5);
    }
  });

  it("triângulo didático: Inf < Art, Art < Cav, Cav < Inf", () => {
    const hoplita = byId(pt, 1);
    const hippeis = byId(pt, 2);
    const toxotes = byId(pt, 3);

    const artVsInf = simulateBattle(
      { unidade: toxotes },
      { unidade: hoplita },
      { mode_category_battle: true },
    );
    expect(artVsInf.mode === "category" && artVsInf.winner).toBe("a");

    const cavVsArt = simulateBattle(
      { unidade: hippeis },
      { unidade: toxotes },
      { mode_category_battle: true },
    );
    expect(cavVsArt.mode === "category" && cavVsArt.winner).toBe("a");

    const infVsCav = simulateBattle(
      { unidade: hoplita },
      { unidade: hippeis },
      { mode_category_battle: true },
    );
    expect(infVsCav.mode === "category" && infVsCav.winner).toBe("a");
  });
});

describe("precomputed battle results", () => {
  const slug = (u: Unidade) => u.nome.toLowerCase().replace(/\s+/g, "-");

  it("salva vitória de categoria no formato de consulta", () => {
    const result = precomputeBattleResult(byId(pt, 3), byId(pt, 1), slug);

    expect(result).toEqual({
      attacker: "toxotes",
      defender: "hoplita",
      winner: "attacker",
      winner_name: "toxotes",
      mode: "mode_category_battle",
      attacker_id: 3,
      defender_id: 1,
    });
  });

  it("usa atributos quando a categoria empata", () => {
    const strong = unit({
      id: 9301,
      nome: "Forte",
      icon: "forte",
      tipo: [{ type: "Infantaria", icon: "aomr_type_infantry_icon" }],
      pontos_de_vida: 100,
      dano_cortante: 20,
      velocidade_de_ataque_atk_s: 1,
      armadura_anticorte: 0,
      armadura_antiperfurante: 0,
    });
    const weak = unit({
      id: 9302,
      nome: "Fraco",
      icon: "fraco",
      tipo: [{ type: "Infantaria", icon: "aomr_type_infantry_icon" }],
      pontos_de_vida: 50,
      dano_cortante: 5,
      velocidade_de_ataque_atk_s: 1,
      armadura_anticorte: 0,
      armadura_antiperfurante: 0,
    });

    const result = precomputeBattleResult(strong, weak, slug);
    expect(result.mode).toBe("attributes_fallback");
    expect(result.winner).toBe("attacker");
    expect(result.winner_name).toBe("forte");
  });

  it("gera confrontos ordenados e omite confronto próprio", () => {
    const units = [byId(pt, 1), byId(pt, 2), byId(pt, 3)];
    const results = precomputeAllBattleResults(units, slug);

    expect(results).toHaveLength(6);
    expect(
      results.some(
        (result) => result.attacker_id === result.defender_id,
      ),
    ).toBe(false);
  });
});
