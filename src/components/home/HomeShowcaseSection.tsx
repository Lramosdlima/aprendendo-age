import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type HomeShowcaseSectionProps = {
  title: string;
  description: string;
  trailHint?: string;
  children: ReactNode;
  className?: string;
  accent?: "amber" | "teal";
};

export function HomeShowcaseSection({
  title,
  description,
  trailHint,
  children,
  className,
  accent = "amber",
}: HomeShowcaseSectionProps) {
  const accentBar = accent === "teal" ? "from-teal-500/80 to-teal-400/20" : "from-amber-500/80 to-amber-400/20";

  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className={cn("mb-2 h-1 w-12 rounded-full bg-gradient-to-r", accentBar)} aria-hidden />
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100 sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">{description}</p>
        </div>
        {trailHint ? (
          <p className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-right">
            {trailHint}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
