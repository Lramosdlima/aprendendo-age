import type { Channel } from "@/data/channels";
import { normalizeChannelCategory } from "@/lib/channelCategory";
import { createSupabaseClient, createSupabasePublicClient } from "@/lib/supabase/client";
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

export type ChannelCreatePayload = {
  name: string;
  urlLink: string;
  category: Channel["category"];
  imagePath?: string;
  insertAfterId: "__first__" | "__last__" | string;
};

export type ChannelCreateErrorCode =
  | "SUPABASE_NOT_CONFIGURED"
  | "NOT_AUTHENTICATED"
  | "INSERT_ERROR"
  | "SHIFT_ERROR";

function computeSortOrder(
  insertAfterId: ChannelCreatePayload["insertAfterId"],
  channels: Channel[],
): number {
  if (insertAfterId === "__first__") return 0;
  if (insertAfterId === "__last__") {
    if (channels.length === 0) return 0;
    return Math.max(...channels.map((c) => c.sortOrder)) + 1;
  }
  const after = channels.find((c) => c.id === insertAfterId);
  if (!after) {
    if (channels.length === 0) return 0;
    return Math.max(...channels.map((c) => c.sortOrder)) + 1;
  }
  return after.sortOrder + 1;
}

/** Cadastra canal geral (`clan_id` nulo); requer admin (RLS). */
export async function createStreamerChannel(
  payload: ChannelCreatePayload,
): Promise<{ ok: true; id: string } | { ok: false; message: ChannelCreateErrorCode | string }> {
  const supabase = createSupabaseClient();
  if (!supabase) return { ok: false, message: "SUPABASE_NOT_CONFIGURED" };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return { ok: false, message: userError.message };
  if (!user) return { ok: false, message: "NOT_AUTHENTICATED" };

  const existing = await fetchStreamerChannels();
  const sortOrder = computeSortOrder(payload.insertAfterId, existing);
  const needsShift = payload.insertAfterId !== "__last__";

  if (needsShift) {
    const { data: toShift, error: listError } = await supabase
      .from("channels")
      .select("id, sort_order")
      .is("clan_id", null)
      .gte("sort_order", sortOrder)
      .order("sort_order", { ascending: false });

    if (listError) return { ok: false, message: "SHIFT_ERROR" };

    for (const row of toShift ?? []) {
      const { error: shiftError } = await supabase
        .from("channels")
        .update({ sort_order: (row.sort_order as number) + 1 })
        .eq("id", row.id as string);
      if (shiftError) return { ok: false, message: "SHIFT_ERROR" };
    }
  }

  const { data, error } = await supabase
    .from("channels")
    .insert({
      name: payload.name.trim(),
      url_link: payload.urlLink.trim(),
      category: payload.category,
      image_path: payload.imagePath?.trim() || null,
      sort_order: sortOrder,
      clan_id: null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: "INSERT_ERROR" };

  return { ok: true, id: data.id as string };
}
