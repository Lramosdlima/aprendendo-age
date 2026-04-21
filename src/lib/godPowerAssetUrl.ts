import tokenAssetMap from "@/data/token_asset_map.json";

/** Normaliza nome EN do JSON para chave de busca (minúsculas). */
function normEn(s: string): string {
  return s.trim().toLowerCase();
}

function stemToLookupKey(basename: string): string {
  let s = basename.replace(/^AoMR_/i, "").replace(/\.(png|webp|jpg)$/i, "");
  if (s.endsWith("_power_icon")) s = s.slice(0, -"_power_icon".length);
  else if (s.endsWith("_icon")) s = s.slice(0, -"_icon".length);
  else if (s.endsWith("_power")) s = s.slice(0, -"_power".length);
  return s.replace(/_/g, " ").trim().toLowerCase();
}

function buildGodPowerUrlByEnglish(): Map<string, string> {
  const m = new Map<string, string>();
  for (const v of Object.values(tokenAssetMap)) {
    if (typeof v !== "string" || !v.includes("/god_power/")) continue;
    const base = v.split("/").pop();
    if (!base) continue;
    const key = stemToLookupKey(base);
    if (!m.has(key)) m.set(key, v);
  }
  return m;
}

const urlByEnglish = buildGodPowerUrlByEnglish();

/**
 * URL pública do ícone do poder divino, ou `undefined` se não houver asset mapeado.
 */
export function getGodPowerAssetUrl(ingles: string | undefined): string | undefined {
  if (!ingles?.trim()) return undefined;
  return urlByEnglish.get(normEn(ingles));
}
