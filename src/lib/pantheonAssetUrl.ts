import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

/** `panteoes.json` id → token em `token_asset_map.json` (`/assets/pantheons/…`). */
const PANTHEON_ID_TO_TOKEN: Record<number, string> = {
  1: "aomr_pantheon_greeks_icon",
  2: "aomr_pantheon_egyptians_icon",
  3: "aomr_pantheon_norse_icon",
  4: "aomr_pantheon_atlanteans_icon",
  5: "aomr_pantheon_chinese_icon",
  6: "aomr_pantheon_japanese_icon",
  7: "aomr_pantheon_azteca_icon",
};

/** Marca d’água do card na lista de panteões (título permanece texto sem substituir emoji). */
export function getPantheonWatermarkUrl(panteaoId: number): string | undefined {
  const token = PANTHEON_ID_TO_TOKEN[panteaoId];
  return token ? getTokenAssetUrl(token) : undefined;
}

/** Texto para `NotionText`: nome do panteão + `:token:` do ícone. */
export function formatPantheonNameForMetaNotion(panteaoId: number, nome: string): string {
  const token = PANTHEON_ID_TO_TOKEN[panteaoId];
  if (!token || !getTokenAssetUrl(token)) return nome;
  return `${nome} :${token}:`;
}
