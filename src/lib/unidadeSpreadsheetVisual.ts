/**
 * Escalas visuais da planilha de Unidades (referência Notion — barras e anéis
 * proporcionais a um valor máximo de referência para comparar forte/fraco).
 */

export type SpreadsheetStatVisualKind = "bar" | "ring" | "plain" | "percentRing";

export type SpreadsheetStatVisualSpec = {
  kind: SpreadsheetStatVisualKind;
  /** Denominador da proporção (ex.: PV ÷ 500, Comida ÷ 100). */
  max: number;
  barClass?: string;
  ringClass?: string;
};

export type UnidadeSpreadsheetStatField =
  | "pontos_de_vida"
  | "dano_cortante"
  | "dano_perfurante"
  | "alcance"
  | "dano_contundente"
  | "dano_divino"
  | "dano_area"
  | "velocidade_de_ataque_atk_s"
  | "dps"
  | "armadura_anticorte"
  | "armadura_antiperfurante"
  | "comida"
  | "madeira"
  | "ouro"
  | "favor"
  | "populacao"
  | "tempo_treinamento"
  | "tempo_s"
  | "velocidade_movimento"
  | "forca_atributos";

/** Campos numéricos com visualização especial na planilha. */
export const UNIDADE_STAT_VISUAL: Record<UnidadeSpreadsheetStatField, SpreadsheetStatVisualSpec> = {
  pontos_de_vida: { kind: "bar", max: 500, barClass: "bg-red-500" },
  dano_cortante: { kind: "ring", max: 50 },
  dano_perfurante: { kind: "ring", max: 40 },
  alcance: { kind: "ring", max: 25 },
  dano_contundente: { kind: "ring", max: 150 },
  dano_divino: { kind: "ring", max: 20 },
  dano_area: { kind: "ring", max: 5 },
  velocidade_de_ataque_atk_s: { kind: "ring", max: 4, ringClass: "stroke-orange-500" },
  dps: { kind: "bar", max: 40, barClass: "bg-violet-500" },
  armadura_anticorte: { kind: "percentRing", max: 100, ringClass: "stroke-emerald-500" },
  armadura_antiperfurante: { kind: "percentRing", max: 100, ringClass: "stroke-emerald-500" },
  comida: { kind: "ring", max: 100, ringClass: "stroke-red-400" },
  madeira: { kind: "ring", max: 100, ringClass: "stroke-amber-900" },
  ouro: { kind: "ring", max: 100, ringClass: "stroke-yellow-400" },
  favor: { kind: "ring", max: 30, ringClass: "stroke-blue-500" },
  populacao: { kind: "ring", max: 10, ringClass: "stroke-zinc-500" },
  tempo_treinamento: { kind: "ring", max: 180, ringClass: "stroke-rose-400" },
  tempo_s: { kind: "ring", max: 180, ringClass: "stroke-rose-400" },
  velocidade_movimento: { kind: "bar", max: 7, barClass: "bg-orange-500" },
  forca_atributos: { kind: "bar", max: 500, barClass: "bg-amber-500" },
};

export function spreadsheetStatRatio(value: number, max: number): number {
  if (!Number.isFinite(value) || max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

export function formatSpreadsheetStatValue(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}
