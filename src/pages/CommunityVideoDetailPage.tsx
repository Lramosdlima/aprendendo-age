import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { CommunityVideoTagBadge } from "@/components/community/CommunityVideoTagBadge";
import { StartVideosSection } from "@/components/starts/StartVideosSection";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchCommunityVideoById, type CommunityVideo } from "@/lib/communityVideosApi";
import { listIndexBackLinkLabel, listIndexReturnTo } from "@/lib/listIndexReturnState";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function CommunityVideoDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { state: navState } = useLocation();
  const backToList = listIndexReturnTo("/videos-comunidade", navState);
  const backLabel = listIndexBackLinkLabel(backToList, t("pages.communityVideos.backLink"));

  const [video, setVideo] = useState<CommunityVideo | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !isSupabaseConfigured()) {
      setVideo(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      setError(null);
      try {
        const data = await fetchCommunityVideoById(id);
        if (!cancelled) setVideo(data);
      } catch {
        if (!cancelled) {
          setError(t("pages.communityVideos.loadError"));
          setVideo(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  if (video === undefined) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-sm text-zinc-500">{t("pages.communityVideos.loading")}</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">{error ?? t("pages.communityVideos.notFound")}</p>
      </div>
    );
  }

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader title={video.title} />
      {video.tags.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <CommunityVideoTagBadge key={tag.id} tag={tag} size="sm" />
          ))}
        </div>
      ) : null}
      {video.channelName || video.channelAvatarUrl ? (
        <div className="mb-4 flex items-center gap-2.5">
          {video.channelAvatarUrl ? (
            <img
              src={video.channelAvatarUrl}
              alt=""
              className="size-9 shrink-0 rounded-full border border-zinc-700/80 bg-zinc-900 object-cover"
            />
          ) : null}
          {video.channelName ? (
            <p className="text-sm font-medium text-zinc-300">
              <span className="text-zinc-500">{t("pages.communityVideos.channelLabel")}: </span>
              {video.channelName}
            </p>
          ) : null}
        </div>
      ) : null}
      {video.description ? (
        <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{video.description}</p>
      ) : null}
      <StartVideosSection
        title={video.title}
        urls={[video.videoUrl]}
        sectionHeading={t("pages.communityVideos.videoSection")}
      />
    </div>
  );
}
