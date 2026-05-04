const FORM_RETOLD_ORIGIN = import.meta.env.VITE_FORM_RETOLD_ORIGIN ?? "https://form-retold.vercel.app";

export type ProfileStatRow = {
  mode: string;
  rank: string;
  elo: string;
  winRate: string;
  wins: number;
  losses: number;
};

export type PlayerStatsResponse = {
  profileId: number;
  profileName: string;
  profileUrl: string;
  country: string;
  playerAvatarUrl: string | null;
  clanTag: string | null;
  profileStats: ProfileStatRow[];
  funStats?: {
    clan_name?: string;
  };
};

export type GodStatRow = {
  god: string;
  elo: number;
  winRate: string;
  playRate: string;
  games: number;
};

/** Linha devolvida por `GET /api/search-players/:name` (subset do AoM Stats). */
export type AomStatsSearchProfileRow = {
  profile_id: number;
  alias: string;
  country: string | null;
  avatar_link: string | null;
  clan_name?: string | null;
};

export class AmbiguousPlayerError extends Error {
  readonly profiles: AomStatsSearchProfileRow[];

  constructor(profiles: AomStatsSearchProfileRow[]) {
    super("Vários jogadores encontrados para essa pesquisa.");
    this.name = "AmbiguousPlayerError";
    this.profiles = profiles;
  }
}

function statsUrl(playerName: string) {
  return `${FORM_RETOLD_ORIGIN}/api/stats/${encodeURIComponent(playerName.trim())}`;
}

function statsByIdUrl(profileId: number) {
  return `${FORM_RETOLD_ORIGIN}/api/stats-by-id/${profileId}`;
}

function searchPlayersUrl(playerName: string) {
  return `${FORM_RETOLD_ORIGIN}/api/search-players/${encodeURIComponent(playerName.trim())}`;
}

function godsUrl(profileId: number) {
  return `${FORM_RETOLD_ORIGIN}/api/gods/${profileId}`;
}

export async function searchPlayersByName(playerName: string): Promise<AomStatsSearchProfileRow[]> {
  const res = await fetch(searchPlayersUrl(playerName));
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Não foi possível pesquisar jogadores (${res.status}).`;
    throw new Error(msg);
  }
  if (body && typeof body === "object" && "profiles" in body && Array.isArray((body as { profiles: unknown }).profiles)) {
    return (body as { profiles: AomStatsSearchProfileRow[] }).profiles;
  }
  return [];
}

export async function fetchPlayerStatsByProfileId(profileId: number): Promise<PlayerStatsResponse> {
  const res = await fetch(statsByIdUrl(profileId));
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Não foi possível carregar o jogador (${res.status}).`;
    throw new Error(msg);
  }
  return body as PlayerStatsResponse;
}

export async function fetchPlayerStats(playerName: string): Promise<PlayerStatsResponse> {
  const res = await fetch(statsUrl(playerName));
  const body: unknown = await res.json().catch(() => null);
  if (res.status === 409 && body && typeof body === "object" && "profiles" in body) {
    const raw = (body as { profiles: unknown }).profiles;
    if (Array.isArray(raw)) {
      throw new AmbiguousPlayerError(raw as AomStatsSearchProfileRow[]);
    }
  }
  if (!res.ok) {
    const msg =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Não foi possível carregar o jogador (${res.status}).`;
    throw new Error(msg);
  }
  return body as PlayerStatsResponse;
}

export async function fetchGodStats(profileId: number): Promise<GodStatRow[]> {
  const res = await fetch(godsUrl(profileId));
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    return [];
  }
  if (Array.isArray(body)) {
    return body as GodStatRow[];
  }
  if (body && typeof body === "object" && "majorGodsStats" in body && Array.isArray((body as { majorGodsStats: unknown }).majorGodsStats)) {
    return (body as { majorGodsStats: GodStatRow[] }).majorGodsStats;
  }
  return [];
}

/** Entrada de Sup 1v1 (mesma lógica do form-retold). */
export function pickSup1v1Row(stats: ProfileStatRow[] | undefined): ProfileStatRow | undefined {
  if (!stats?.length) return undefined;
  return stats.find((s) => /sup\s*1v1/i.test(s.mode)) ?? stats[0];
}

export function parseElo(elo: string | undefined): number | undefined {
  if (elo == null || elo === "") return undefined;
  const n = Number.parseInt(String(elo), 10);
  return Number.isFinite(n) ? n : undefined;
}
