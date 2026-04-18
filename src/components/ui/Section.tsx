import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Section({ title, children, className }: SectionProps) {
  return (
    <section className={cn("rounded-2xl border border-aom-border bg-aom-card/60 p-5 shadow-sm shadow-black/20", className)}>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100/95">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}
