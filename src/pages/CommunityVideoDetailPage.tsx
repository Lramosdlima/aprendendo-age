import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

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
      {video.description ? (
        <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{video.description}</p>
      ) : null}
      <StartVideosSection title={video.title} urls={[video.videoUrl]} />
    </div>
  );
}
