import type { ReactNode } from "react";

import { useTranslation } from "@/hooks/useTranslation";
import type { ClanTheme } from "@/lib/clanTheme";
import { cn } from "@/lib/cn";

function SectionHeading({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-aom-border/50 bg-zinc-950/80 shadow-inner">
        {icon}
      </div>
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-100 sm:text-xl">{title}</h2>
        <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
}

function PlaceholderBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-600/50 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
      {label}
    </span>
  );
}

function AboutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 6.5v.01M12 10v7.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function LinkTile({
  label,
  hint,
  gradient,
  icon,
  comingSoonLabel,
}: {
  label: string;
  hint: string;
  gradient: string;
  icon: ReactNode;
  comingSoonLabel: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-lg shadow-black/40 transition hover:brightness-110",
        gradient,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-zinc-100">
          {icon}
        </div>
        <PlaceholderBadge label={comingSoonLabel} />
      </div>
      <p className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-zinc-100">{label}</p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      <div className="mt-4 h-9 rounded-lg border border-dashed border-zinc-600/50 bg-black/20" aria-hidden />
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M20.32 4.37A19.8 19.8 0 0 0 16.55 3c-.2.36-.43.85-.59 1.23a18.3 18.3 0 0 0-5.92 0A8.5 8.5 0 0 0 9.45 3a19.7 19.7 0 0 0-3.77 1.37C2.55 8.22 1.74 12 2.01 15.73a19.9 19.9 0 0 0 4.86 2.45c.39-.53.74-1.1 1.04-1.68a12.8 12.8 0 0 1-1.64-.78l.41-.3a14.5 14.5 0 0 0 11.64 0l.41.3c-.5.3-1.07.56-1.64.78.3.58.65 1.15 1.04 1.68a19.8 19.8 0 0 0 4.86-2.45c.35-4.3-.6-8.05-2.68-11.36ZM8.68 13.55c-.97 0-1.77-.88-1.77-1.96 0-1.08.78-1.96 1.77-1.96.99 0 1.79.88 1.77 1.96 0 1.08-.78 1.96-1.77 1.96Zm6.64 0c-.97 0-1.77-.88-1.77-1.96 0-1.08.78-1.96 1.77-1.96.99 0 1.79.88 1.77 1.96 0 1.08-.78 1.96-1.77 1.96Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.25" />
      <circle cx="17.2" cy="6.8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClanPlaceholderSections({ theme }: { theme: ClanTheme }) {
  const { t } = useTranslation();
  const soon = t("pages.clans.detail.comingSoon");

  return (
    <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
      <section className="lg:col-span-3">
        <SectionHeading
          icon={<AboutIcon className={theme.sectionIcon} />}
          title={t("pages.clans.detail.aboutTitle")}
          subtitle={t("pages.clans.detail.aboutSubtitle")}
        />
        <div className={cn("overflow-hidden rounded-2xl border bg-zinc-950/50", theme.accentBorder)}>
          <div className="border-b border-zinc-800/80 px-4 py-3 sm:px-5">
            <PlaceholderBadge label={soon} />
          </div>
          <div className="space-y-3 px-4 py-6 sm:px-5 sm:py-8">
            <div className="h-3 w-4/5 max-w-md rounded-full bg-zinc-800/80" aria-hidden />
            <div className="h-3 w-full rounded-full bg-zinc-800/60" aria-hidden />
            <div className="h-3 w-11/12 rounded-full bg-zinc-800/50" aria-hidden />
            <p className="pt-2 text-sm text-zinc-500">{t("pages.clans.detail.aboutPlaceholder")}</p>
          </div>
        </div>
      </section>

      <section className="lg:col-span-2">
        <SectionHeading
          icon={<GlobeIcon className={theme.sectionIcon} />}
          title={t("pages.clans.detail.linksTitle")}
          subtitle={t("pages.clans.detail.linksSubtitle")}
        />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <LinkTile
            label={t("pages.clans.detail.linkDiscord")}
            hint={t("pages.clans.detail.linkDiscordHint")}
            gradient={theme.linkDiscord}
            icon={<DiscordIcon />}
            comingSoonLabel={soon}
          />
          <LinkTile
            label={t("pages.clans.detail.linkWebsite")}
            hint={t("pages.clans.detail.linkWebsiteHint")}
            gradient={theme.linkWebsite}
            icon={<GlobeIcon />}
            comingSoonLabel={soon}
          />
          <LinkTile
            label={t("pages.clans.detail.linkInstagram")}
            hint={t("pages.clans.detail.linkInstagramHint")}
            gradient={theme.linkInstagram}
            icon={<InstagramIcon />}
            comingSoonLabel={soon}
          />
        </div>
      </section>
    </div>
  );
}
