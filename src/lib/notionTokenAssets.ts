import tokenAssetMap from "@/data/token_asset_map.json";

import { getTokenLabel } from "./notionTokenLabels";

export { getTokenLabel };

type MapType = Record<string, string>;

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

const map = tokenAssetMap as MapType;

/**
 * Tokens usados nos JSON (Notion) cujo ficheiro esperado (ex.: AoMR_Classical_Age_icon.png)
 * ainda não está em public/assets. Usamos ícones existentes até esses PNGs serem adicionados;
 * depois disso, o mapa principal passa a ter prioridade.
 */
const TOKEN_FALLBACK_URL: Record<string, string> = {
  aomr_archaic_age_icon: "/assets/techs/AoMR_Pickaxe_icon.png",
  aomr_classical_age_icon: "/assets/techs/AoMR_Coinage_icon.png",
  aomr_heroic_age_icon: "/assets/techs/techs_atlantean/AoMR_Heroic_Renewal_icon.webp",
  aomr_mythic_age_icon: "/assets/techs/techs_atlantean/AoMR_Mythic_Rejuvenation_icon.webp",
  aomr_wonder_age_icon: "/assets/others/AoMR_Wonder_icon.png",
  aomr_japaneses_icon: "/assets/buildings/AoMR_Town_Center_Japanese_icon.png",
};

/** Token como em `:favoraom:` ou `:aomr_type_ship_icon:` (sem dois-pontos). */
export function getTokenAssetUrl(token: string): string | undefined {
  const k = token.toLowerCase();
  return map[k] ?? TOKEN_FALLBACK_URL[k];
}

/** Padrão `:token:` usado nos exports Notion (letras, números, _ e -). */
export const NOTION_TOKEN_IN_TEXT_RE = /:([a-z0-9_-]+):/gi;

/**
 * Substitui `:token:` em HTML estático por <img src="/assets/..."> quando existe ficheiro no mapa.
 */
export function replaceNotionTokensInHtml(html: string): string {
  return html.replace(NOTION_TOKEN_IN_TEXT_RE, (full, name: string) => {
    const src = getTokenAssetUrl(name);
    if (!src) return full;
    const title = escapeHtmlAttr(getTokenLabel(name));
    return `<img src="${src}" alt="" title="${title}" class="notion-token-inline" loading="lazy" decoding="async"/>`;
  });
}

/**
 * HTML exportado com `src="/assets/Ficheiro.png"` (plano) quebra após reorganizar public/assets.
 * Quando existe `alt="aomr_..."`, reescreve `src` para o URL do mapa / fallbacks (o mesmo que `:token:`).
 */
export function rewriteFlatImgSrcFromAlt(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const altM = /\balt="([^"]*)"/i.exec(tag);
    const srcM = /\bsrc="(\/assets\/[^"]*)"/i.exec(tag);
    if (!altM?.[1] || !srcM?.[1]) return tag;
    const token = altM[1].trim().toLowerCase();
    if (!token) return tag;
    const url = getTokenAssetUrl(token);
    if (!url) return tag;
    const src = srcM[1];
    const parts = src.split("/");
    if (parts.length !== 3 || parts[1] !== "assets") return tag;
    let out = tag;
    if (src !== url) {
      out = out.replace(srcM[0], `src="${url}"`);
    }
    if (!/\btitle\s*=/i.test(out)) {
      const label = escapeHtmlAttr(getTokenLabel(token));
      out = out.replace(/(\/?>)\s*$/, ` title="${label}"$1`);
    }
    return out;
  });
}
