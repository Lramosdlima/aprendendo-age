import { useMemo, useState } from "react";

import { useTranslation } from "@/hooks/useTranslation";
import type { ClanGodAggregate, ClanGodInsigniaId } from "@/lib/clanGodsApi";
import { computeClanGodInsigniaMap, formatClanPlayRate } from "@/lib/clanGodsApi";
import type { ClanTheme } from "@/lib/clanTheme";
import { cn } from "@/lib/cn";
import { getGodPortraitUrlBySlug } from "@/lib/godIconFromName";

const INSIGNIA_ORDER: ClanGodInsigniaId[] = ["mostPlayed", "favorite", "undefeated", "highlight"];

const INSIGNIA_STYLE: Record<
  ClanGodInsigniaId,
  { ring: string; glow: string; icon: string; medal: string }
> = {
  mostPlayed: {
    ring: "ring-amber-400/55",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.35)]",
    icon: "text-amber-200",
    medal: "from-amber-950/90 via-amber-900/40 to-zinc-950/95 border-amber-500/45",
  },
  favorite: {
    ring: "ring-rose-400/55",
    glow: "shadow-[0_0_12px_rgba(251,113,133,0.35)]",
    icon: "text-rose-200",
    medal: "from-rose-950/90 via-rose-900/35 to-zinc-950/95 border-rose-500/45",
  },
  undefeated: {
    ring: "ring-orange-400/55",
    glow: "shadow-[0_0_12px_rgba(251,146,60,0.38)]",
    icon: "text-orange-200",
    medal: "from-orange-950/90 via-orange-900/35 to-zinc-950/95 border-orange-500/45",
  },
  highlight: {
    ring: "ring-sky-400/55",
    glow: "shadow-[0_0_12px_rgba(56,189,248,0.35)]",
    icon: "text-sky-200",
    medal: "from-sky-950/90 via-sky-900/35 to-zinc-950/95 border-sky-500/45",
  },
};

function InsigniaStarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.5l2.35 4.76 5.25.77-3.8 3.7.9 5.24L12 14.9l-4.7 2.47.9-5.24-3.8-3.7 5.25-.77L12 2.5z" />
    </svg>
  );
}

function InsigniaHeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 21s-7.5-4.7-9.9-9.1C-.1 8.2 1.6 4.6 5.1 3.4c2.1-.7 4.3.1 5.7 1.8 1.4-1.7 3.6-2.5 5.7-1.8 3.5 1.2 5.2 4.8 3 8.5C19.5 16.3 12 21 12 21z" />
    </svg>
  );
}

function InsigniaFireIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2c1.2 3.1-.4 5.2-1.6 7.2-.9 1.5-1.7 2.9-1.4 4.8.4 2.5 2.4 4.5 5 4.5 3.3 0 6-2.7 6-6.1 0-4.8-3.5-8.8-8-12.4zM8.5 20.5c-2.8-1.6-3.5-4.8-1.8-7.4.6-.9 1.2-1.7 1.8-2.6.3 2.1 1.4 3.8 2.8 5.5-1.1.9-2 2-2.8 3.2-.5.8-.2 1.9.7 1.3z" />
    </svg>
  );
}

function InsigniaMuscleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9 4.5c-.8 1.6-.3 3.5 1 4.8L7.2 12l-2.5-1.2c-1-.5-2.2.2-2.4 1.3l-.6 3.4c-.2 1.2.8 2.3 2 2.3h3.1l1.2 3.6c.3.9 1.2 1.4 2.1 1.1l2.9-.9c.9-.3 1.4-1.2 1.1-2.1l-1.2-3.6h2.4c1.2 0 2.2-1.1 2-2.3l-.6-3.4c-.2-1.1-1.4-1.8-2.4-1.3L16.8 12l-2.8-2.7c1.3-1.3 1.8-3.2 1-4.8-.6-1.2-2.2-1.5-3.2-.6l-1.3 1.1-1.3-1.1c-1-.9-2.6-.6-3.2.6z" />
    </svg>
  );
}

function InsigniaIcon({ id, className }: { id: ClanGodInsigniaId; className?: string }) {
  switch (id) {
    case "mostPlayed":
      return <InsigniaStarIcon className={className} />;
    case "favorite":
      return <InsigniaHeartIcon className={className} />;
    case "undefeated":
      return <InsigniaFireIcon className={className} />;
    case "highlight":
      return <InsigniaMuscleIcon className={className} />;
  }
}

function insigniaLabelKey(id: ClanGodInsigniaId): string {
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

function insigniaHintKey(id: ClanGodInsigniaId): string {
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

function GodInsigniaBadge({
  id,
  t,
}: {
  id: ClanGodInsigniaId;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const [open, setOpen] = useState(false);
  const style = INSIGNIA_STYLE[id];
  const label = t(insigniaLabelKey(id));
  const hint = t(insigniaHintKey(id));

  return (
    <div className="group/insignia relative">
      <button
        type="button"
        aria-label={`${label}: ${hint}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border bg-gradient-to-br shadow-inner ring-2 ring-inset transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
          style.medal,
          style.ring,
          style.glow,
        )}
      >
        <InsigniaIcon id={id} className={cn("h-4 w-4 drop-shadow-sm", style.icon)} />
      </button>

      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-zinc-700/80 bg-zinc-950/95 px-3 py-2 text-left shadow-xl shadow-black/50 backdrop-blur-sm",
          "opacity-0 transition duration-150",
          "group-hover/insignia:opacity-100 group-focus-within/insignia:opacity-100",
          open && "opacity-100",
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100/95">{label}</p>
        <p className="mt-1 text-[10px] leading-snug text-zinc-400">{hint}</p>
      </div>
    </div>
  );
}

function GodInsignias({
  insignias,
  t,
}: {
  insignias: ClanGodInsigniaId[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (insignias.length === 0) return null;

  const ordered = INSIGNIA_ORDER.filter((id) => insignias.includes(id));

  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5 sm:right-3 sm:top-3">
      {ordered.map((id) => (
        <GodInsigniaBadge key={id} id={id} t={t} />
      ))}
    </div>
  );
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
      {!muted ? <GodInsignias insignias={insignias} t={t} /> : null}

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
