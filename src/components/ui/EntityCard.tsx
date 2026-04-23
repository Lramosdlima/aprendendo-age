import { useEffect, useState, type ReactNode } from "react";
import { Link, type To } from "react-router-dom";

import { AppTag, type AppTagVariant } from "@/components/ui/AppTag";
import { cn } from "@/lib/cn";
import { cssUrl, watermarkStripImageStyle } from "@/lib/watermarkImageStyle";

type EntityCardProps = {
  to: To;
  /**
   * Passado a `<Link state>`, p.ex. a URL do índice (path + `?search=`) para
   * restaurar o filtro ao voltar com "←" na página de detalhe.
   */
  linkState?: unknown;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  /** Ícone ou arte como marca d’água à direita (baixa opacidade); fica acima do fundo em `backgroundCoverSrc`. */
  watermarkSrc?: string;
  /** Imagem de fundo em todo o card (cover, mesma opacidade suave que a faixa da marca d’água); por baixo do ícone e do texto. */
  backgroundCoverSrc?: string;
  /** Se `backgroundCoverSrc` falhar ao carregar (ex. preview 404), usa-se esta URL. */
  backgroundCoverFallbackSrc?: string;
  /** Se true, o subtítulo é mostrado dentro de {@link AppTag}. */
  subtitleTag?: boolean;
  /** Estilo do {@link AppTag} do subtítulo (`rich` = não forçar âmbar; útil com cores por tipo). */
  subtitleTagVariant?: AppTagVariant;
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
  linkState,
  title,
  subtitle,
  meta,
  watermarkSrc,
  backgroundCoverSrc,
  backgroundCoverFallbackSrc,
  subtitleTag = true,
  subtitleTagVariant = "amber",
  subtitleMinLines = 2,
  className,
  compareMode,
  selected,
  onToggleSelect,
  selectDisabled,
  cardTint,
}: EntityCardProps) {
  const [coverSrc, setCoverSrc] = useState(backgroundCoverSrc);
  useEffect(() => {
    setCoverSrc(backgroundCoverSrc);
  }, [backgroundCoverSrc]);

  const hasTint = Boolean(cardTint);
  const hasBgCover = Boolean(coverSrc);
  const useCoverFallbackProbe =
    Boolean(
      backgroundCoverSrc &&
        backgroundCoverFallbackSrc &&
        backgroundCoverSrc !== backgroundCoverFallbackSrc,
    );
  const useSubtitleTag = subtitleTag && subtitle != null && subtitle !== "";
  const subtitleBody = useSubtitleTag ? (
    <AppTag
      variant={subtitleTagVariant}
      className="align-top leading-snug [word-break:break-word] normal-case"
    >
      {subtitle}
    </AppTag>
  ) : (
    subtitle
  );

  const shellClass = cn(
    "group relative block overflow-hidden rounded-xl border p-4 transition-colors",
    !hasTint && !hasBgCover && "bg-zinc-900/40",
    !hasTint && hasBgCover && "bg-transparent",
    compareMode
      ? "cursor-pointer border-aom-border hover:border-amber-500/35"
      : "border-aom-border hover:border-amber-500/35",
    !hasTint && !hasBgCover && "hover:bg-zinc-900/70",
    selected && compareMode && !hasTint && !hasBgCover ? "border-amber-500/50 bg-zinc-900/70 ring-1 ring-amber-500/30" : false,
    selected && compareMode && hasTint ? "border-amber-500/50 ring-1 ring-amber-500/30" : false,
    selected && compareMode && hasBgCover && !hasTint ? "border-amber-500/50 ring-1 ring-amber-500/30" : false,
    selectDisabled && compareMode && !selected ? "opacity-60" : false,
    className,
  );

  const tintLayers =
    hasTint && cardTint ? (
      <>
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit]",
            hasBgCover && "z-[2]",
          )}
          style={{ backgroundColor: cardTint }}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-zinc-900/40 transition-colors",
            "group-hover:bg-zinc-900/70",
            selected && compareMode && "bg-zinc-900/70",
            hasBgCover && "z-[3]",
          )}
        />
      </>
    ) : null;

  const bgCoverLayers = hasBgCover ? (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center saturate-125 opacity-[0.18] transition-opacity group-hover:opacity-[0.18]"
          style={{ backgroundImage: cssUrl(coverSrc!) }}
        />
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-zinc-900/40 transition-colors",
          "group-hover:bg-zinc-900/70",
          selected && compareMode && !hasTint && "bg-zinc-900/70",
        )}
      />
    </>
  ) : null;

  const wmZ = hasBgCover ? "z-[4]" : "z-0";
  const contentZ = hasBgCover ? "z-[5]" : "z-[1]";

  const inner = (
    <>
      {watermarkSrc ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-[min(52%,20rem)] overflow-hidden",
            wmZ,
          )}
        >
          <div
            className="absolute inset-0 saturate-125 opacity-[0.18] transition-opacity group-hover:opacity-[0.18]"
            style={watermarkStripImageStyle(watermarkSrc)}
          />
        </div>
      ) : null}
      <div className={cn("relative", contentZ)}>
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
          <span className="flex min-w-0 flex-1 font-[family-name:var(--font-display)] text-base font-semibold text-amber-100 group-hover:text-amber-50">
            {title}
          </span>
        </div>
        {subtitleMinLines === 3 ? (
          <p className="mt-2 line-clamp-3 min-h-[3lh] text-sm leading-relaxed text-zinc-400">
            {subtitle != null ? subtitleBody : "\u00A0"}
          </p>
        ) : subtitle ? (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{subtitleBody}</p>
        ) : null}
        {meta ? <div className="mt-2 text-xs text-zinc-500">{meta}</div> : null}
      </div>
    </>
  );

  const coverProbe =
    useCoverFallbackProbe && hasBgCover && backgroundCoverFallbackSrc ? (
      <img
        key={backgroundCoverSrc}
        src={backgroundCoverSrc}
        alt=""
        className="pointer-events-none h-px w-px max-h-0 max-w-0 overflow-hidden border-0 opacity-0"
        onError={() => {
          if (backgroundCoverFallbackSrc) setCoverSrc(backgroundCoverFallbackSrc);
        }}
      />
    ) : null;

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
        {coverProbe}
        {bgCoverLayers}
        {tintLayers}
        {inner}
      </div>
    );
  }

  return (
    <Link to={to} className={shellClass} state={linkState}>
      {coverProbe}
      {bgCoverLayers}
      {tintLayers}
      {inner}
    </Link>
  );
}
