import { useEffect, useState } from "react";

import { CorridaAomTab } from "@/components/jogadores/CorridaAomTab";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { fetchAomRacePlayers, type AomRacePlayer } from "@/lib/playersApi";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

type PlayersTabId = "corrida";

export function JogadoresAomPage() {
  const { t } = useTranslation();
  const headerIcon = getTokenAssetUrl("aomr_wonder_age_icon");
  const supabaseConfigured = isSupabaseConfigured();

  const [activeTab, setActiveTab] = useState<PlayersTabId>("corrida");
  const [players, setPlayers] = useState<AomRacePlayer[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      setPlayers([]);
      setError(null);
      return;
    }

    let cancelled = false;
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      if (!cancelled) {
        setError(t("pages.players.loadTimeout"));
        setLoading(false);
      }
    }, 20_000);

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchAomRacePlayers();
        if (cancelled || timedOut) return;
        setPlayers(list);
      } catch (err) {
        if (cancelled || timedOut) return;
        setError(err instanceof Error ? err.message : t("pages.players.loadError"));
        setPlayers([]);
      } finally {
        if (!cancelled && !timedOut) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [supabaseConfigured, t]);

  const tabs: { id: PlayersTabId; labelKey: string }[] = [{ id: "corrida", labelKey: "pages.players.tabCorrida" }];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={t("pages.players.pageTitle")}
        headerIconSrc={headerIcon}
        description={t("pages.players.pageDescription")}
      />

      <div
        role="tablist"
        aria-label={t("pages.players.tabsLabel")}
        className="flex flex-wrap gap-2 border-b border-aom-border/60 pb-3"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35"
                  : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200",
              )}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-aom-border/50 bg-zinc-950/60 py-16">
          <span
            className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500/25 border-t-amber-500"
            aria-hidden
          />
          <p className="mt-4 text-sm text-zinc-500">{t("pages.players.loading")}</p>
        </div>
      ) : !supabaseConfigured ? (
        <p className="rounded-xl border border-amber-900/45 bg-amber-950/35 px-4 py-3 text-sm text-amber-100/90" role="status">
          {t("pages.players.unconfigured")}
        </p>
      ) : error ? (
        <p className="rounded-xl border border-red-900/45 bg-red-950/35 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : activeTab === "corrida" ? (
        <CorridaAomTab players={players} />
      ) : null}
    </div>
  );
}
