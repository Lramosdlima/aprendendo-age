import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { CommunityVideoSubmitModal } from "@/components/community/CommunityVideoSubmitModal";
import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchApprovedCommunityVideos, type CommunityVideo } from "@/lib/communityVideosApi";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { localeAuthPath } from "@/lib/localeRoutes";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { truncateToTwoParagraphs } from "@/lib/truncateToTwoParagraphs";

export function CommunityVideosPage() {
  const { t, locale } = useTranslation();
  const { status } = useAuth();
  const { pathname, search } = useLocation();
  const linkState = listIndexLinkStateFromLocation(pathname, search);

  const supabaseConfigured = isSupabaseConfigured();
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const loadVideos = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApprovedCommunityVideos();
      setVideos(data);
    } catch {
      setError(t("pages.communityVideos.loadError"));
    } finally {
      setLoading(false);
    }
  }, [supabaseConfigured, t]);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  const isAuthenticated = status === "authenticated";

  const headerAction = isAuthenticated ? (
    <button
      type="button"
      onClick={() => setSubmitOpen(true)}
      className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
    >
      {t("pages.communityVideos.requestVideo")}
    </button>
  ) : (
    <Link
      to={`${localeAuthPath(locale, "login")}?next=${encodeURIComponent("/videos-comunidade")}`}
      className="rounded-xl border border-aom-border bg-zinc-900/80 px-4 py-2 text-sm font-medium text-amber-100/90 transition hover:border-amber-500/40 hover:bg-zinc-800/90"
    >
      {t("pages.communityVideos.loginToRequest")}
    </Link>
  );

  return (
    <div>
      <PageHeader
        title={t("pages.communityVideos.title")}
        description={t("pages.communityVideos.description")}
        actions={headerAction}
      />

      {loading ? (
        <p className="text-sm text-zinc-500">{t("pages.communityVideos.loading")}</p>
      ) : !supabaseConfigured ? (
        <p className="text-sm text-zinc-500">{t("pages.communityVideos.unconfigured")}</p>
      ) : error ? (
        <p className="rounded-xl border border-red-900/45 bg-red-950/35 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-zinc-500">{t("pages.communityVideos.empty")}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {videos.map((v) => (
            <li key={v.id}>
              <EntityCard
                to={`/videos-comunidade/${v.id}`}
                linkState={linkState}
                title={v.title}
                subtitle={truncateToTwoParagraphs(v.description)}
                subtitleTag={false}
                backgroundCoverSrc={v.thumbnailUrl ?? undefined}
                watermarkSrc={v.channelAvatarUrl ?? undefined}
              />
            </li>
          ))}
        </ul>
      )}

      <CommunityVideoSubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSuccess={() => void loadVideos()}
      />
    </div>
  );
}
