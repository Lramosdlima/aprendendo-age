import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type AppTagProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Etiqueta compacta (ex.: subtítulo em cards). Estilo base tipo badge âmbar.
 */
export function AppTag({ className, children, ...props }: AppTagProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center rounded border border-amber-600/50 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
