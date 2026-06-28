import type { ReactNode } from "react";

import { ChannelGrid } from "@/components/channels/ChannelCard";
import type { Channel } from "@/data/channels";
import { useTranslation } from "@/hooks/useTranslation";
import type { ClanTheme } from "@/lib/clanTheme";
import { cn } from "@/lib/cn";

type ClanChannelsSectionProps = {
  channels: Channel[];
  theme: ClanTheme;
};

export function ClanChannelsSection({ channels, theme }: ClanChannelsSectionProps) {
  const { t } = useTranslation();

  if (channels.length === 0) return null;

  return (
    <section>
      <SectionHeading
        icon={<GlobeIcon className={theme.sectionIcon} />}
        title={t("pages.clans.detail.linksTitle")}
        subtitle={t("pages.clans.detail.linksSubtitle")}
      />
      <ChannelGrid channels={channels} compact />
    </section>
  );
}

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

export function ClanAboutSection({ theme }: { theme: ClanTheme }) {
  const { t } = useTranslation();
  const soon = t("pages.clans.detail.comingSoon");

  return (
    <section>
      <SectionHeading
        icon={<AboutIcon className={theme.sectionIcon} />}
        title={t("pages.clans.detail.aboutTitle")}
        subtitle={t("pages.clans.detail.aboutSubtitle")}
      />
      <div className={cn("overflow-hidden rounded-2xl border bg-zinc-950/50", theme.accentBorder)}>
        <div className="border-b border-zinc-800/80 px-4 py-3 sm:px-5">
          <span className="inline-flex items-center rounded-full border border-zinc-600/50 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {soon}
          </span>
        </div>
        <div className="space-y-3 px-4 py-6 sm:px-5 sm:py-8">
          <div className="h-3 w-4/5 max-w-md rounded-full bg-zinc-800/80" aria-hidden />
          <div className="h-3 w-full rounded-full bg-zinc-800/60" aria-hidden />
          <div className="h-3 w-11/12 rounded-full bg-zinc-800/50" aria-hidden />
          <p className="pt-2 text-sm text-zinc-500">{t("pages.clans.detail.aboutPlaceholder")}</p>
        </div>
      </div>
    </section>
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" />
    </svg>
  );
}
