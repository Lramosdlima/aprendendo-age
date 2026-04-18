import type { ReactNode } from "react";

import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

/** Emoji → ícone (`token`) e texto do tooltip. */
export const EMOJI_TYPE_ICON_ENTRIES: Record<string, { token: string; label: string }> = {
  "⚔": { token: "aomr_type_infantry_icon", label: "Infantaria" },
  "🔪": { token: "aomr_type_infantry_icon", label: "Infantaria" },
  "🏹": { token: "aomr_type_archer_icon", label: "Artilharia" },
  "🏇": { token: "aomr_type_cavalry_icon", label: "Cavalaria" },
  "🐴": { token: "aomr_type_cavalry_icon", label: "Cavalaria" },
  "🐲": { token: "aomr_type_myth_unit_icon", label: "Mítica" },
  "🛡": { token: "aomr_type_human_soldier_icon", label: "Humano" },
  "⭐": { token: "aomr_type_hero_icon", label: "Herói" },
  "💥": { token: "aomr_type_siege_weapon_icon", label: "Cerco" },
  "☁": { token: "aomr_type_flying_unit_icon", label: "Voador" },
  "☁️": { token: "aomr_type_flying_unit_icon", label: "Voador" },
  "🏠": { token: "aomr_type_building_icon", label: "Construção" },
  /** legado em exports antigos */
  "🏘": { token: "aomr_type_building_icon", label: "Construção" },
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const EMOJI_PATTERN = new RegExp(
  `(${Object.keys(EMOJI_TYPE_ICON_ENTRIES)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|")})`,
  "gu",
);

const imgClass =
  "notion-token-inline mx-0.5 inline-block h-[1em] max-h-[1.1em] w-auto align-[-0.12em] object-contain";

/**
 * Parte de texto plano (já sem `:token:`) com emojis de tipo substituídos por ícones inline.
 */
export function renderTextWithEmojiTypeIcons(text: string, keyPrefix: string): ReactNode[] {
  if (!text) return [];

  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;

  for (const m of text.matchAll(EMOJI_PATTERN)) {
    const idx = m.index ?? 0;
    if (idx > last) {
      nodes.push(<span key={`${keyPrefix}-t-${i++}`}>{text.slice(last, idx)}</span>);
    }
    const raw = m[0];
    const entry = EMOJI_TYPE_ICON_ENTRIES[raw];
    const src = entry ? getTokenAssetUrl(entry.token) : undefined;
    if (src && entry) {
      nodes.push(
        <img
          key={`${keyPrefix}-img-${i++}`}
          src={src}
          alt=""
          aria-hidden
          title={entry.label}
          className={imgClass}
        />,
      );
    } else {
      nodes.push(<span key={`${keyPrefix}-miss-${i++}`}>{raw}</span>);
    }
    last = idx + raw.length;
  }

  if (last < text.length) {
    nodes.push(<span key={`${keyPrefix}-tail-${i++}`}>{text.slice(last)}</span>);
  }

  if (nodes.length === 0) {
    return [<span key={`${keyPrefix}-all`}>{text}</span>];
  }

  return nodes;
}
