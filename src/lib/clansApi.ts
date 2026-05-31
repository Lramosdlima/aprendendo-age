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
