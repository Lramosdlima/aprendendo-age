import type { RankTierId } from "@/lib/rankClassification";

/** RR máximo exibido no topo da pista (Diamante I+). */
export const RACE_TRACK_MAX_RR = 2100;

export const RACE_TRACK_MIN_RR = 0;

/** Tamanho do avatar renderizado (px) — usar o maior breakpoint (moldura compacta). */
export const RACE_AVATAR_RENDER_PX = 64;

/** Desconto top-8 + bottom-8 do container externo. */
export const RACE_TRACK_LANE_INSET_PX = 64;

/** Espaço extra no topo/base para o brilho da moldura não ser cortado. */
export const RACE_AVATAR_GLOW_PAD_PX = 14;

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
  /** Centro do avatar (% a partir da base da pista). */
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

/** Ponta superior — reserva metade do avatar + folga para o brilho. */
export function trackTopPercent(laneHeightPx: number): number {
  const inset = ((RACE_AVATAR_RENDER_PX / 2 + RACE_AVATAR_GLOW_PAD_PX) / laneHeightPx) * 100;
  return 100 - inset;
}

/** Ponta inferior — reserva metade do avatar + folga para o brilho. */
export function trackBottomPercent(laneHeightPx: number): number {
  const inset = ((RACE_AVATAR_RENDER_PX / 2 + RACE_AVATAR_GLOW_PAD_PX) / laneHeightPx) * 100;
  return inset;
}

/** Altura útil da faixa a partir do minHeight do container externo. */
export function raceTrackLaneHeightPx(outerHeightPx: number): number {
  return Math.max(outerHeightPx - RACE_TRACK_LANE_INSET_PX, 320);
}

function findTierBand(rr: number): { band: RaceTierBand; index: number } {
  const clampedRr = Math.max(RACE_TRACK_MIN_RR, rr);
  for (let i = 0; i < RACE_TIER_BANDS.length; i += 1) {
    const band = RACE_TIER_BANDS[i]!;
    if (clampedRr >= band.rrMin && clampedRr <= band.rrMax) {
      return { band, index: i };
    }
  }
  const lastIndex = RACE_TIER_BANDS.length - 1;
  return { band: RACE_TIER_BANDS[lastIndex]!, index: lastIndex };
}

function tierBandBottomPercent(bandIndex: number): number {
  return bandIndex * SEGMENT_HEIGHT_PERCENT;
}

function tierBandTopPercent(bandIndex: number): number {
  return (bandIndex + 1) * SEGMENT_HEIGHT_PERCENT;
}

/**
 * Posição na pista alinhada às faixas de elo (marcos 0, 1000, 1300…).
 * Dentro de cada faixa, RR é interpolado linearmente entre rrMin e rrMax.
 */
export function rrToTrackPercent(rr: number, maxRrInLobby: number): number {
  const { band, index } = findTierBand(rr);
  const bandBottom = tierBandBottomPercent(index);
  const bandTop = tierBandTopPercent(index);
  const bandSpan = bandTop - bandBottom;

  const rrFloor = band.rrMin;
  let rrCeiling = band.rrMax;
  if (band.tierId === "diamante") {
    rrCeiling = Math.max(maxRrInLobby, band.rrMax, rr);
  }

  const span = Math.max(rrCeiling - rrFloor, 1);
  const t = clamp((rr - rrFloor) / span, 0, 1);
  return clampPercent(bandBottom + t * bandSpan);
}

function resolveCollisions(
  players: Array<{ id: string; rr: number }>,
  ideals: Map<string, number>,
  trackMin: number,
  trackMax: number,
  minGap: number,
): Map<string, number> {
  const positions = new Map<string, number>();
  const sorted = [...players].sort(
    (a, b) => ideals.get(a.id)! - ideals.get(b.id)! || a.rr - b.rr || a.id.localeCompare(b.id),
  );

  for (const player of sorted) {
    positions.set(player.id, ideals.get(player.id)!);
  }

  for (let pass = 0; pass < sorted.length; pass += 1) {
    let changed = false;

    for (let i = 0; i < sorted.length - 1; i += 1) {
      const lower = sorted[i]!;
      const higher = sorted[i + 1]!;
      const idealLow = ideals.get(lower.id)!;
      const idealHigh = ideals.get(higher.id)!;
      let posLow = positions.get(lower.id)!;
      let posHigh = positions.get(higher.id)!;

      if (posHigh - posLow >= minGap) continue;

      // RR muito próximos — mantém centro no marco de cada um (pode sobrepor levemente)
      if (idealHigh - idealLow < minGap) continue;

      posHigh = idealHigh;
      posLow = Math.min(idealLow, posHigh - minGap);
      posLow = Math.max(trackMin, posLow);

      if (posLow !== positions.get(lower.id)! || posHigh !== positions.get(higher.id)!) {
        positions.set(lower.id, posLow);
        positions.set(higher.id, posHigh);
        changed = true;
      }
    }

    if (!changed) break;
  }

  for (const player of sorted) {
    positions.set(
      player.id,
      clampPercent(clamp(positions.get(player.id)!, trackMin, trackMax)),
    );
  }

  return positions;
}

/** Centro a centro: altura do avatar + meio avatar de folga entre bordas. */
function minVerticalGapPercent(laneHeightPx: number): number {
  return ((RACE_AVATAR_RENDER_PX * 1.5) / laneHeightPx) * 100;
}

/**
 * Posiciona avatares na linha vertical, alinhados ao RR e com folga mínima entre eles.
 */
export function layoutRaceAvatars(
  players: Array<{ id: string; rr: number }>,
  laneHeightPx: number,
): RaceAvatarPlacement[] {
  if (players.length === 0) return [];

  const maxRr = Math.max(...players.map((p) => p.rr));
  const trackBottom = trackBottomPercent(laneHeightPx);
  const trackTop = trackTopPercent(laneHeightPx);
  const minGap = minVerticalGapPercent(laneHeightPx);

  const sorted = [...players].sort((a, b) => a.rr - b.rr || a.id.localeCompare(b.id));
  const ideals = new Map<string, number>();
  for (const player of sorted) {
    ideals.set(player.id, rrToTrackPercent(player.rr, maxRr));
  }

  const positions = resolveCollisions(sorted, ideals, trackBottom, trackTop, minGap);

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
  const minGapPx = RACE_AVATAR_RENDER_PX * 1.5;
  const neededLane = Math.ceil(count * minGapPx) + 200;
  return Math.min(
    Math.max(laneBase + neededLane + RACE_TRACK_LANE_INSET_PX + RACE_AVATAR_GLOW_PAD_PX * 2, 960),
    3200,
  );
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
