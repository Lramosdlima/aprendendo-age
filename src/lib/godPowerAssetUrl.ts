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

/** Mapeamentos onde o campo `ingles` do JSON não bate com o stem do arquivo. */
const OVERRIDES: Record<string, string> = {
  "the peach blossom spring": "/assets/god_power/AoMR_PeachBlossomSpring_power.png",
  /** typo no dado: arquivo é Gullinbursti */
  guillinbursti: "/assets/god_power/AoMR_Gullinbursti_icon.png",
  /** "Plenty" ↔ Plenty Vault */
  plenty: "/assets/god_power/AoMR_Plenty_Vault_icon.png",
  /** apóstrofo vs stem sem apóstrofo */
  "yinglong's wrath": "/assets/god_power/AoMR_Yinglongs_Wrath.png",
  /** typo no dado: Goushinboku vs Goshinboku */
  goushinboku: "/assets/god_power/AoMR_Goshinboku_Tree_icon.png",
  /** dado EN "Secret Gate" vs arquivo Sacred_Gate */
  "secret gate": "/assets/god_power/AoMR_Sacred_Gate_icon.webp",
};

/**
 * URL pública do ícone do poder divino, ou `undefined` se não houver asset mapeado.
 */
export function getGodPowerAssetUrl(ingles: string | undefined): string | undefined {
  if (!ingles?.trim()) return undefined;
  const k = normEn(ingles);
  const o = OVERRIDES[k];
  if (o) return o;
  return urlByEnglish.get(k);
}
