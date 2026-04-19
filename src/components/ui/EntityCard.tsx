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
  /** Modo comparação: card não navega; exibe checkbox e alterna seleção ao clicar. */
  compareMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /** Quando true e já há 2 outras unidades selecionadas, bloqueia nova seleção. */
  selectDisabled?: boolean;
  /** Tinte de fundo (ex.: rgba) por baixo do cinza — mistura com o card sem substituir o visual base. */
  cardTint?: string;
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
  compareMode,
  selected,
  onToggleSelect,
  selectDisabled,
  cardTint,
}: EntityCardProps) {
  const hasTint = Boolean(cardTint);
  const useSubtitleTag = subtitleTag && subtitle != null && subtitle !== "";
  const subtitleBody = useSubtitleTag ? (
    <AppTag className="align-top leading-snug [word-break:break-word] normal-case">{subtitle}</AppTag>
  ) : (
    subtitle
  );

  const shellClass = cn(
    "group relative block overflow-hidden rounded-xl border p-4 transition-colors",
    !hasTint && "bg-zinc-900/40",
    compareMode
      ? "cursor-pointer border-aom-border hover:border-amber-500/35"
      : "border-aom-border hover:border-amber-500/35",
    !hasTint && "hover:bg-zinc-900/70",
    selected && compareMode && !hasTint ? "border-amber-500/50 bg-zinc-900/70 ring-1 ring-amber-500/30" : false,
    selected && compareMode && hasTint ? "border-amber-500/50 ring-1 ring-amber-500/30" : false,
    selectDisabled && compareMode && !selected ? "opacity-60" : false,
    className,
  );

  const tintLayers =
    hasTint && cardTint ? (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ backgroundColor: cardTint }}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-zinc-900/40 transition-colors",
            "group-hover:bg-zinc-900/70",
            selected && compareMode && "bg-zinc-900/70",
          )}
        />
      </>
    ) : null;

  const inner = (
    <>
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
          <div className="flex min-w-0 items-start gap-3">
            {compareMode ? (
              <input
                type="checkbox"
                checked={!!selected}
                disabled={selectDisabled && !selected}
                onChange={(e) => {
                  e.stopPropagation();
                  if (selectDisabled && !selected) return;
                  onToggleSelect?.();
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 size-4 shrink-0 rounded border-aom-border bg-zinc-900 text-amber-600 focus:ring-amber-500/40 disabled:cursor-not-allowed"
                aria-label="Selecionar para comparar"
              />
            ) : null}
            <span className="min-w-0 font-[family-name:var(--font-display)] text-base font-semibold text-amber-100 group-hover:text-amber-50">
              {title}
            </span>
          </div>
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
    </>
  );

  if (compareMode) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={shellClass}
        onClick={() => {
          if (selectDisabled && !selected) return;
          onToggleSelect?.();
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          if (selectDisabled && !selected) return;
          onToggleSelect?.();
        }}
      >
        {tintLayers}
        {inner}
      </div>
    );
  }

  return (
    <Link to={to} className={shellClass}>
      {tintLayers}
      {inner}
    </Link>
  );
}
