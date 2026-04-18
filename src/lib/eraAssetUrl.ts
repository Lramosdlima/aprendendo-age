/** Ícones em `public/assets/ages/` (nomes AoMR_*). */
const ERA_ASSET_BY_ID: Record<number, string> = {
  1: "/assets/ages/AoMR_Archaic_Age_icon.png",
  2: "/assets/ages/AoMR_Classical_Age_icon.png",
  3: "/assets/ages/AoMR_Heroic_Age_icon.png",
  4: "/assets/ages/AoMR_Mythic_Age_icon.png",
  5: "/assets/ages/AoMR_Wonder_Age_icon.png",
};

export function getEraAssetUrl(eraId: number): string | undefined {
  return ERA_ASSET_BY_ID[eraId];
}
