import { AOM_MAJOR_GOD_BY_SLUG, normalizeGodSlugFromApiName } from "@/data/aomGods";
import type { GodStatRow } from "@/lib/formRetoldApi";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileGodInsertRow = {
  profile_id: string;
  god_slug: string;
  god_name: string;
  elo: number;
  games: number;
  win_rate: string;
  play_rate: string;
  snapshot_at: string;
};

function parseElo(elo: unknown): number {
  const n = typeof elo === "number" ? elo : Number.parseInt(String(elo ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function parseGames(games: unknown): number {
  const n = typeof games === "number" ? games : Number.parseInt(String(games ?? ""), 10);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

export function buildProfileGodRows(
  profileId: string,
  gods: GodStatRow[],
  snapshotAt = new Date().toISOString(),
): ProfileGodInsertRow[] {
  const rows: ProfileGodInsertRow[] = [];
  const seen = new Set<string>();

  for (const row of gods) {
    const slug = normalizeGodSlugFromApiName(row.god);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    const canonical = AOM_MAJOR_GOD_BY_SLUG[slug];
    rows.push({
      profile_id: profileId,
      god_slug: slug,
      god_name: row.god?.trim() || canonical?.label || slug,
      elo: parseElo(row.elo),
      games: parseGames(row.games),
      win_rate: String(row.winRate ?? "0%").trim() || "0%",
      play_rate: String(row.playRate ?? "0%").trim() || "0%",
      snapshot_at: snapshotAt,
    });
  }

  return rows;
}

export async function upsertProfileGodsFromApi(
  supabase: SupabaseClient,
  profileId: string,
  gods: GodStatRow[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const rows = buildProfileGodRows(profileId, gods);

  const { error: deleteError } = await supabase.from("profile_gods").delete().eq("profile_id", profileId);
  if (deleteError) return { ok: false, message: deleteError.message };

  if (rows.length === 0) return { ok: true };

  const { error: insertError } = await supabase.from("profile_gods").insert(rows);
  if (insertError) return { ok: false, message: insertError.message };

  return { ok: true };
}

export async function deleteProfileGods(
  supabase: SupabaseClient,
  profileId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("profile_gods").delete().eq("profile_id", profileId);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
