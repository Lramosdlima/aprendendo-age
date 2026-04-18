import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { AppTag } from "@/components/ui/AppTag";
import { cn } from "@/lib/cn";
import { watermarkStripImageStyle } from "@/lib/watermarkImageStyle";

type EntityCardProps = {
  to: string;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  /** Ícone ou arte como marca d’água ao fundo (baixa opacidade). */
  watermarkSrc?: string;
  /** Se true, o subtítulo é mostrado dentro de {@link AppTag}. */
  subtitleTag?: boolean;
  /** Reserva altura fixa para N linhas de subtítulo (ex.: 3 para grelha uniforme). */
  subtitleMinLines?: 2 | 3;
  className?: string;
};

export function EntityCard({
  to,
  title,
  subtitle,
  meta,
  watermarkSrc,
  subtitleTag = true,
  subtitleMinLines = 2,
  className,
}: EntityCardProps) {
  const useSubtitleTag = subtitleTag && subtitle != null && subtitle !== "";
  const subtitleBody = useSubtitleTag ? (
    <AppTag className="align-top leading-snug [word-break:break-word] normal-case">{subtitle}</AppTag>
  ) : (
    subtitle
  );

  return (
    <Link
      to={to}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-aom-border bg-zinc-900/40 p-4 transition-colors hover:border-amber-500/35 hover:bg-zinc-900/70",
        className,
      )}
    >
      {watermarkSrc ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[min(52%,20rem)] overflow-hidden"
        >
          <div
            className="absolute inset-0 saturate-125 opacity-[0.18] transition-opacity group-hover:opacity-[0.18]"
            style={watermarkStripImageStyle(watermarkSrc)}
          />
        </div>
      ) : null}
      <div className="relative z-[1]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-[family-name:var(--font-display)] text-base font-semibold text-amber-100 group-hover:text-amber-50">
            {title}
          </span>
          {meta ? <span className="text-xs text-zinc-500">{meta}</span> : null}
        </div>
        {subtitleMinLines === 3 ? (
          <p className="mt-2 line-clamp-3 min-h-[3lh] text-sm leading-relaxed text-zinc-400">
            {subtitle != null ? subtitleBody : "\u00A0"}
          </p>
        ) : subtitle ? (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{subtitleBody}</p>
        ) : null}
      </div>
    </Link>
  );
}
