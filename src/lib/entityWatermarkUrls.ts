import tokenAssetMap from "@/data/token_asset_map.json";

function normalizeSlug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildSlugMap(pathIncludes: string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(tokenAssetMap)) {
    if (typeof v !== "string") continue;
    if (!pathIncludes.some((p) => v.includes(p))) continue;
    const match = k.match(/^aomr_(.+)_icon$/);
    if (!match) continue;
    const slug = match[1];
    if (!m.has(slug)) m.set(slug, v);
  }
  return m;
}

const unitSlugToUrl = buildSlugMap(["/unit_humans/", "/unit_myths/", "/unit_heroes/", "/unit_scout/"]);

/** Inclui chaves `aomr_<slug>` sem sufixo `_icon` (ex.: silo, imperial_academy) e Maravilha em `/others/`. */
function buildBuildingSlugMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(tokenAssetMap)) {
    if (typeof v !== "string") continue;
    const inBuildings = v.includes("/assets/buildings/");
    const inOthersWonder = v.includes("/assets/others/") && /wonder/i.test(v);
    if (!inBuildings && !inOthersWonder) continue;

    let slug: string | undefined;
    const iconKey = k.match(/^aomr_(.+)_icon$/);
    if (iconKey) slug = iconKey[1];
    else {
      const bare = k.match(/^aomr_(.+)$/);
      if (bare) slug = bare[1];
    }
    if (!slug) continue;
    if (!m.has(slug)) m.set(slug, v);
  }
  return m;
}

const buildingSlugToUrl = buildBuildingSlugMap();

const mapSlugToUrl = buildSlugMap(["/assets/maps/"]);

const villagerSlugToUrl = buildSlugMap(["/assets/und_villagers/"]);

const CIV_SUFFIXES = ["greek", "egyptian", "norse", "atlantean", "chinese", "japanese", "aztec"] as const;

function pickWithCivPrefix(slug: string, m: Map<string, string>): string | undefined {
  if (m.has(slug)) return m.get(slug);
  for (const civ of CIV_SUFFIXES) {
    const k = `${slug}_${civ}`;
    if (m.has(k)) return m.get(k);
  }
  const prefixed = [...m.keys()].filter((key) => key.startsWith(`${slug}_`));
  if (prefixed.length === 0) return undefined;
  prefixed.sort();
  return m.get(prefixed[0]);
}

/** Quando o EN não coincide com o slug do ficheiro (hífens, typos, OX → ox_cart). */
const CONSTRUCAO_INGLES_TO_SLUG: Record<string, string> = {
  "Counter Barracks": "counter-barracks",
};

const ALDEAO_INGLES_TO_SLUG: Record<string, string> = {
  Villager: "villager_greek",
  "Citizen (Hero)": "citizen_hero",
  "Kuafu (Hero)": "kuafu_hero",
};

/** EN/pt do JSON → slug `aomr_<slug>_icon` em `token_asset_map`. */
const UNIDADE_INGLES_TO_SLUG: Record<string, string> = {
  Toxote: "toxotes",
  Berserker: "berserk",
  Huscarl: "huskarl",
  Minotauro: "minotaur",
  Centauro: "centaur",
  Ciclope: "cyclops",
  Einheri: "einherjar",
  Valquíria: "valkyrie",
  "Nezha (Child)": "nezha_child",
  "Nezha (Youth)": "nezha_youth",
  "Nezha (Hero)": "nezha",
  "Miko (Hero)": "miko",
  "Bushi (Hero)": "bushi",
  "Onmyyoji (Hero)": "onmyoji",
  "Daimyo (Hero)": "daimyo",
  "King Midas": "midas",
  /** JSON: grafia EN vs slug do asset */
  Prometeus: "promethean",
  Autômato: "automaton",
  Esfinge: "sphinx",
  /** ficheiro: hypaspist; dado: Hypapist */
  Hypapist: "hypaspist",
};

/** EN do `mapas.json` → `aomr_<slug>_icon` em `token_asset_map` (`/assets/maps/`). */
const MAPA_INGLES_TO_SLUG: Record<string, string> = {};

export function getMapaAssetUrl(ingles?: string): string | undefined {
  if (!ingles?.trim()) return undefined;
  const slug = MAPA_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  return mapSlugToUrl.get(slug);
}

/** Pré-visualização de mapa em tamanho real (`/assets/maps/previews/`), mesmo basename que o ícone em `/assets/maps/`. */
export function getMapaPreviewUrl(ingles?: string): string | undefined {
  const u = getMapaAssetUrl(ingles);
  if (!u) return undefined;
  return u.replace("/assets/maps/", "/assets/maps/previews/");
}

export function getUnidadeAssetUrl(ingles: string | undefined): string | undefined {
  if (!ingles?.trim()) return undefined;
  const slug = UNIDADE_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  return pickWithCivPrefix(slug, unitSlugToUrl);
}

export function getConstrucaoAssetUrl(ingles: string | undefined): string | undefined {
  if (!ingles?.trim()) return undefined;
  const slug = CONSTRUCAO_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  const fromBuildings = pickWithCivPrefix(slug, buildingSlugToUrl);
  if (fromBuildings) return fromBuildings;
  /** Carro de Boi: `ingles` "OX" no JSON → asset em `und_villagers`. */
  if (slug === "ox") return villagerSlugToUrl.get("ox_cart");
  return undefined;
}

export function getAldeaoAssetUrl(ingles: string | undefined): string | undefined {
  if (!ingles?.trim()) return undefined;
  const slug = ALDEAO_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  const direct = villagerSlugToUrl.get(slug);
  if (direct) return direct;
  return pickWithCivPrefix(slug, villagerSlugToUrl);
}
