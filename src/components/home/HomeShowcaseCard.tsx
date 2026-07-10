import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";

export type HomeShowcaseAccent = "amber" | "teal" | "sky";

type HomeShowcaseCardProps = {
  to: string;
  step: number;
  trailLabel: string;
  title: string;
  description: string;
  imageSrc?: string;
  count?: number;
  countLabel?: string;
  accent?: HomeShowcaseAccent;
  exploreLabel: string;
  isNew?: boolean;
  newLabel?: string;
  layout?: "carousel" | "fill";
};

const accentStyles: Record<
  HomeShowcaseAccent,
  { ring: string; step: string; glow: string; hoverBorder: string }
> = {
  amber: {
    ring: "ring-amber-500/20",
    step: "bg-amber-500/15 text-amber-200 ring-amber-500/35",
    glow: "from-amber-500/25 via-amber-600/5",
    hoverBorder: "hover:border-amber-500/45",
  },
  teal: {
    ring: "ring-teal-500/20",
    step: "bg-teal-500/15 text-teal-200 ring-teal-500/35",
    glow: "from-teal-500/25 via-teal-600/5",
    hoverBorder: "hover:border-teal-500/45",
  },
  sky: {
    ring: "ring-sky-500/20",
    step: "bg-sky-500/15 text-sky-200 ring-sky-500/35",
    glow: "from-sky-500/25 via-sky-600/5",
    hoverBorder: "hover:border-sky-500/45",
  },
};

export function HomeShowcaseCard({
  to,
  step,
  trailLabel,
  title,
  description,
  imageSrc,
  count,
  countLabel,
  accent = "amber",
  exploreLabel,
  isNew,
  newLabel,
  layout = "carousel",
}: HomeShowcaseCardProps) {
  const styles = accentStyles[accent];

  return (
    <Link
      to={to}
      className={cn(
        "group relative flex h-full min-h-[18.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-aom-border bg-aom-card/80 shadow-sm shadow-black/25 backdrop-blur-sm",
        layout === "fill"
          ? "w-full"
          : "w-[min(100%,19.5rem)] sm:w-[20.5rem] lg:w-[calc((100%-2rem)/3)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/30",
        styles.hoverBorder,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-90",
          styles.glow,
        )}
      />

      <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-aom-border/70 bg-zinc-950/50">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_100%,rgba(245,158,11,0.14),transparent)]"
        />
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            className="relative z-[1] max-h-[5.5rem] max-w-[5.5rem] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="relative z-[1] size-16 rounded-2xl bg-zinc-800/80 ring-1 ring-zinc-700/80" />
        )}
        <span
          className={cn(
            "absolute left-3 top-3 z-[2] rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ring-1",
            styles.step,
          )}
        >
          {String(step).padStart(2, "0")} · {trailLabel}
        </span>
        {isNew && newLabel ? (
          <span className="absolute right-3 top-3 z-[2] rounded-full bg-sky-500/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-sky-500/35">
            {newLabel}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-amber-100 transition group-hover:text-amber-50">
            {title}
          </h3>
          {count != null ? (
            <span
              className={cn(
                "shrink-0 rounded-full bg-zinc-800/90 px-2 py-0.5 text-xs tabular-nums text-zinc-400 ring-1 ring-zinc-700/80",
                styles.ring,
              )}
              title={countLabel}
            >
              {count}
            </span>
          ) : null}
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-400/90 transition group-hover:text-amber-300">
          {exploreLabel}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
