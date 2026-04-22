import { getIconFieldUrl } from "@/lib/notionTokenAssets";

/** URL pública do ícone do poder divino (`icon` em `godpowers.json`). */
export function getGodPowerAssetUrl(power: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(power?.icon);
}
