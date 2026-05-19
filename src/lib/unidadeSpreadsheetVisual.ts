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

/** Campos numéricos com visualização especial na planilha. */
export const UNIDADE_STAT_VISUAL: Partial<
  Record<
    | "pontos_de_vida"
    | "comida"
    | "madeira"
    | "ouro"
    | "favor"
    | "populacao"
    | "tempo_treinamento"
    | "velocidade_movimento"
    | "forca_atributos"
    | "dps"
    | "armadura_anticorte"
    | "armadura_antiperfurante",
    SpreadsheetStatVisualSpec
  >
> = {
  pontos_de_vida: { kind: "bar", max: 500, barClass: "bg-red-500" },
  dps: { kind: "bar", max: 40, barClass: "bg-orange-500" },
  velocidade_movimento: { kind: "bar", max: 7, barClass: "bg-emerald-500" },
  forca_atributos: { kind: "bar", max: 500, barClass: "bg-amber-500" },
  comida: { kind: "ring", max: 100, ringClass: "stroke-amber-400" },
  madeira: { kind: "ring", max: 100, ringClass: "stroke-emerald-500" },
  ouro: { kind: "ring", max: 100, ringClass: "stroke-yellow-400" },
  favor: { kind: "ring", max: 30, ringClass: "stroke-violet-400" },
  populacao: { kind: "ring", max: 10, ringClass: "stroke-sky-400" },
  tempo_treinamento: { kind: "ring", max: 180, ringClass: "stroke-zinc-400" },
  armadura_anticorte: { kind: "percentRing", max: 100, ringClass: "stroke-rose-400" },
  armadura_antiperfurante: { kind: "percentRing", max: 100, ringClass: "stroke-blue-400" },
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
