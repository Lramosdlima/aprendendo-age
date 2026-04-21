import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "teal" | "gray" | "orange" | "brown";

const variantClass: Record<Variant, string> = {
  teal: "border-teal-700/35 bg-teal-950/35",
  gray: "border-zinc-600/40 bg-zinc-900/70",
  orange: "border-orange-700/35 bg-orange-950/25",
  brown: "border-amber-800/35 bg-zinc-900/80",
};

type TrilhaCalloutProps = {
  icon?: ReactNode;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function TrilhaCallout({ icon, children, variant = "teal", className }: TrilhaCalloutProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed text-zinc-300",
        variantClass[variant],
        className,
      )}
    >
      {icon != null ? <div className="shrink-0 text-xl leading-none">{icon}</div> : null}
      <div className="min-w-0 space-y-2 [&_code]:rounded [&_code]:bg-zinc-800/90 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-amber-100/95">
        {children}
      </div>
    </div>
  );
}
