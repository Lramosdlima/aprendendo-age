import type { RankTierId } from "@/lib/rankClassification";

/** RR máximo exibido no topo da pista (Diamante I+). */
export const RACE_TRACK_MAX_RR = 2100;

export const RACE_TRACK_MIN_RR = 0;

/** Tamanho do avatar renderizado (px) — usar o maior breakpoint. */
export const RACE_AVATAR_RENDER_PX = 52;

/** Desconto top-8 + bottom-8 do container externo. */
export const RACE_TRACK_LANE_INSET_PX = 64;

/** Classe Tailwind da faixa útil da pista (alinha com a linha vertical tracejada). */
export const RACE_TRACK_LANE_CLASS = "absolute inset-x-0 top-8 bottom-8 overflow-hidden";

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

/** Ponta superior — centro do avatar encostado no topo da faixa (sem vazar). */
export function trackTopPercent(laneHeightPx: number): number {
  const inset = ((RACE_AVATAR_RENDER_PX / 2) / laneHeightPx) * 100;
  return 100 - inset;
}

/** Ponta inferior — centro do avatar encostado na base da faixa. */
export function trackBottomPercent(laneHeightPx: number): number {
  const inset = ((RACE_AVATAR_RENDER_PX / 2) / laneHeightPx) * 100;
  return inset;
}

function trackUsableSpanPercent(laneHeightPx: number): number {
  return trackTopPercent(laneHeightPx) - trackBottomPercent(laneHeightPx);
}

/** Altura útil da faixa a partir do minHeight do container externo. */
export function raceTrackLaneHeightPx(outerHeightPx: number): number {
  return Math.max(outerHeightPx - RACE_TRACK_LANE_INSET_PX, 320);
}

/**
 * Escala linear 0 → maxRrInLobby na pista.
 * Extremos reservam metade do avatar para não ultrapassar a faixa.
 */
export function rrToTrackPercent(rr: number, maxRrInLobby: number, laneHeightPx: number): number {
  const r = Math.max(RACE_TRACK_MIN_RR, rr);
  const maxR = Math.max(maxRrInLobby, r, 1);
  const t = r / maxR;
  const bottom = trackBottomPercent(laneHeightPx);
  return bottom + t * trackUsableSpanPercent(laneHeightPx);
}

function minVerticalGapPercent(laneHeightPx: number): number {
  return (RACE_AVATAR_RENDER_PX / laneHeightPx) * 100;
}

/**
 * Posiciona avatares na linha vertical, contidos na faixa.
 * O maior RR fica no topo útil da pista (sem sobrepor o texto acima).
 */
export function layoutRaceAvatars(
  players: Array<{ id: string; rr: number }>,
  laneHeightPx: number,
): RaceAvatarPlacement[] {
  if (players.length === 0) return [];

  const maxRr = Math.max(...players.map((p) => p.rr));
  const top = trackTopPercent(laneHeightPx);
  const bottom = trackBottomPercent(laneHeightPx);
  const sorted = [...players].sort((a, b) => a.rr - b.rr || a.id.localeCompare(b.id));
  const minGap = Math.min(
    minVerticalGapPercent(laneHeightPx),
    trackUsableSpanPercent(laneHeightPx) / sorted.length,
  );

  const positions = new Map<string, number>();
  for (const player of sorted) {
    positions.set(
      player.id,
      clampPercent(clamp(rrToTrackPercent(player.rr, maxRr, laneHeightPx), bottom, top)),
    );
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
  const neededLane = Math.ceil(count * RACE_AVATAR_RENDER_PX) + 160;
  return Math.min(Math.max(laneBase + neededLane + RACE_TRACK_LANE_INSET_PX, 960), 2400);
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
