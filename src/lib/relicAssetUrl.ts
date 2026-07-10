import { getIconFieldUrl } from "@/lib/notionTokenAssets";

/** URL pública do ícone da relíquia (`icon` em `reliquias.json`). */
export function getRelicAssetUrl(relic: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(relic?.icon);
}
