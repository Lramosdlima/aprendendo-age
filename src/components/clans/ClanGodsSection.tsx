import { useMemo, useState } from "react";

import { CLAN_INSIGNIA_ORDER, GodInsignias, type GodInsigniaKind } from "@/components/gods/GodInsigniaBadges";
import { useTranslation } from "@/hooks/useTranslation";
import type { ClanGodAggregate, ClanGodInsigniaId } from "@/lib/clanGodsApi";
import { computeClanGodInsigniaMap, formatClanPlayRate } from "@/lib/clanGodsApi";
import type { ClanTheme } from "@/lib/clanTheme";
import { cn } from "@/lib/cn";
import { getGodPortraitUrlBySlug } from "@/lib/godIconFromName";

function clanInsigniaLabelKey(id: GodInsigniaKind): string {
  switch (id) {
    case "mostPlayed":
      return "pages.clans.detail.godsInsigniaMostPlayed";
    case "favorite":
      return "pages.clans.detail.godsInsigniaFavorite";
    case "undefeated":
      return "pages.clans.detail.godsInsigniaUndefeated";
    case "highlight":
      return "pages.clans.detail.godsInsigniaHighlight";
  }
}

function clanInsigniaHintKey(id: GodInsigniaKind): string {
  switch (id) {
    case "mostPlayed":
      return "pages.clans.detail.godsInsigniaMostPlayedHint";
    case "favorite":
      return "pages.clans.detail.godsInsigniaFavoriteHint";
    case "undefeated":
      return "pages.clans.detail.godsInsigniaUndefeatedHint";
    case "highlight":
      return "pages.clans.detail.godsInsigniaHighlightHint";
  }
}

function GodPortrait({ slug, muted }: { slug: string; muted?: boolean }) {
  const src = getGodPortraitUrlBySlug(slug);
  return (
    <div
      className={cn(
        "relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-zinc-950/80 shadow-inner sm:h-24 sm:w-24",
        muted ? "border-zinc-700/60 opacity-50" : "border-zinc-600/50",
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" width={96} height={96} />
      ) : (
        <span className="text-xs text-zinc-600">?</span>
      )}
    </div>
  );
}

function ClanGodCard({
  god,
  theme,
  compact,
  insignias,
  t,
}: {
  god: ClanGodAggregate;
  theme: ClanTheme;
  compact?: boolean;
  insignias: ClanGodInsigniaId[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const muted = !god.hasData;

  return (
    <article
      className={cn(
        "relative flex flex-col items-center rounded-2xl border bg-zinc-950/55 text-center shadow-lg shadow-black/30 backdrop-blur-sm",
        theme.accentBorder,
        compact ? "px-3 py-4" : "px-4 py-5 sm:px-5 sm:py-6",
        muted && "opacity-70",
      )}
    >
      {!muted ? (
        <GodInsignias
          insignias={insignias}
          order={CLAN_INSIGNIA_ORDER}
          labelKey={clanInsigniaLabelKey}
          hintKey={clanInsigniaHintKey}
          t={t}
        />
      ) : null}

      <GodPortrait slug={god.slug} muted={muted} />
      <h3
        className={cn(
          "mt-3 font-[family-name:var(--font-display)] font-semibold text-zinc-100",
          compact ? "text-sm" : "text-base sm:text-lg",
        )}
      >
        {god.label}
      </h3>

      {muted ? (
        <p className="mt-2 text-xs text-zinc-500">{t("pages.clans.detail.godsNoGames")}</p>
      ) : (
        <div className={cn("mt-4 grid w-full grid-cols-2 gap-2", !compact && "sm:grid-cols-3")}>
          <div className={cn("rounded-xl border px-2 py-2", theme.statSurface)}>
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">
              {t("pages.clans.detail.godsStatPlayers")}
            </p>
            <p className={cn("mt-1 text-sm font-bold tabular-nums", theme.accentText)}>{god.playerCount}</p>
          </div>
          <div className={cn("rounded-xl border px-2 py-2", theme.statSurface)}>
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">
              {t("pages.clans.detail.godsStatGames")}
            </p>
            <p className="mt-1 text-sm font-bold tabular-nums text-zinc-100">{god.totalGames}</p>
          </div>
          <div className={cn("rounded-xl border px-2 py-2", theme.statSurface)}>
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">
              {t("pages.clans.detail.godsStatWr")}
            </p>
            <p className="mt-1 text-sm font-bold tabular-nums text-zinc-100">{god.avgWinRate}</p>
          </div>
          <div className={cn("rounded-xl border px-2 py-2", theme.statSurface)}>
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">RR</p>
            <p className={cn("mt-1 text-sm font-bold tabular-nums", theme.accentText)}>
              {god.avgElo ?? "—"}
            </p>
          </div>
          <div className={cn("col-span-2 rounded-xl border px-2 py-2 sm:col-span-1", theme.statSurface)}>
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">
              {t("pages.clans.detail.godsStatClanShare")}
            </p>
            <p className="mt-1 text-sm font-bold tabular-nums text-zinc-100">{formatClanPlayRate(god.clanPlayRate)}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function GodsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
    </svg>
  );
}

export function ClanGodsSection({
  gods,
  theme,
  loading,
}: {
  gods: ClanGodAggregate[];
  theme: ClanTheme;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const insigniaMap = useMemo(() => computeClanGodInsigniaMap(gods), [gods]);
  const topGods = gods.filter((g) => g.hasData).sort((a, b) => b.totalGames - a.totalGames).slice(0, 5);
  const hasAnyData = topGods.length > 0;

  return (
    <section>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-aom-border/50 bg-zinc-950/80 shadow-inner">
          <GodsIcon className={theme.sectionIcon} />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-100 sm:text-xl">
            {t("pages.clans.detail.godsTitle")}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">{t("pages.clans.detail.godsSubtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/40 py-12">
          <span
            className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-amber-500/25 border-t-amber-500"
            aria-hidden
          />
          <p className="mt-3 text-sm text-zinc-500">{t("pages.clans.detail.godsLoading")}</p>
        </div>
      ) : !hasAnyData ? (
        <p className="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/40 px-4 py-10 text-center text-sm text-zinc-500">
          {t("pages.clans.detail.godsEmpty")}
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            {t("pages.clans.detail.godsTopLabel")}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {topGods.map((god) => (
              <li key={god.slug}>
                <ClanGodCard
                  god={god}
                  theme={theme}
                  insignias={insigniaMap[god.slug] ?? []}
                  t={t}
                />
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-zinc-600">{t("pages.players.raceSnapshotHint")}</p>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className={cn(
                "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
                theme.badgeBg,
              )}
            >
              {showAll ? t("pages.clans.detail.godsHideAll") : t("pages.clans.detail.godsShowAll")}
            </button>
          </div>

          {showAll ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gods.map((god) => (
                <li key={god.slug}>
                  <ClanGodCard
                    god={god}
                    theme={theme}
                    compact
                    insignias={insigniaMap[god.slug] ?? []}
                    t={t}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}
