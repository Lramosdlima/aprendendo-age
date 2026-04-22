/**
 * Gera o campo `icon` (token `aomr_…`) a partir da lógica legada
 * (slug / inglês / mapa) para preencher os JSONs de dados uma única vez.
 * Uso: `node scripts/assign-entity-icons.mjs` (a partir de `aprendendo-age/`)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "../src/data");

const tokenMap = JSON.parse(fs.readFileSync(path.join(DATA, "token_asset_map.json"), "utf8"));

// --- chaves (mesma lógica que entityWatermarkUrls + godPower + deus) ---

function lookupKey(s) {
  return s
    .trim()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase();
}

function stemToLookupKey(basename) {
  let s = basename.replace(/^AoMR_/i, "").replace(/\.(png|webp|jpg)$/i, "");
  if (s.endsWith("_power_icon")) s = s.slice(0, -"_power_icon".length);
  else if (s.endsWith("_icon")) s = s.slice(0, -"_icon".length);
  else if (s.endsWith("_power")) s = s.slice(0, -"_power".length);
  return lookupKey(s.replace(/_/g, " "));
}

function buildGodPowerUrlByEnglish() {
  const m = new Map();
  for (const v of Object.values(tokenMap)) {
    if (typeof v !== "string" || !v.includes("/god_power/")) continue;
    const base = v.split("/").pop();
    if (!base) continue;
    const key = stemToLookupKey(base);
    if (!m.has(key)) m.set(key, v);
  }
  return m;
}

const urlByGodPowerEnglish = buildGodPowerUrlByEnglish();

function normalizeSlug(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildSlugMap(pathIncludes) {
  const m = new Map();
  for (const [k, v] of Object.entries(tokenMap)) {
    if (typeof v !== "string") continue;
    if (!pathIncludes.some((p) => v.includes(p))) continue;
    const match = k.match(/^aomr_(.+)_icon$/);
    if (!match) continue;
    const slug = match[1];
    if (!m.has(slug)) m.set(slug, v);
  }
  return m;
}

function buildBuildingSlugMap() {
  const m = new Map();
  for (const [k, v] of Object.entries(tokenMap)) {
    if (typeof v !== "string") continue;
    const inBuildings = v.includes("/assets/buildings/");
    const inOthersWonder = v.includes("/assets/others/") && /wonder/i.test(v);
    if (!inBuildings && !inOthersWonder) continue;
    let slug;
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

const unitSlugToUrl = buildSlugMap(["/unit_humans/", "/unit_myths/", "/unit_heroes/", "/unit_scout/"]);
const buildingSlugToUrl = buildBuildingSlugMap();
const mapSlugToUrl = buildSlugMap(["/assets/maps/"]);
const villagerSlugToUrl = buildSlugMap(["/assets/und_villagers/"]);

const CIV_SUFFIXES = ["greek", "egyptian", "norse", "atlantean", "chinese", "japanese", "aztec"];

function pickWithCivPrefix(slug, m) {
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

const CONSTRUCAO_INGLES_TO_SLUG = { "Counter Barracks": "counter-barracks" };
const ALDEAO_INGLES_TO_SLUG = {
  Villager: "villager_greek",
  "Citizen (Hero)": "citizen_hero",
  "Kuafu (Hero)": "kuafu_hero",
};
const UNIDADE_INGLES_TO_SLUG = {
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
  Prometeus: "promethean",
  Autômato: "automaton",
  Esfinge: "sphinx",
  Hypapist: "hypaspist",
};
const MAPA_INGLES_TO_SLUG = {};

// --- deus: urlBySlug ---
function buildGodIconUrlBySlug() {
  const m = new Map();
  for (const [k, v] of Object.entries(tokenMap)) {
    if (typeof v !== "string" || !v.includes("/assets/gods/")) continue;
    const match = k.match(/^aomr_(.+)_icon$/);
    if (!match) continue;
    m.set(match[1], v);
  }
  return m;
}
const urlByDeusSlug = buildGodIconUrlBySlug();

function normalizeNomeToSlug(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/\//g, "_");
}

const NOME_TO_SLUG = {
  Urano: "oranos",
  Cronos: "kronos",
  "Fu Xi": "fuxi",
  "Nu Wa": "nuwa",
  Frey: "freyr",
  Atena: "athena",
  Apolo: "apollo",
  "Dionísio": "dionysus",
  Afrodite: "aphrodite",
  Hefesto: "hephaestus",
  "Hathor/Sobek": "sobek",
  "Néftis": "nephthys",
  Prometeu: "prometheus",
  Oceano: "oceanus",
  "Hécate": "hekate",
  "Perséfone": "persephone",
};

function resolveDeusIconSlug(nome) {
  if (!nome?.trim() || nome.trim() === "Sem título") return undefined;
  const slugOverride = NOME_TO_SLUG[nome];
  const candidates = [];
  if (slugOverride) candidates.push(slugOverride);
  const base = normalizeNomeToSlug(nome);
  candidates.push(base);
  candidates.push(base.replace(/-/g, "_"));
  candidates.push(base.replace(/_/g, "-"));
  for (const s of candidates) {
    if (urlByDeusSlug.has(s)) return s;
  }
  return undefined;
}

// --- panteão e era ---
const PANTHEON_ID_TO_TOKEN = {
  1: "aomr_pantheon_greeks_icon",
  2: "aomr_pantheon_egyptians_icon",
  3: "aomr_pantheon_norse_icon",
  4: "aomr_pantheon_atlanteans_icon",
  5: "aomr_pantheon_chinese_icon",
  6: "aomr_pantheon_japanese_icon",
  7: "aomr_pantheon_aztecs_icon",
};

const ERA_ID_TO_TOKEN = {
  1: "aomr_archaic_age_icon",
  2: "aomr_classical_age_icon",
  3: "aomr_heroic_age_icon",
  4: "aomr_mythic_age_icon",
  5: "aomr_wonder_age_icon",
};

// --- url → token preferido ---

function urlToBestToken(url) {
  if (!url) return undefined;
  const matches = Object.entries(tokenMap).filter(([, v]) => v === url);
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0][0].toLowerCase();
  const keys = matches.map(([k]) => k);
  const score = (k) => {
    let s = 0;
    if (k.includes("%")) s += 100;
    if (k.includes("'")) s += 50;
    if (!/^[a-z0-9_]+$/i.test(k)) s += 40;
    if (!k.toLowerCase().endsWith("_icon") && !/^aomr_.+$/i.test(k)) s += 20;
    return s;
  };
  keys.sort((a, b) => score(a) - score(b) || a.length - b.length);
  return keys[0].toLowerCase();
}

function getGodPowerIconToken(ingles) {
  if (!ingles?.trim()) return undefined;
  const url = urlByGodPowerEnglish.get(lookupKey(ingles));
  return urlToBestToken(url);
}

function getUnidadeIconToken(ingles) {
  if (!ingles?.trim()) return undefined;
  const slug = UNIDADE_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  return urlToBestToken(pickWithCivPrefix(slug, unitSlugToUrl));
}

function getConstrucaoIconToken(ingles) {
  if (!ingles?.trim()) return undefined;
  const slug = CONSTRUCAO_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  let u = pickWithCivPrefix(slug, buildingSlugToUrl);
  if (u) return urlToBestToken(u);
  if (slug === "ox") return urlToBestToken(villagerSlugToUrl.get("ox_cart"));
  return undefined;
}

function getMapaIconToken(ingles) {
  if (!ingles?.trim()) return undefined;
  const slug = MAPA_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  return urlToBestToken(mapSlugToUrl.get(slug));
}

function getAldeaoIconToken(ingles) {
  if (!ingles?.trim()) return undefined;
  const slug = ALDEAO_INGLES_TO_SLUG[ingles] ?? normalizeSlug(ingles);
  const direct = villagerSlugToUrl.get(slug);
  if (direct) return urlToBestToken(direct);
  return urlToBestToken(pickWithCivPrefix(slug, villagerSlugToUrl));
}

function getDeusIconToken(nome) {
  const s = resolveDeusIconSlug(nome);
  if (!s) return undefined;
  const u = urlByDeusSlug.get(s);
  return u ? urlToBestToken(u) : undefined;
}

// --- aplicação ---

function run() {
  const W = (name, f) => {
    const p = path.join(DATA, name);
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    const n = f(data);
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`${name}: ${n} registos (icon definido ou sobrescrito)`);
  };

  W("godpowers.json", (arr) => {
    let n = 0;
    for (const o of arr) {
      o.icon = getGodPowerIconToken(o.ingles) ?? null;
      if (o.icon) n += 1;
    }
    return n;
  });

  W("construcoes.json", (arr) => {
    let n = 0;
    for (const o of arr) {
      o.icon = getConstrucaoIconToken(o.ingles) ?? null;
      if (o.icon) n += 1;
    }
    return n;
  });

  W("unidades_aom.json", (arr) => {
    let n = 0;
    for (const o of arr) {
      o.icon = getUnidadeIconToken(o.ingles) ?? null;
      if (o.icon) n += 1;
    }
    return n;
  });

  W("mapas.json", (arr) => {
    let n = 0;
    for (const o of arr) {
      o.icon = getMapaIconToken(o.ingles) ?? null;
      if (o.icon) n += 1;
    }
    return n;
  });

  W("aldeoes.json", (arr) => {
    let n = 0;
    for (const o of arr) {
      o.icon = getAldeaoIconToken(o.ingles) ?? null;
      if (o.icon) n += 1;
    }
    return n;
  });

  W("deuses_aom.json", (arr) => {
    let n = 0;
    for (const o of arr) {
      o.icon = getDeusIconToken(o.nome) ?? null;
      if (o.icon) n += 1;
    }
    return n;
  });

  W("panteoes.json", (arr) => {
    for (const o of arr) {
      o.icon = PANTHEON_ID_TO_TOKEN[o.id] ?? null;
    }
    return arr.length;
  });

  W("eras.json", (arr) => {
    for (const o of arr) {
      o.icon = ERA_ID_TO_TOKEN[o.id] ?? null;
    }
    return arr.length;
  });
}

run();
