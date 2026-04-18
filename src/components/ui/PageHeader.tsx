import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: ReactNode;
  description?: string;
  /** Mesmo asset da marca d’água: ícone à esquerda do título/descrição. */
  headerIconSrc?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, headerIconSrc, actions, className }: PageHeaderProps) {
  const icon =
    headerIconSrc ? (
      <img
        src={headerIconSrc}
        alt=""
        aria-hidden
        className="h-20 w-20 shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 object-contain p-1.5 shadow-sm shadow-black/30"
      />
    ) : null;

  return (
    <header className={cn("mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="inline-flex max-w-full min-w-0 items-start gap-4">
        {icon}
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-amber-100">
            {title}
          </h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="shrink-0 sm:ml-auto">{actions}</div> : null}
    </header>
  );
}
