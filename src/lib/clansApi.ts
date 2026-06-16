import type { Clan } from "@/data/clans";
import { createSupabasePublicClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type { Clan } from "@/data/clans";

const CLAN_SELECT = "id, name, tag, logo_path";

function mapRow(row: {
  id: string;
  name: string;
  tag: string;
  logo_path: string | null;
}): Clan {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    logoPath: row.logo_path,
  };
}

/** Busca um clã pela sigla na rota (`caok` → tag `CaOK`). */
export async function fetchClanBySlug(slug: string): Promise<Clan | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabasePublicClient();
  if (!supabase) return null;

  const normalized = slug.trim();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("clans")
    .select(CLAN_SELECT)
    .ilike("tag", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapRow(data as Parameters<typeof mapRow>[0]);
}

/** Lista clãs cadastrados no Supabase. */
export async function fetchClans(): Promise<Clan[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("clans")
    .select(CLAN_SELECT)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => mapRow(row as Parameters<typeof mapRow>[0]));
}

export function matchClanIdByAomstatsTag(clans: Clan[], tag: string | null | undefined): string | null {
  const normalized = tag?.trim().toUpperCase();
  if (!normalized) return null;
  return clans.find((clan) => clan.tag.trim().toUpperCase() === normalized)?.id ?? null;
}

/** Resolve `clan_id` comparando a sigla do AoM Stats com `public.clans.tag`. */
export async function resolveClanIdByAomstatsTag(tag: string | null | undefined): Promise<string | null> {
  const normalized = tag?.trim();
  if (!normalized) return null;
  const clans = await fetchClans();
  return matchClanIdByAomstatsTag(clans, normalized);
}
