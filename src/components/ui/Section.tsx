import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { sectionWatermarkStripStyle } from "@/lib/watermarkImageStyle";

type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  /** Marca d’água opcional ao fundo do painel. */
  watermarkSrc?: string;
};

export function Section({ title, children, className, watermarkSrc }: SectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-aom-border bg-aom-card/60 p-5 shadow-sm shadow-black/20",
        className,
      )}
    >
      {watermarkSrc ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[min(40%,15rem)] overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.33]" style={sectionWatermarkStripStyle(watermarkSrc)} />
        </div>
      ) : null}
      <div className="relative z-[1]">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100/95">{title}</h2>
        <div className="mt-3 text-sm leading-relaxed text-zinc-300">{children}</div>
      </div>
    </section>
  );
}
