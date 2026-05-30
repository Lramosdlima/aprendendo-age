import type { RankTierId } from "@/lib/rankClassification";

/** RR máximo exibido no topo da pista (Diamante I+). */
export const RACE_TRACK_MAX_RR = 2100;

export const RACE_TRACK_MIN_RR = 0;

/** Altura de referência da pista (px) para calcular espaçamento mínimo. */
export const RACE_TRACK_REF_HEIGHT_PX = 640;

/** Largura útil entre centros de avatares na horizontal. */
export const RACE_AVATAR_SLOT_WIDTH_PX = 54;

/** Tamanho aproximado do avatar + margem (px). */
export const RACE_AVATAR_BOX_PX = 48 + 8;

/** Passos de ajuste vertical quando a faixa horizontal está cheia (preserva RR aproximado). */
const RACE_VERTICAL_NUDGE_STEPS = [0, 1.8, -1.8, 3.6, -3.6, 5.5, -5.5, 7.5, -7.5] as const;

export type RaceAvatarPlacement = {
  id: string;
  bottomPercent: number;
  offsetX: number;
  zIndex: number;
};

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

/** Agrupa jogadores por faixa de RR (degraus de 25) — legado / testes. */
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

/** Espalha índices simetricamente ao redor do centro da pista. */
export function horizontalSpreadIndex(index: number, total: number, slotWidth = RACE_AVATAR_SLOT_WIDTH_PX): number {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  return (index - center) * slotWidth;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function buildHorizontalOffsets(maxSlots: number): number[] {
  const offsets = [0];
  for (let lane = 1; offsets.length < maxSlots; lane += 1) {
    offsets.push(-lane * RACE_AVATAR_SLOT_WIDTH_PX);
    if (offsets.length < maxSlots) {
      offsets.push(lane * RACE_AVATAR_SLOT_WIDTH_PX);
    }
  }
  return offsets;
}

function collides(
  bottomPercent: number,
  offsetX: number,
  placed: Array<{ bottomPercent: number; offsetX: number }>,
): boolean {
  for (const other of placed) {
    const verticalPx = (Math.abs(other.bottomPercent - bottomPercent) / 100) * RACE_TRACK_REF_HEIGHT_PX;
    if (verticalPx >= RACE_AVATAR_BOX_PX) continue;

    const horizontalPx = Math.abs(other.offsetX - offsetX);
    if (horizontalPx < RACE_AVATAR_BOX_PX) {
      return true;
    }
  }
  return false;
}

function* candidatePlacements(targetPercent: number): Generator<{ bottomPercent: number; offsetX: number }> {
  const horizontalOffsets = buildHorizontalOffsets(16);

  for (const nudge of RACE_VERTICAL_NUDGE_STEPS) {
    const bottomPercent = clampPercent(targetPercent + nudge);
    for (const offsetX of horizontalOffsets) {
      yield { bottomPercent, offsetX };
    }
  }
}

/**
 * Posiciona avatares evitando sobreposição: prioriza o RR real, depois espalha
 * na horizontal e só então aplica um leve ajuste vertical.
 */
export function layoutRaceAvatars(players: Array<{ id: string; rr: number }>): RaceAvatarPlacement[] {
  if (players.length === 0) return [];

  const sorted = [...players].sort((a, b) => a.rr - b.rr || a.id.localeCompare(b.id));
  const placed: RaceAvatarPlacement[] = [];
  const occupied: Array<{ bottomPercent: number; offsetX: number }> = [];

  for (const player of sorted) {
    const targetPercent = rrToTrackPercent(player.rr);
    let chosen = { bottomPercent: targetPercent, offsetX: 0 };

    for (const candidate of candidatePlacements(targetPercent)) {
      if (!collides(candidate.bottomPercent, candidate.offsetX, occupied)) {
        chosen = candidate;
        break;
      }
    }

    occupied.push(chosen);
    placed.push({
      id: player.id,
      bottomPercent: chosen.bottomPercent,
      offsetX: chosen.offsetX,
      zIndex: 10 + Math.round(chosen.bottomPercent),
    });
  }

  return placed;
}

/** Altura mínima sugerida da pista conforme quantidade de jogadores. */
export function raceTrackMinHeightPx(playerCount: number): number {
  const base = 720;
  if (playerCount <= 8) return base;
  return Math.min(base + (playerCount - 8) * 36, 960);
}
