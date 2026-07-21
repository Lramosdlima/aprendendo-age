import type { Unidade } from "@/data/catalog";

/** Canais de dano tipados usados no motor. */
export type DamageChannel =
  | "cortante"
  | "perfurante"
  | "contundente"
  | "divino"
  | "area";

/** Identificadores canónicos de tipo (PT). */
export type BattleUnitTypeId =
  | "infantaria"
  | "cavalaria"
  | "artilharia"
  | "heroi"
  | "unidade_mitica"
  | "soldado_humano"
  | "construcao"
  | "aldeao"
  | "voador"
  | "barco"
  | "cerco"
  | "tita"
  | "outro";

export type BattleGroup = {
  unidade: Unidade;
  /** Quantidade de unidades no grupo. Padrão: 1. */
  quantity?: number;
};

export type BattleSimulatorOptions = {
  /**
   * Quando `true`, ignora dano/vida/armadura e decide o vencedor
   * apenas pelo maior multiplicador compatível de cada lado.
   * Padrão: `false`.
   */
  mode_category_battle?: boolean;
  /** Limite de segundos na simulação de combate. Padrão: 10_000. */
  maxRounds?: number;
};

export type MultiplierMatch = {
  /** Fator aplicado (1 = neutro / sem multiplicador numérico). */
  factor: number;
  /** Tipo canónico do defensor que ativou o multiplicador, se houver. */
  matchedType: BattleUnitTypeId | null;
  /** Rótulo original do multiplicador no atacante, se houver. */
  multiplierLabel: string | null;
};

export type DamageChannelBreakdown = {
  channel: DamageChannel;
  baseDamage: number;
  multiplier: number;
  attacksPerSecond: number;
  armorPercent: number;
  /** DPS efetivo por unidade após multiplicador e armadura. */
  effectiveDps: number;
};

export type DirectionalDamage = {
  multiplier: MultiplierMatch;
  channels: DamageChannelBreakdown[];
  /** Soma dos canais — DPS efetivo por unidade. */
  effectiveDpsPerUnit: number;
};

export type BattleRoundSnapshot = {
  second: number;
  sideAAlive: number;
  sideBAlive: number;
  sideAHp: number;
  sideBHp: number;
  damageToA: number;
  damageToB: number;
};

export type CombatBattleResult = {
  mode: "combat";
  winner: "a" | "b" | "draw" | "stalemate";
  durationSeconds: number;
  sideA: {
    quantityStart: number;
    quantityEnd: number;
    hpStart: number;
    hpEnd: number;
    damage: DirectionalDamage;
  };
  sideB: {
    quantityStart: number;
    quantityEnd: number;
    hpStart: number;
    hpEnd: number;
    damage: DirectionalDamage;
  };
  rounds: BattleRoundSnapshot[];
};

export type CategoryBattleResult = {
  mode: "category";
  winner: "a" | "b" | "draw";
  sideA: MultiplierMatch;
  sideB: MultiplierMatch;
};

export type BattleResult = CombatBattleResult | CategoryBattleResult;
