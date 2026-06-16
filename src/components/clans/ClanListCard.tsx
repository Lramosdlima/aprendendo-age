import { Link } from "react-router-dom";

import { ClanLogo } from "@/components/clans/ClanLogo";
import type { Clan } from "@/data/clans";
import { useTranslation } from "@/hooks/useTranslation";
import { getClanLogoUrl } from "@/lib/clanAssetUrl";
import { clanSlugFromTag } from "@/lib/clanSlug";
import { getClanTheme } from "@/lib/clanTheme";
import { cn } from "@/lib/cn";

type ClanListCardProps = {
  clan: Clan;
};

export function ClanListCard({ clan }: ClanListCardProps) {
  const { t } = useTranslation();
  const slug = clanSlugFromTag(clan.tag);
  const theme = getClanTheme(slug);
  const logoSrc = getClanLogoUrl(clan);

  return (
    <Link
      to={`/clans/${slug}`}
      className={cn(
        "group relative isolate flex min-h-[7.5rem] overflow-hidden rounded-2xl border bg-zinc-950/80 shadow-lg shadow-black/40 transition duration-300",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        theme.accentBorder,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-95 transition-opacity group-hover:opacity-100",
          theme.heroGradient,
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ background: theme.heroGlow }}
        aria-hidden
      />
      {logoSrc ? (
        <div
          className="pointer-events-none absolute right-2 bottom-2 h-24 w-24 overflow-hidden rounded-2xl opacity-[0.14] transition-opacity group-hover:opacity-[0.22] sm:right-3 sm:bottom-3 sm:h-28 sm:w-28"
          aria-hidden
        >
          <img src={logoSrc} alt="" className="size-full object-cover" />
        </div>
      ) : null}

      <div className="relative flex w-full items-center gap-4 py-4 pl-5 pr-4 sm:gap-5 sm:py-5 sm:pl-6 sm:pr-5">
        <div className="relative ml-0.5 shrink-0 sm:ml-1">
          <div
            className="pointer-events-none absolute inset-0 scale-110 rounded-2xl blur-xl opacity-70"
            style={{ background: theme.heroGlow }}
            aria-hidden
          />
          <ClanLogo
            tag={clan.tag}
            logoSrc={logoSrc}
            size="md"
            className={cn("relative border-2 shadow-lg", theme.accentBorder)}
            logoComingSoonLabel={t("pages.clans.logoComingSoon", { name: clan.name })}
          />
        </div>

        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest",
              theme.badgeBg,
            )}
          >
            {clan.tag}
          </span>
          <p className="mt-2 truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-wide text-zinc-50 sm:text-lg">
            {clan.name}
          </p>
          <p className={cn("mt-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100", theme.accentText)}>
            {t("pages.clans.viewClan")}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ClanListGrid({ clans }: { clans: Clan[] }) {
  const { t } = useTranslation();

  return (
    <ul
      className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-3"
      aria-label={t("pages.clans.listAria")}
    >
      {clans.map((clan) => (
        <li key={clan.id}>
          <ClanListCard clan={clan} />
        </li>
      ))}
    </ul>
  );
}
