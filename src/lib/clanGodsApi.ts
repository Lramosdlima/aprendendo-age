import { AOM_MAJOR_GODS } from "@/data/aomGods";
import type { GodStatRow } from "@/lib/formRetoldApi";
import { createSupabasePublicClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ProfileGodRow = {
  profileId: string;
  godSlug: string;
  godName: string;
  elo: number;
  games: number;
  winRate: string;
  playRate: string;
};

export type PlayerGodAggregate = {
  slug: string;
  label: string;
  elo: number;
  games: number;
  winRate: string;
  playRate: string;
  hasData: boolean;
};

export type PlayerGodInsigniaId = "mostPlayed" | "undefeated" | "highlight";

export type PlayerGodInsigniaMap = Record<string, PlayerGodInsigniaId[]>;

export type ClanGodAggregate = {
  slug: string;
  label: string;
  playerCount: number;
  totalGames: number;
  clanPlayRate: number;
  avgElo: number | null;
  avgWinRate: string;
  hasData: boolean;
};

function parseWinRatePercent(raw: string): number {
  const n = Number.parseFloat(String(raw).replace("%", "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatWinRatePercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${value.toFixed(1)}%`;
}

function formatClanPlayRate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${value.toFixed(1)}%`;
}

export { formatClanPlayRate };

/** Converte agregado do perfil para o formato usado em `GodAchievementCard`. */
export function playerGodToStatRow(god: PlayerGodAggregate): GodStatRow {
  return {
    god: god.label,
    elo: god.elo,
    winRate: god.winRate,
    playRate: god.playRate,
    games: god.games,
  };
}

/** Deuses com partidas, ordenados por RR (depois por jogos). */
export function activePlayerGodsByRr(gods: PlayerGodAggregate[]): PlayerGodAggregate[] {
  return gods
    .filter((g) => g.hasData)
    .sort((a, b) => b.elo - a.elo || b.games - a.games);
}

/** Linhas de `profile_gods` de um perfil. */
export async function fetchProfileGods(profileId: string): Promise<ProfileGodRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profile_gods")
    .select("god_slug, god_name, elo, games, win_rate, play_rate, profile_id")
    .eq("profile_id", profileId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    profileId: String((row as { profile_id: string }).profile_id),
    godSlug: String((row as { god_slug: string }).god_slug),
    godName: String((row as { god_name: string }).god_name),
    elo: Number((row as { elo: number }).elo) || 0,
    games: Number((row as { games: number }).games) || 0,
    winRate: String((row as { win_rate: string }).win_rate),
    playRate: String((row as { play_rate: string }).play_rate),
  }));
}

/** Lista completa de deuses majores com stats do jogador (ou vazio). */
export function buildPlayerGods(rows: ProfileGodRow[]): PlayerGodAggregate[] {
  const bySlug = new Map<string, ProfileGodRow>();
  for (const row of rows) {
    bySlug.set(row.godSlug, row);
  }

  return AOM_MAJOR_GODS.map((god) => {
    const row = bySlug.get(god.slug);
    if (!row || row.games <= 0) {
      return {
        slug: god.slug,
        label: god.label,
        elo: 0,
        games: 0,
        winRate: "—",
        playRate: "—",
        hasData: false,
      };
    }

    return {
      slug: god.slug,
      label: row.godName?.trim() || god.label,
      elo: row.elo,
      games: row.games,
      winRate: row.winRate,
      playRate: row.playRate,
      hasData: true,
    };
  });
}

/** Insígnias do jogador por deus (empates recebem a mesma medalha). */
export function computePlayerGodInsigniaMap(gods: PlayerGodAggregate[]): PlayerGodInsigniaMap {
  const map: PlayerGodInsigniaMap = {};
  const active = gods.filter((g) => g.hasData);
  if (active.length === 0) return map;

  const add = (slug: string, id: PlayerGodInsigniaId) => {
    map[slug] = map[slug] ?? [];
    if (!map[slug].includes(id)) map[slug].push(id);
  };

  const maxSlugs = (value: (g: PlayerGodAggregate) => number, minValue = 0): Set<string> => {
    let best = minValue;
    for (const g of active) best = Math.max(best, value(g));
    if (best <= minValue) return new Set();
    return new Set(active.filter((g) => value(g) === best).map((g) => g.slug));
  };

  for (const slug of maxSlugs((g) => g.games)) add(slug, "mostPlayed");
  for (const slug of maxSlugs((g) => parseWinRatePercent(g.winRate))) add(slug, "undefeated");
  for (const slug of maxSlugs((g) => g.elo)) add(slug, "highlight");

  return map;
}

/** Linhas de `profile_gods` dos membros de um clã. */
export async function fetchClanProfileGods(clanId: string): Promise<ProfileGodRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profile_gods")
    .select(
      "god_slug, god_name, elo, games, win_rate, play_rate, profile_id, profiles!inner(clan_id, aomstats_rr, aomstats_id)",
    )
    .eq("profiles.clan_id", clanId)
    .not("profiles.aomstats_rr", "is", null)
    .not("profiles.aomstats_id", "is", null);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    profileId: String((row as { profile_id: string }).profile_id),
    godSlug: String((row as { god_slug: string }).god_slug),
    godName: String((row as { god_name: string }).god_name),
    elo: Number((row as { elo: number }).elo) || 0,
    games: Number((row as { games: number }).games) || 0,
    winRate: String((row as { win_rate: string }).win_rate),
    playRate: String((row as { play_rate: string }).play_rate),
  }));
}

/** Agrega stats por deus major — sempre retorna uma entrada por deus canônico. */
export function aggregateClanGods(rows: ProfileGodRow[]): ClanGodAggregate[] {
  type Acc = {
    players: Set<string>;
    totalGames: number;
    weightedElo: number;
    weightedWr: number;
  };

  const bySlug = new Map<string, Acc>();
  let clanTotalGames = 0;

  for (const row of rows) {
    clanTotalGames += row.games;
    const acc = bySlug.get(row.godSlug) ?? { players: new Set(), totalGames: 0, weightedElo: 0, weightedWr: 0 };
    acc.players.add(row.profileId);
    acc.totalGames += row.games;
    acc.weightedElo += row.elo * row.games;
    acc.weightedWr += parseWinRatePercent(row.winRate) * row.games;
    bySlug.set(row.godSlug, acc);
  }

  return AOM_MAJOR_GODS.map((god) => {
    const acc = bySlug.get(god.slug);
    if (!acc || acc.totalGames === 0) {
      return {
        slug: god.slug,
        label: god.label,
        playerCount: 0,
        totalGames: 0,
        clanPlayRate: 0,
        avgElo: null,
        avgWinRate: "—",
        hasData: false,
      };
    }

    const avgElo = Math.round(acc.weightedElo / acc.totalGames);
    const avgWr = acc.weightedWr / acc.totalGames;
    const clanPlayRate = clanTotalGames > 0 ? (acc.totalGames / clanTotalGames) * 100 : 0;

    return {
      slug: god.slug,
      label: god.label,
      playerCount: acc.players.size,
      totalGames: acc.totalGames,
      clanPlayRate,
      avgElo,
      avgWinRate: formatWinRatePercent(avgWr),
      hasData: true,
    };
  });
}

export type ClanGodInsigniaId = "mostPlayed" | "favorite" | "undefeated" | "highlight";

export type ClanGodInsigniaMap = Record<string, ClanGodInsigniaId[]>;

function maxMetricSlugs(
  gods: ClanGodAggregate[],
  value: (g: ClanGodAggregate) => number,
  minValue = 0,
): Set<string> {
  const active = gods.filter((g) => g.hasData);
  if (active.length === 0) return new Set();

  let best = minValue;
  for (const g of active) {
    best = Math.max(best, value(g));
  }
  if (best <= minValue) return new Set();

  return new Set(active.filter((g) => value(g) === best).map((g) => g.slug));
}

/** Insígnias do clã por deus (empates recebem a mesma medalha). */
export function computeClanGodInsigniaMap(gods: ClanGodAggregate[]): ClanGodInsigniaMap {
  const map: ClanGodInsigniaMap = {};

  const add = (slug: string, id: ClanGodInsigniaId) => {
    map[slug] = map[slug] ?? [];
    if (!map[slug].includes(id)) map[slug].push(id);
  };

  for (const slug of maxMetricSlugs(gods, (g) => g.totalGames)) add(slug, "mostPlayed");
  for (const slug of maxMetricSlugs(gods, (g) => g.playerCount)) add(slug, "favorite");
  for (const slug of maxMetricSlugs(gods, (g) => parseWinRatePercent(g.avgWinRate))) add(slug, "undefeated");
  for (const slug of maxMetricSlugs(gods, (g) => g.avgElo ?? 0)) add(slug, "highlight");

  return map;
}

export function sortClanGodsByActivity(gods: ClanGodAggregate[]): ClanGodAggregate[] {
  return [...gods].sort((a, b) => {
    if (b.totalGames !== a.totalGames) return b.totalGames - a.totalGames;
    return b.clanPlayRate - a.clanPlayRate;
  });
}

export function topClanGods(gods: ClanGodAggregate[], limit = 5): ClanGodAggregate[] {
  return sortClanGodsByActivity(gods.filter((g) => g.hasData)).slice(0, limit);
}
