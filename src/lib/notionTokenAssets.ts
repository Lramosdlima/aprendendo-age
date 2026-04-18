import tokenAssetMap from "@/data/token_asset_map.json";

type MapType = Record<string, string>;

const map = tokenAssetMap as MapType;

/** Token como em `:favoraom:` ou `:aomr_type_ship_icon:` (sem dois-pontos). */
export function getTokenAssetUrl(token: string): string | undefined {
  return map[token.toLowerCase()];
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
    return `<img src="${src}" alt="" class="notion-token-inline" loading="lazy" decoding="async"/>`;
  });
}
