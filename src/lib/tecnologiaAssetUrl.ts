import { getIconFieldUrl } from "@/lib/notionTokenAssets";

/**
 * URL pública do ícone da tecnologia (`icon` em `tecnologias.json` → `token_asset_map`), ou `undefined`.
 */
export function getTecnologiaAssetUrl(t: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(t?.icon);
}
