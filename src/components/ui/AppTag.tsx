import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type AppTagVariant = "amber" | "rich";

export type AppTagProps = HTMLAttributes<HTMLSpanElement> & {
  /**
   * `amber`: badge clássico (subtítulos simples).
   * `rich`: borda/fundo neutros e texto base `zinc` para conteúdo com cores próprias (ex.: tipos de unidade).
   */
  variant?: AppTagVariant;
};

/**
 * Etiqueta compacta (ex.: subtítulo em cards). Estilo base tipo badge âmbar.
 */
export function AppTag({ className, children, variant = "amber", ...props }: AppTagProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center rounded px-1.5 py-0.5",
        variant === "amber" &&
          "border border-amber-600/50 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90",
        variant === "rich" &&
          "border border-zinc-600/50 bg-zinc-900/70 text-sm font-medium normal-case tracking-normal text-zinc-400",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
