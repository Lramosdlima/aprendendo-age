import { getIconFieldUrl } from "@/lib/notionTokenAssets";

export function getMapaAssetUrl(m: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(m?.icon);
}

/**
 * Pré-visualização de mapa em `/assets/maps/previews/` (mesmo basename que o PNG em `/assets/maps/`).
 * Ver `getMapaAssetUrl` e `public/assets/maps/previews/`. Quando o ficheiro ainda não existe, passar
 * `backgroundCoverFallbackSrc` no `EntityCard` com o URL principal.
 */
export function getMapaPreviewUrl(m: { icon?: string | null }): string | undefined {
  const u = getMapaAssetUrl(m);
  if (!u) return undefined;
  return u.replace("/assets/maps/", "/assets/maps/previews/");
}

export function getUnidadeAssetUrl(u: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(u?.icon);
}

export function getConstrucaoAssetUrl(c: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(c?.icon);
}

export function getAldeaoAssetUrl(a: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(a?.icon);
}
