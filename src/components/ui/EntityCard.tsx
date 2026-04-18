import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";

type EntityCardProps = {
  to: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  className?: string;
};

export function EntityCard({ to, title, subtitle, meta, className }: EntityCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group block rounded-xl border border-aom-border bg-zinc-900/40 p-4 transition-colors hover:border-amber-500/35 hover:bg-zinc-900/70",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-[family-name:var(--font-display)] text-base font-semibold text-amber-100 group-hover:text-amber-50">
          {title}
        </span>
        {meta ? <span className="text-xs text-zinc-500">{meta}</span> : null}
      </div>
      {subtitle ? <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{subtitle}</p> : null}
    </Link>
  );
}
