import { getIconFieldUrl } from "@/lib/notionTokenAssets";

/** URL pública do ícone de era (`icon` em `eras.json`). */
export function getEraAssetUrl(era: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(era?.icon);
}
