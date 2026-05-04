import { getTokenAssetUrl } from "./notionTokenAssets";

/** Nome do deus como vem da API → slug do token `aomr_*_icon`. */
function godNameToTokenKey(god: string): string {
  const ascii = god
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ü/gi, "u");
  const slug = ascii.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `aomr_${slug}_icon`;
}

/**
 * URL do retrato do deus em `/public/assets/gods` (via mapa de tokens).
 */
export function getGodPortraitUrl(godName: string): string | undefined {
  const key = godNameToTokenKey(godName);
  return getTokenAssetUrl(key);
}
