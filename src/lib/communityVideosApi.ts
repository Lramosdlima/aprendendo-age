import { createSupabaseClient, createSupabasePublicClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { extractYouTubeVideoId } from "@/lib/youtubeEmbed";

export type CommunityVideo = {
  id: string;
  videoUrl: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  channelAvatarUrl: string | null;
  status: "pending" | "approved";
  submittedBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommunityVideoSubmitPayload = {
  videoUrl: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  channelAvatarUrl?: string;
};

export type CommunityVideoDuplicateCheck = {
  urlExists: boolean;
  titleExists: boolean;
};

export type CommunityVideoSubmitErrorCode =
  | "SUPABASE_NOT_CONFIGURED"
  | "NOT_AUTHENTICATED"
  | "DUPLICATE_URL"
  | "DUPLICATE_TITLE"
  | "DUPLICATE_BOTH"
  | "SUBMIT_ERROR";

const SELECT_COLUMNS =
  "id, video_url, title, description, thumbnail_url, channel_avatar_url, status, submitted_by, approved_by, created_at, updated_at";

function mapRow(row: {
  id: string;
  video_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  channel_avatar_url: string | null;
  status: "pending" | "approved";
  submitted_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}): CommunityVideo {
  return {
    id: row.id,
    videoUrl: row.video_url,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    channelAvatarUrl: row.channel_avatar_url,
    status: row.status,
    submittedBy: row.submitted_by,
    approvedBy: row.approved_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Lista vídeos aprovados para a página pública. */
export async function fetchApprovedCommunityVideos(): Promise<CommunityVideo[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_videos")
    .select(SELECT_COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Parameters<typeof mapRow>[0]));
}

/** Detalhe por id (RLS: aprovado, próprio pendente ou admin). */
export async function fetchCommunityVideoById(id: string): Promise<CommunityVideo | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("community_videos").select(SELECT_COLUMNS).eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Parameters<typeof mapRow>[0]);
}

/** Verifica duplicata por YouTube ID ou título (inclui pendentes de outros usuários). */
export async function checkCommunityVideoDuplicate(
  videoUrl: string,
  title: string,
): Promise<CommunityVideoDuplicateCheck | { ok: false; message: CommunityVideoSubmitErrorCode }> {
  const supabase = createSupabaseClient();
  if (!supabase) return { ok: false, message: "SUPABASE_NOT_CONFIGURED" };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, message: "NOT_AUTHENTICATED" };

  const youtubeVideoId = extractYouTubeVideoId(videoUrl);
  const { data, error } = await supabase.rpc("community_video_duplicate_check", {
    p_youtube_video_id: youtubeVideoId,
    p_title: title.trim(),
  });

  if (error) throw new Error(error.message);

  const row = data as { url_exists?: boolean; title_exists?: boolean } | null;
  return {
    urlExists: Boolean(row?.url_exists),
    titleExists: Boolean(row?.title_exists),
  };
}

function duplicateErrorCode(check: CommunityVideoDuplicateCheck): CommunityVideoSubmitErrorCode | null {
  if (check.urlExists && check.titleExists) return "DUPLICATE_BOTH";
  if (check.urlExists) return "DUPLICATE_URL";
  if (check.titleExists) return "DUPLICATE_TITLE";
  return null;
}

function isUniqueViolation(message: string): boolean {
  return message.includes("duplicate key") || message.includes("unique constraint");
}

/** Envia solicitação (status pending); requer sessão autenticada. */
export async function submitCommunityVideo(
  payload: CommunityVideoSubmitPayload,
): Promise<
  { ok: true; id: string } | { ok: false; message: CommunityVideoSubmitErrorCode | string }
> {
  const supabase = createSupabaseClient();
  if (!supabase) return { ok: false, message: "SUPABASE_NOT_CONFIGURED" };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return { ok: false, message: userError.message };
  if (!user) return { ok: false, message: "NOT_AUTHENTICATED" };

  const youtubeVideoId = extractYouTubeVideoId(payload.videoUrl);
  if (!youtubeVideoId) return { ok: false, message: "SUBMIT_ERROR" };

  const duplicate = await checkCommunityVideoDuplicate(payload.videoUrl, payload.title);
  if ("ok" in duplicate) {
    return { ok: false, message: duplicate.message };
  }
  const dupCode = duplicateErrorCode(duplicate);
  if (dupCode) return { ok: false, message: dupCode };

  const { data, error } = await supabase
    .from("community_videos")
    .insert({
      video_url: payload.videoUrl.trim(),
      youtube_video_id: youtubeVideoId,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      thumbnail_url: payload.thumbnailUrl?.trim() || null,
      channel_avatar_url: payload.channelAvatarUrl?.trim() || null,
      status: "pending",
      submitted_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (isUniqueViolation(error.message)) return { ok: false, message: "DUPLICATE_BOTH" };
    return { ok: false, message: "SUBMIT_ERROR" };
  }
  return { ok: true, id: data.id as string };
}
