import type { Clan } from "@/data/clans";

/** URL pública do logo do clã (`logo_path` no Supabase). */
export function getClanLogoUrl(clan: Pick<Clan, "logoPath">): string | undefined {
  const path = clan.logoPath?.trim();
  return path || undefined;
}
