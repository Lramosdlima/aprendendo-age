import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

/** `eras.json` id → token de ícone de era (mesmos de `godpowers.json` / fallbacks). */
const ERA_ID_TO_TOKEN: Record<number, string> = {
  1: "aomr_archaic_age_icon",
  2: "aomr_classical_age_icon",
  3: "aomr_heroic_age_icon",
  4: "aomr_mythic_age_icon",
  5: "aomr_wonder_age_icon",
};

/** Texto para `NotionText`: nome da era + `:token:` do ícone. */
export function formatEraNameForMetaNotion(eraId: number, nome: string): string {
  const token = ERA_ID_TO_TOKEN[eraId];
  if (!token || !getTokenAssetUrl(token)) return nome;
  return `${nome} :${token}:`;
}
