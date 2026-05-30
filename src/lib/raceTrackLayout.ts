import type { RankTierId } from "@/lib/rankClassification";

/** RR máximo exibido no topo da pista (Diamante I+). */
export const RACE_TRACK_MAX_RR = 2100;

export const RACE_TRACK_MIN_RR = 0;

/** Tamanho aproximado do avatar + margem (px). */
export const RACE_AVATAR_BOX_PX = 48 + 8;

/** Classe Tailwind da faixa útil da pista (alinha com a linha vertical tracejada). */
export const RACE_TRACK_LANE_CLASS = "absolute inset-x-0 top-8 bottom-8";

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

const SEGMENT_HEIGHT_PERCENT = 100 / RACE_TIER_BANDS.length;

export type RaceAvatarPlacement = {
  id: string;
  bottomPercent: number;
  zIndex: number;
};

export type RaceTierMarker = {
  tierId: RankTierId;
  /** RR no início da faixa (badge à direita). */
  rrStart: number;
  /** 0 = ponta inferior da pista; 100 = ponta superior. */
  percent: number;
};

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Início de cada faixa na pista (Bronze = 0% = ponta inferior). */
function tierSegmentStartPercent(segmentIndex: number): number {
  return segmentIndex * SEGMENT_HEIGHT_PERCENT;
}

export const RACE_TIER_MARKERS: RaceTierMarker[] = RACE_TIER_BANDS.map((band, index) => ({
  tierId: band.tierId,
  rrStart: band.rrMin,
  percent: tierSegmentStartPercent(index),
}));

/** Ponta superior da faixa útil (100%). */
export function trackTopPercent(): number {
  return 100;
}

/** Ponta inferior da faixa útil (0%). */
export function trackBottomPercent(): number {
  return 0;
}

function trackUsableSpanPercent(): number {
  return 100;
}

/**
 * Escala linear 0 → maxRrInLobby na pista.
 * 0% = ponta inferior; 100% = ponta superior (top 1).
 */
export function rrToTrackPercent(rr: number, maxRrInLobby: number): number {
  const r = Math.max(RACE_TRACK_MIN_RR, rr);
  const maxR = Math.max(maxRrInLobby, r, 1);
  const t = r / maxR;
  return t * trackUsableSpanPercent();
}

function minVerticalGapPercent(trackHeightPx: number): number {
  return (RACE_AVATAR_BOX_PX / trackHeightPx) * 100;
}

/**
 * Posiciona avatares na linha vertical (0–100% da faixa).
 * O maior RR fica na ponta superior (100%).
 */
export function layoutRaceAvatars(
  players: Array<{ id: string; rr: number }>,
  trackHeightPx: number,
): RaceAvatarPlacement[] {
  if (players.length === 0) return [];

  const maxRr = Math.max(...players.map((p) => p.rr));
  const top = trackTopPercent();
  const bottom = trackBottomPercent();
  const sorted = [...players].sort((a, b) => a.rr - b.rr || a.id.localeCompare(b.id));
  const minGap = Math.min(minVerticalGapPercent(trackHeightPx), trackUsableSpanPercent() / sorted.length);

  const positions = new Map<string, number>();
  for (const player of sorted) {
    positions.set(player.id, clampPercent(clamp(rrToTrackPercent(player.rr, maxRr), bottom, top)));
  }

  const topPlayer = sorted[sorted.length - 1]!;
  positions.set(topPlayer.id, top);

  let prev = bottom - minGap;
  for (const player of sorted) {
    let pos = Math.max(positions.get(player.id)!, prev + minGap);
    pos = Math.min(pos, top);
    positions.set(player.id, pos);
    prev = pos;
  }

  positions.set(topPlayer.id, top);
  for (let i = sorted.length - 2; i >= 0; i -= 1) {
    const player = sorted[i]!;
    const aboveId = sorted[i + 1]!.id;
    let pos = Math.min(positions.get(player.id)!, positions.get(aboveId)! - minGap);
    pos = Math.max(pos, bottom);
    positions.set(player.id, pos);
  }

  return sorted.map((player) => {
    const bottomPercent = positions.get(player.id)!;
    return {
      id: player.id,
      bottomPercent,
      zIndex: 10 + Math.round(bottomPercent),
    };
  });
}

/** Altura mínima do container externo (faixa + top-8/bottom-8). */
export function raceTrackMinHeightPx(_playerCount: number, players: Array<{ rr: number }> = []): number {
  const baseSegmentPx = 168;
  const laneBase = baseSegmentPx * RACE_TIER_BANDS.length;
  const count = Math.max(players.length, 1);
  const neededForAll = Math.ceil((count * RACE_AVATAR_BOX_PX) / 1) + 160;
  return Math.min(Math.max(laneBase + neededForAll, 960), 2400);
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
