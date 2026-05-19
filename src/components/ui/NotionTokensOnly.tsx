import { Fragment } from "react";

import { getTokenAssetUrl } from "@/lib/notionTokenAssets";
import { getTokenLabel } from "@/lib/notionTokenLabels";

const TOKEN_RE = /:([a-z0-9_-]+):/gi;

type NotionTokensOnlyProps = {
  text: string;
  /** Tamanho do ícone na célula (planilha). */
  iconClassName?: string;
};

/** Apenas ícones `:token:` de um trecho (sem rótulos de texto). */
export function NotionTokensOnly({
  text,
  iconClassName = "h-[1.1em] max-h-5 w-auto object-contain",
}: NotionTokensOnlyProps) {
  const tokens = [...text.matchAll(TOKEN_RE)];
  if (!tokens.length) return null;

  return (
    <span className="inline-flex items-center gap-0.5">
      {tokens.map((m, i) => {
        const name = (m[1] ?? "").toLowerCase();
        const src = getTokenAssetUrl(name);
        if (!src) return null;
        return (
          <img
            key={`${name}-${i}`}
            src={src}
            alt=""
            title={getTokenLabel(name)}
            className={iconClassName}
          />
        );
      })}
    </span>
  );
}

type NotionCounterIconsRowProps = {
  text: string;
  iconClassName?: string;
};

/**
 * Forte/fraco contra na planilha: só ícones, vários grupos separados por ` | `.
 * Ex.: `Cavalaria :aomr_type_cavalry_icon: | Artilharia :aomr_type_archer_icon:`
 */
export function NotionCounterIconsRow({ text, iconClassName }: NotionCounterIconsRowProps) {
  const trimmed = text.trim();
  if (!trimmed || trimmed === "-") {
    return <span className="text-zinc-500">—</span>;
  }

  const segments = trimmed.split(/\s*\|\s*/).filter((s) => s.trim());
  const withIcons = segments.filter((seg) => TOKEN_RE.test(seg));
  TOKEN_RE.lastIndex = 0;

  if (!withIcons.length) {
    return <span className="text-zinc-500">—</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
      {withIcons.map((seg, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className="select-none px-0.5 text-xs text-zinc-600" aria-hidden>
              |
            </span>
          ) : null}
          <NotionTokensOnly text={seg} iconClassName={iconClassName} />
        </Fragment>
      ))}
    </span>
  );
}
