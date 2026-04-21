import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

type TrilhaTokenImgProps = {
  token: string;
  className?: string;
};

/** Ícone de `token_asset_map.json` (ex.: `hackdamage`, `aomr_house_icon`). */
export function TrilhaTokenImg({ token, className }: TrilhaTokenImgProps) {
  const src = getTokenAssetUrl(token);
  if (!src) return null;
  return <img src={src} alt="" className={className ?? "inline h-[1em] w-[1em] align-[-0.15em] object-contain"} />;
}
