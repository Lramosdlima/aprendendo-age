#!/usr/bin/env node
/**
 * Sincroniza nomes de eras e panteões em referências `{ id, nome }` (e strings
 * derivadas) nos JSON EN, usando `locale/en/eras.json` e `locale/en/panteoes.json`
 * como fonte canônica.
 *
 * node scripts/sync-en-catalog-refs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { LOCALE_EN, LOCALE_PT, LOCALE_JSON_FILES } from "./data-paths.mjs";
import glossary from "./locale-glossary.json" with { type: "json" };

const PANTHEON_GLOSSARY = glossary.exact ?? {};
const REF_ARRAY_KEYS = new Set(["panteao", "panteoes", "era", "eras"]);

function readJson(file, localeDir) {
  return JSON.parse(fs.readFileSync(path.join(localeDir, file), "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(LOCALE_EN, file), JSON.stringify(data, null, 2) + "\n", "utf8");
}

function extractTokens(text) {
  return String(text ?? "").match(/(:[a-z0-9_-]+:)/gi) ?? [];
}

function formatCatalogNome(catalogEntry, ptText, enText) {
  const base = catalogEntry?.nome;
  if (!base) return enText;

  const tokens = extractTokens(enText);
  if (tokens.length === 0) {
    const ptTokens = extractTokens(ptText);
    if (ptTokens.length > 0) {
      if (catalogEntry.icon && !ptTokens.some((t) => t.includes(catalogEntry.icon))) {
        return `${base} :${catalogEntry.icon}:`;
      }
      return `${base} ${ptTokens.join(" ")}`.trim();
    }
  } else {
    return `${base} ${tokens.join(" ")}`.trim();
  }
  return base;
}

function fixPantheonMasterNames(panteoes) {
  let changed = 0;
  for (const row of panteoes) {
    if (row.id == null || typeof row.nome !== "string") continue;
    const translated = PANTHEON_GLOSSARY[row.nome] ?? row.nome;
    if (translated !== row.nome) {
      row.nome = translated;
      changed++;
    }
  }
  return changed;
}

function buildLookups(eras, panteoes) {
  const eraById = new Map(eras.map((e) => [e.id, e]));
  const panteaoById = new Map(panteoes.map((p) => [p.id, p]));
  const panteaoByIcon = new Map(
    panteoes.filter((p) => p.icon).map((p) => [p.icon, p]),
  );
  return { eraById, panteaoById, panteaoByIcon };
}

function syncRefArray(arr, lookup, ptArr) {
  if (!Array.isArray(arr)) return 0;
  let changed = 0;
  for (let i = 0; i < arr.length; i++) {
    const ref = arr[i];
    if (!ref || ref.id == null || typeof ref.nome !== "string") continue;
    const catalog = lookup.get(ref.id);
    if (!catalog) continue;
    const ptNome = ptArr?.[i]?.nome;
    const next = formatCatalogNome(catalog, ptNome, ref.nome);
    if (next !== ref.nome) {
      ref.nome = next;
      changed++;
    }
  }
  return changed;
}

function syncNode(enNode, ptNode, lookups, stats) {
  if (Array.isArray(enNode)) {
    if (!Array.isArray(ptNode)) ptNode = [];
    for (let i = 0; i < enNode.length; i++) {
      syncNode(enNode[i], ptNode[i], lookups, stats);
    }
    return;
  }

  if (!enNode || typeof enNode !== "object") return;

  for (const key of REF_ARRAY_KEYS) {
    if (!Array.isArray(enNode[key])) continue;
    const lookup = key === "era" || key === "eras" ? lookups.eraById : lookups.panteaoById;
    stats.changed += syncRefArray(enNode[key], lookup, ptNode?.[key]);
  }

  if (typeof enNode.panteao === "string" && enNode.panteao_id != null) {
    const catalog = lookups.panteaoById.get(enNode.panteao_id);
    if (catalog) {
      const next = formatCatalogNome(catalog, ptNode?.panteao, enNode.panteao);
      if (next !== enNode.panteao) {
        enNode.panteao = next;
        stats.changed++;
      }
    }
  }

  if (typeof enNode.era === "string" && enNode.era_id != null) {
    const catalog = lookups.eraById.get(enNode.era_id);
    if (catalog) {
      const next = formatCatalogNome(catalog, ptNode?.era, enNode.era);
      if (next !== enNode.era) {
        enNode.era = next;
        stats.changed++;
      }
    }
  }

  if (typeof enNode.pantheon === "string" && enNode.image) {
    const iconKey = String(enNode.image).replace(/^:/, "").replace(/:$/, "");
    const catalog = lookups.panteaoByIcon.get(iconKey);
    if (catalog) {
      const next = formatCatalogNome(catalog, ptNode?.pantheon, enNode.pantheon);
      if (next !== enNode.pantheon) {
        enNode.pantheon = next;
        stats.changed++;
      }
    } else {
      const translated = PANTHEON_GLOSSARY[enNode.pantheon] ?? enNode.pantheon;
      if (translated !== enNode.pantheon) {
        enNode.pantheon = translated;
        stats.changed++;
      }
    }
  }

  for (const [k, v] of Object.entries(enNode)) {
    if (REF_ARRAY_KEYS.has(k)) continue;
    if (k === "panteao" && typeof v === "string") continue;
    if (k === "era" && typeof v === "string") continue;
    if (k === "pantheon" && typeof v === "string") continue;
    syncNode(v, ptNode?.[k], lookups, stats);
  }
}

const eras = readJson("eras.json", LOCALE_EN);
let panteoes = readJson("panteoes.json", LOCALE_EN);
const masterPantheonFixes = fixPantheonMasterNames(panteoes);
writeJson("panteoes.json", panteoes);

const lookups = buildLookups(eras, panteoes);
let totalChanged = masterPantheonFixes;

for (const file of LOCALE_JSON_FILES) {
  if (file === "eras.json") continue;

  const enPath = path.join(LOCALE_EN, file);
  const ptPath = path.join(LOCALE_PT, file);
  if (!fs.existsSync(enPath) || !fs.existsSync(ptPath)) continue;

  const en = readJson(file, LOCALE_EN);
  const pt = readJson(file, LOCALE_PT);
  const stats = { changed: 0 };
  syncNode(en, pt, lookups, stats);

  if (stats.changed > 0) {
    writeJson(file, en);
    console.log(`${file}: ${stats.changed} ref(s) updated`);
    totalChanged += stats.changed;
  }
}

console.log(`Done. ${totalChanged} name(s) synced from EN catalogs.`);
