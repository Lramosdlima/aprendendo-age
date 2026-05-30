import type { RankTierId } from "@/lib/rankClassification";

/** RR máximo exibido no topo da pista (Diamante I+). */
export const RACE_TRACK_MAX_RR = 2100;

export const RACE_TRACK_MIN_RR = 0;

/** Tamanho aproximado do avatar + margem (px). */
export const RACE_AVATAR_BOX_PX = 48 + 8;

const TRACK_BOTTOM_PADDING_PERCENT = 5;
const TRACK_TOP_PADDING_PERCENT = 8;

export type RaceTierBand = {
  tierId: RankTierId;
  rrMin: number;
  rrMax: number;
};

export const RACE_TIER_BANDS: RaceTierBand[] = [
  { tierId: "bronze", rrMin: 0, rrMax: 999 },
  { tierId: "prata", rrMin: 1000, rrMax: 1299 },
  { tierId: "ouro", rrMin: 1300, rrMax: 1599 },
  { tierId: "esmeralda", rrMin: 1600, rrMax: 1799 },
  { tierId: "diamante", rrMin: 1800, rrMax: RACE_TRACK_MAX_RR },
];

const SEGMENT_HEIGHT_PERCENT =
  (100 - TRACK_BOTTOM_PADDING_PERCENT - TRACK_TOP_PADDING_PERCENT) / RACE_TIER_BANDS.length;

export type RaceAvatarPlacement = {
  id: string;
  bottomPercent: number;
  zIndex: number;
};

export type RaceTierMarker = {
  tierId: RankTierId;
  /** RR no início da faixa (badge à direita). */
  rrStart: number;
  percent: number;
};

function clampRr(rr: number): number {
  return Math.min(RACE_TRACK_MAX_RR, Math.max(RACE_TRACK_MIN_RR, rr));
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function findTierBand(rr: number): RaceTierBand {
  const clamped = clampRr(rr);
  return (
    RACE_TIER_BANDS.find((band) => clamped >= band.rrMin && clamped <= band.rrMax) ??
    RACE_TIER_BANDS[RACE_TIER_BANDS.length - 1]!
  );
}

function tierSegmentStartPercent(segmentIndex: number): number {
  return TRACK_BOTTOM_PADDING_PERCENT + segmentIndex * SEGMENT_HEIGHT_PERCENT;
}

/** Centro visual de cada faixa de elo — espaçamento uniforme na pista. */
export function tierSegmentCenterPercent(segmentIndex: number): number {
  return tierSegmentStartPercent(segmentIndex) + SEGMENT_HEIGHT_PERCENT / 2;
}

export const RACE_TIER_MARKERS: RaceTierMarker[] = RACE_TIER_BANDS.map((band, index) => ({
  tierId: band.tierId,
  rrStart: band.rrMin,
  percent: tierSegmentStartPercent(index),
}));

/**
 * Mapeia RR → posição vertical dentro da faixa do elo correspondente.
 * Cada elo ocupa a mesma altura na pista (como o vão Bronze–Prata).
 */
export function rrToTrackPercent(rr: number): number {
  const clamped = clampRr(rr);
  const band = findTierBand(clamped);
  const segmentIndex = RACE_TIER_BANDS.indexOf(band);
  const span = Math.max(1, band.rrMax - band.rrMin);
  const t = (clamped - band.rrMin) / span;

  const innerPad = SEGMENT_HEIGHT_PERCENT * 0.12;
  const segmentStart = tierSegmentStartPercent(segmentIndex);
  const usable = SEGMENT_HEIGHT_PERCENT - innerPad * 2;

  return segmentStart + innerPad + t * usable;
}

function tierSegmentBounds(segmentIndex: number): { min: number; max: number } {
  const innerPad = SEGMENT_HEIGHT_PERCENT * 0.08;
  return {
    min: tierSegmentStartPercent(segmentIndex) + innerPad,
    max: tierSegmentStartPercent(segmentIndex) + SEGMENT_HEIGHT_PERCENT - innerPad,
  };
}

function minVerticalGapPercent(trackHeightPx: number): number {
  return (RACE_AVATAR_BOX_PX / trackHeightPx) * 100;
}

function layoutPlayersInTierBand(
  players: Array<{ id: string; rr: number }>,
  segmentIndex: number,
  trackHeightPx: number,
): RaceAvatarPlacement[] {
  if (players.length === 0) return [];

  const bounds = tierSegmentBounds(segmentIndex);
  const span = bounds.max - bounds.min;
  const sorted = [...players].sort((a, b) => a.rr - b.rr || a.id.localeCompare(b.id));

  if (sorted.length === 1) {
    const only = sorted[0]!;
    const bottomPercent = clampPercent(clamp(rrToTrackPercent(only.rr), bounds.min, bounds.max));
    return [{ id: only.id, bottomPercent, zIndex: 10 + Math.round(bottomPercent) }];
  }

  const baseMinGap = minVerticalGapPercent(trackHeightPx);
  const minGap = Math.min(baseMinGap, span / sorted.length);

  const positions: number[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const target = clampPercent(clamp(rrToTrackPercent(sorted[i]!.rr), bounds.min, bounds.max));
    let pos = target;
    if (i > 0) {
      pos = Math.max(pos, positions[i - 1]! + minGap);
    }
    positions.push(Math.min(pos, bounds.max));
  }

  const overflow = positions[positions.length - 1]! - bounds.max;
  if (overflow > 0) {
    for (let i = 0; i < positions.length; i += 1) {
      positions[i] = positions[i]! - overflow;
    }
    for (let i = 1; i < positions.length; i += 1) {
      positions[i] = Math.max(positions[i]!, positions[i - 1]! + minGap);
    }
  }

  const underflow = bounds.min - positions[0]!;
  if (underflow > 0) {
    for (let i = 0; i < positions.length; i += 1) {
      positions[i] = positions[i]! + underflow;
    }
  }

  // Se ainda não couber, distribui uniformemente mantendo a ordem de RR.
  if (positions[positions.length - 1]! > bounds.max || positions[0]! < bounds.min) {
    const step = span / sorted.length;
    for (let i = 0; i < sorted.length; i += 1) {
      positions[i] = bounds.min + step * i + step / 2;
    }
  }

  return sorted.map((player, index) => {
    const bottomPercent = clampPercent(positions[index]!);
    return {
      id: player.id,
      bottomPercent,
      zIndex: 10 + Math.round(bottomPercent),
    };
  });
}

/**
 * Posiciona avatares na linha vertical, sempre dentro da faixa do elo (RR).
 * Colisões são resolvidas só dentro do mesmo tier — nunca empurra para bronze/prata etc.
 */
export function layoutRaceAvatars(
  players: Array<{ id: string; rr: number }>,
  trackHeightPx: number,
): RaceAvatarPlacement[] {
  if (players.length === 0) return [];

  const byTier = new Map<number, Array<{ id: string; rr: number }>>();
  for (const player of players) {
    const segmentIndex = RACE_TIER_BANDS.indexOf(findTierBand(player.rr));
    const list = byTier.get(segmentIndex) ?? [];
    list.push(player);
    byTier.set(segmentIndex, list);
  }

  const result: RaceAvatarPlacement[] = [];
  for (const [segmentIndex, bandPlayers] of byTier) {
    result.push(...layoutPlayersInTierBand(bandPlayers, segmentIndex, trackHeightPx));
  }
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function maxPlayersInTierBand(players: Array<{ rr: number }>): number {
  const counts = new Map<number, number>();
  for (const player of players) {
    const index = RACE_TIER_BANDS.indexOf(findTierBand(player.rr));
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }
  return Math.max(0, ...counts.values());
}

/** Altura da pista: garante espaço vertical na faixa com mais jogadores. */
export function raceTrackMinHeightPx(_playerCount: number, players: Array<{ rr: number }> = []): number {
  const baseSegmentPx = 168;
  const base = baseSegmentPx * RACE_TIER_BANDS.length + 120;
  const busiest = maxPlayersInTierBand(players);
  const usableSegmentFraction = (SEGMENT_HEIGHT_PERCENT * 0.84) / 100;
  const neededForBusiest =
    busiest > 1 ? Math.ceil((busiest * RACE_AVATAR_BOX_PX) / usableSegmentFraction) + 160 : 0;
  return Math.min(Math.max(base, neededForBusiest, 960), 2400);
}

/** @deprecated Mantido para compatibilidade; avatares ficam na linha central. */
export function horizontalSpreadIndex(_index: number, _total: number): number {
  return 0;
}

/** @deprecated Agrupamento por banda de RR — use layoutRaceAvatars. */
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
