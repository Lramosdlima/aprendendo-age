import type { Channel } from "@/data/channels";
import { parseTwitchLogin, parseYouTubeChannelHandle, parseYouTubeChannelId } from "@/lib/channelPlatform";

const CACHE_TTL_MS = 3 * 60 * 1000;
const CONCURRENCY = 5;

type CacheEntry<T> = { value: T; expiresAt: number };

const twitchLiveCache = new Map<string, CacheEntry<boolean>>();
const youtubeChannelCache = new Map<string, CacheEntry<{ channelId: string; uploadsPlaylistId: string }>>();

function getCached<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return null;
  }
  return entry.value;
}

function setCache<T>(map: Map<string, CacheEntry<T>>, key: string, value: T): void {
  map.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function getYouTubeApiKey(): string | null {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
  return key?.trim() || null;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]!);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** Resposta do decapi `/twitch/uptime/{login}` — ex.: "2 hours" ou "{login} is offline". */
export function parseTwitchUptimeResponse(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("offline")) return false;
  return /\d+\s*(second|minute|hour|day)s?/.test(normalized);
}

async function fetchTwitchLiveStatus(login: string): Promise<boolean> {
  const cached = getCached(twitchLiveCache, login);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(login)}`);
    if (!res.ok) {
      setCache(twitchLiveCache, login, false);
      return false;
    }
    const text = await res.text();
    const isLive = parseTwitchUptimeResponse(text);
    setCache(twitchLiveCache, login, isLive);
    return isLive;
  } catch {
    setCache(twitchLiveCache, login, false);
    return false;
  }
}

async function resolveYouTubeChannel(
  channel: Channel,
  apiKey: string,
): Promise<{ channelId: string; uploadsPlaylistId: string } | null> {
  const cached = getCached(youtubeChannelCache, channel.id);
  if (cached) return cached;

  const directId = parseYouTubeChannelId(channel.urlLink);
  if (directId) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(directId)}&key=${encodeURIComponent(apiKey)}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      items?: Array<{ id?: string; contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
    };
    const item = json.items?.[0];
    const uploads = item?.contentDetails?.relatedPlaylists?.uploads;
    if (!item?.id || !uploads) return null;
    const value = { channelId: item.id, uploadsPlaylistId: uploads };
    setCache(youtubeChannelCache, channel.id, value);
    return value;
  }

  const handle = parseYouTubeChannelHandle(channel.urlLink);
  if (!handle) return null;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(apiKey)}`,
  );
  if (!res.ok) return null;

  const json = (await res.json()) as {
    items?: Array<{ id?: string; contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
  };
  const item = json.items?.[0];
  const uploads = item?.contentDetails?.relatedPlaylists?.uploads;
  if (!item?.id || !uploads) return null;

  const value = { channelId: item.id, uploadsPlaylistId: uploads };
  setCache(youtubeChannelCache, channel.id, value);
  return value;
}

async function fetchYouTubeLiveStatus(channel: Channel, apiKey: string): Promise<boolean> {
  try {
    const resolved = await resolveYouTubeChannel(channel, apiKey);
    if (!resolved) return false;

    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(resolved.uploadsPlaylistId)}&maxResults=1&key=${encodeURIComponent(apiKey)}`,
    );
    if (!playlistRes.ok) return false;

    const playlistJson = (await playlistRes.json()) as {
      items?: Array<{ contentDetails?: { videoId?: string } }>;
    };
    const videoId = playlistJson.items?.[0]?.contentDetails?.videoId;
    if (!videoId) return false;

    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,snippet&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`,
    );
    if (!videoRes.ok) return false;

    const videoJson = (await videoRes.json()) as {
      items?: Array<{
        snippet?: { liveBroadcastContent?: string };
        liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string };
      }>;
    };
    const item = videoJson.items?.[0];
    if (!item) return false;

    return item.snippet?.liveBroadcastContent === "live";
  } catch {
    return false;
  }
}

async function checkChannelLive(channel: Channel, youtubeApiKey: string | null): Promise<boolean> {
  if (channel.category === "twitch") {
    const login = parseTwitchLogin(channel.urlLink);
    if (!login) return false;
    return fetchTwitchLiveStatus(login);
  }

  if (channel.category === "youtube") {
    if (!youtubeApiKey) return false;
    return fetchYouTubeLiveStatus(channel, youtubeApiKey);
  }

  return false;
}

/** Consulta status ao vivo para canais YouTube/Twitch (fail-open por canal). */
export async function fetchChannelLiveStatus(channels: Channel[]): Promise<Set<string>> {
  const streamChannels = channels.filter((c) => c.category === "youtube" || c.category === "twitch");
  if (streamChannels.length === 0) return new Set();

  const youtubeApiKey = getYouTubeApiKey();
  const liveFlags = await mapWithConcurrency(streamChannels, CONCURRENCY, async (channel) => ({
    id: channel.id,
    isLive: await checkChannelLive(channel, youtubeApiKey),
  }));

  const liveIds = new Set<string>();
  for (const { id, isLive } of liveFlags) {
    if (isLive) liveIds.add(id);
  }
  return liveIds;
}

/** Canais ao vivo primeiro; ordem relativa preservada dentro de cada grupo. */
export function sortChannelsLiveFirst(channels: Channel[], liveIds: Set<string>): Channel[] {
  if (liveIds.size === 0) return channels;

  const live: Channel[] = [];
  const offline: Channel[] = [];

  for (const channel of channels) {
    if (liveIds.has(channel.id)) live.push(channel);
    else offline.push(channel);
  }

  return [...live, ...offline];
}
