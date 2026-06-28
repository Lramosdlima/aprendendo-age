import { useEffect, useState } from "react";

import { ChannelGrid } from "@/components/channels/ChannelCard";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Channel } from "@/data/channels";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchStreamerChannels } from "@/lib/channelsApi";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function LinksStreamersPage() {
  const { t } = useTranslation();
  const supabaseConfigured = isSupabaseConfigured();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      setChannels([]);
      setError(null);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setError(t("pages.streamerLinks.loadTimeout"));
        setLoading(false);
      }
    }, 20_000);

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchStreamerChannels();
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setChannels(list);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setError(err instanceof Error ? err.message : t("pages.streamerLinks.loadError"));
        setChannels([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [supabaseConfigured, t]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader title={t("pages.streamerLinks.title")} description={t("pages.streamerLinks.description")} />

      <div className="overflow-hidden rounded-2xl border border-aom-border/60 bg-[#141414] shadow-lg shadow-black/40">
        <div className="border-b border-zinc-800/90 px-4 py-3 sm:px-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">{t("common.community")}</p>
          <p className="mt-1 text-sm text-zinc-400">{t("pages.streamerLinks.sectionDesc")}</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center px-4 py-16">
            <span
              className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500/25 border-t-amber-500"
              aria-hidden
            />
            <p className="mt-4 text-sm text-zinc-500">{t("pages.streamerLinks.loading")}</p>
          </div>
        ) : !supabaseConfigured ? (
          <p
            className="m-4 rounded-xl border border-amber-900/45 bg-amber-950/35 px-4 py-3 text-sm text-amber-100/90"
            role="status"
          >
            {t("pages.streamerLinks.unconfigured")}
          </p>
        ) : error ? (
          <p
            className="m-4 rounded-xl border border-red-900/45 bg-red-950/35 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : channels.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-zinc-500">{t("pages.streamerLinks.empty")}</p>
        ) : (
          <div className="p-4 sm:p-5">
            <ChannelGrid channels={channels} />
          </div>
        )}
      </div>
    </div>
  );
}
