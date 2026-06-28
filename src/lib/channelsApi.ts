import type { Channel } from "@/data/channels";
import { normalizeChannelCategory } from "@/lib/channelCategory";
import { createSupabasePublicClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type { Channel, ChannelCategory } from "@/data/channels";

const CHANNEL_SELECT = "id, name, url_link, category, image_path, clan_id, sort_order";

function mapRow(row: {
  id: string;
  name: string;
  url_link: string;
  category: string;
  image_path: string | null;
  clan_id: string | null;
  sort_order: number;
}): Channel {
  return {
    id: row.id,
    name: row.name,
    urlLink: row.url_link,
    category: normalizeChannelCategory(row.category),
    imagePath: row.image_path?.trim() || null,
    clanId: row.clan_id,
    sortOrder: row.sort_order,
  };
}

/** Canais gerais da comunidade (página Links Streamers). */
export async function fetchStreamerChannels(): Promise<Channel[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("channels")
    .select(CHANNEL_SELECT)
    .is("clan_id", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => mapRow(row as Parameters<typeof mapRow>[0]));
}

/** Canais vinculados a um clã (`channels.clan_id`). */
export async function fetchClanChannels(clanId: string): Promise<Channel[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("channels")
    .select(CHANNEL_SELECT)
    .eq("clan_id", clanId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => mapRow(row as Parameters<typeof mapRow>[0]));
}

export function channelImageUrl(channel: Pick<Channel, "imagePath">): string | undefined {
  const path = channel.imagePath?.trim();
  return path || undefined;
}
