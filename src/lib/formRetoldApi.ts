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

function statsUrl(playerName: string) {
  return `${FORM_RETOLD_ORIGIN}/api/stats/${encodeURIComponent(playerName.trim())}`;
}

function godsUrl(profileId: number) {
  return `${FORM_RETOLD_ORIGIN}/api/gods/${profileId}`;
}

export async function fetchPlayerStats(playerName: string): Promise<PlayerStatsResponse> {
  const res = await fetch(statsUrl(playerName));
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
