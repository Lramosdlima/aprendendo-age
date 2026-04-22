import { getIconFieldUrl } from "@/lib/notionTokenAssets";

export function getMapaAssetUrl(m: { icon?: string | null }): string | undefined {
  return getIconFieldUrl(m?.icon);
}

/** Pré-visualização de mapa (`/assets/maps/previews/`), mesmo basename que o ícone. */
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
