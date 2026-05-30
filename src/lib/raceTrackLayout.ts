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
  /** RR de referência no badge à direita. */
  rrCenter: number;
};

export const RACE_TIER_BANDS: RaceTierBand[] = [
  { tierId: "bronze", rrMin: 0, rrMax: 999, rrCenter: 500 },
  { tierId: "prata", rrMin: 1000, rrMax: 1299, rrCenter: 1150 },
  { tierId: "ouro", rrMin: 1300, rrMax: 1599, rrCenter: 1450 },
  { tierId: "esmeralda", rrMin: 1600, rrMax: 1799, rrCenter: 1700 },
  { tierId: "diamante", rrMin: 1800, rrMax: RACE_TRACK_MAX_RR, rrCenter: 1950 },
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
  rrCenter: number;
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
  rrCenter: band.rrCenter,
  percent: tierSegmentCenterPercent(index),
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

function minVerticalGapPercent(trackHeightPx: number): number {
  return (RACE_AVATAR_BOX_PX / trackHeightPx) * 100;
}

function verticalCollides(a: number, b: number, minGap: number): boolean {
  return Math.abs(a - b) < minGap;
}

function* verticalCandidates(target: number, minGap: number): Generator<number> {
  yield target;
  for (let step = 1; step <= 40; step += 1) {
    yield target + step * minGap;
    yield target - step * minGap;
  }
}

/**
 * Posiciona avatares só na linha vertical central; empilha para cima/baixo se necessário.
 */
export function layoutRaceAvatars(
  players: Array<{ id: string; rr: number }>,
  trackHeightPx: number,
): RaceAvatarPlacement[] {
  if (players.length === 0) return [];

  const minGap = minVerticalGapPercent(trackHeightPx);
  const sorted = [...players].sort((a, b) => a.rr - b.rr || a.id.localeCompare(b.id));
  const occupied: number[] = [];

  return sorted.map((player) => {
    const target = rrToTrackPercent(player.rr);
    let bottomPercent = target;

    for (const candidate of verticalCandidates(target, minGap)) {
      const clamped = clampPercent(candidate);
      if (!occupied.some((other) => verticalCollides(clamped, other, minGap))) {
        bottomPercent = clamped;
        break;
      }
    }

    occupied.push(bottomPercent);
    return {
      id: player.id,
      bottomPercent,
      zIndex: 10 + Math.round(bottomPercent),
    };
  });
}

function maxPlayersInTierBand(players: Array<{ rr: number }>): number {
  const counts = new Map<number, number>();
  for (const player of players) {
    const index = RACE_TIER_BANDS.indexOf(findTierBand(player.rr));
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }
  return Math.max(0, ...counts.values());
}

/** Altura da pista: faixas generosas + folga extra na faixa mais cheia. */
export function raceTrackMinHeightPx(playerCount: number, players: Array<{ rr: number }> = []): number {
  const baseSegmentPx = 168;
  const base = baseSegmentPx * RACE_TIER_BANDS.length + 120;
  const busiest = maxPlayersInTierBand(players);
  const extra = Math.max(0, busiest - 1) * RACE_AVATAR_BOX_PX;
  const byCount = playerCount > 12 ? (playerCount - 12) * 24 : 0;
  return Math.min(Math.max(base + extra + byCount, 960), 1600);
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
