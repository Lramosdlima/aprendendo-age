import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

/**
 * URL pública do ícone da tecnologia (`icon` em `tecnologias.json` → `token_asset_map`), ou `undefined`.
 */
export function getTecnologiaAssetUrl(t: { icon?: string }): string | undefined {
  if (!t.icon?.trim()) return undefined;
  return getTokenAssetUrl(t.icon.toLowerCase());
}
