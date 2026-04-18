import type { ReactNode } from "react";

import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

type NotionTextProps = {
  text: string;
  className?: string;
};

const TOKEN_RE = /:([a-z0-9_-]+):/gi;

/**
 * Texto exportado do Notion: trechos `:token:` viram ícone em /assets quando mapeados em token_asset_map.json.
 */
export function NotionText({ text, className }: NotionTextProps) {
  if (!text) return null;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let i = 0;
  let segKey = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) {
      parts.push(<span key={`em-${segKey++}`}>{text.slice(lastIndex, start)}</span>);
    }
    const raw = m[0];
    const name = (m[1] ?? "").toLowerCase();
    const src = getTokenAssetUrl(name);
    if (src) {
      parts.push(
        <img
          key={`img-${i++}`}
          src={src}
          alt=""
          title={raw}
          className="notion-token-inline mx-0.5 inline-block h-[1em] max-h-[1.1em] w-auto align-[-0.12em] object-contain"
        />,
      );
    } else {
      parts.push(
        <span
          key={`miss-${i++}`}
          className="mx-0.5 inline rounded bg-zinc-800/90 px-1 py-0.5 align-baseline font-mono text-[0.65rem] text-amber-200/95"
          title={raw}
        >
          {raw}
        </span>,
      );
    }
    lastIndex = start + raw.length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`end-${segKey}`}>{text.slice(lastIndex)}</span>);
  }

  return <span className={className}>{parts}</span>;
}
