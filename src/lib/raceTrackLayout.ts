import type { RankTierId } from "@/lib/rankClassification";

/** RR máximo exibido no topo da pista (Diamante I+). */
export const RACE_TRACK_MAX_RR = 2100;

export const RACE_TRACK_MIN_RR = 0;

/** Percentual vertical (0 = base/bronze, 100 = topo/diamante). */
export function rrToTrackPercent(rr: number): number {
  const clamped = Math.min(RACE_TRACK_MAX_RR, Math.max(RACE_TRACK_MIN_RR, rr));
  return (clamped / RACE_TRACK_MAX_RR) * 100;
}

export type RaceTierMarker = {
  tierId: RankTierId;
  rrCenter: number;
  percent: number;
};

export const RACE_TIER_MARKERS: RaceTierMarker[] = [
  { tierId: "bronze", rrCenter: 500, percent: rrToTrackPercent(500) },
  { tierId: "prata", rrCenter: 1150, percent: rrToTrackPercent(1150) },
  { tierId: "ouro", rrCenter: 1450, percent: rrToTrackPercent(1450) },
  { tierId: "esmeralda", rrCenter: 1700, percent: rrToTrackPercent(1700) },
  { tierId: "diamante", rrCenter: 1950, percent: rrToTrackPercent(1950) },
];

/** Agrupa jogadores por faixa de RR (degraus de 25) para espalhar avatares na horizontal. */
export function groupPlayersByRrBand<T extends { id: string; rr: number }>(players: T[]): Map<number, T[]> {
  const bands = new Map<number, T[]>();
  for (const p of players) {
    const band = Math.floor(p.rr / 25) * 25;
    const list = bands.get(band) ?? [];
    list.push(p);
    bands.set(band, list);
  }
  return bands;
}

export function horizontalSpreadIndex(index: number, total: number, maxPx = 72): number {
  if (total <= 1) return 0;
  return ((index / (total - 1)) * 2 - 1) * (maxPx / 2);
}
