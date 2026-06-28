/** Categorias de canal em `public.channels.category`. */
export type ChannelCategory = "discord" | "instagram" | "youtube" | "twitch" | "site";

export const CHANNEL_CATEGORIES: readonly ChannelCategory[] = [
  "discord",
  "instagram",
  "youtube",
  "twitch",
  "site",
] as const;

/** Canal cadastrado no Supabase (`public.channels`). */
export type Channel = {
  id: string;
  name: string;
  urlLink: string;
  category: ChannelCategory;
  imagePath: string | null;
  clanId: string | null;
  sortOrder: number;
};
