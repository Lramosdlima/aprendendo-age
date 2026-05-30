#!/usr/bin/env node
/**
 * Lista strings EN ainda em português (idênticas ao PT ou com indicadores PT).
 * node scripts/extract-untranslated.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALE_PT, LOCALE_EN, LOCALE_JSON_FILES } from "./data-paths.mjs";
import { looksPortuguese } from "./lib/translate-pt-en.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKIP_KEYS = new Set([
  "slug",
  "icon",
  "image",
  "imageUrl",
  "youtube",
  "status",
  "author",
  "id",
  "name",
  "tag",
  "logoSrc",
  "incremento_por_uso",
  "ingles",
  "cooldown_seg",
  "duracao_no_mapa_seg",
  "custo_repetir",
  "comida",
  "madeira",
  "ouro",
  "favor",
  "tempo_s",
  "tempo_seg",
  "tempo_treinamento",
  "populacao",
  "food",
  "wood",
  "gold",
  "pop",
  "type",
  "value",
]);

const PROPER_NAMES = /Huehuecóyotl|Sessrúmnir|Táowù|Malinalxochitl|Patecatl|Tlálocan/i;

function shouldFlag(pt, en, key) {
  if (SKIP_KEYS.has(key)) return false;
  if (typeof pt !== "string" || typeof en !== "string") return false;
  if (PROPER_NAMES.test(pt) && PROPER_NAMES.test(en)) return false;
  if (pt.trim() === en.trim()) {
    if (!looksPortuguese(pt)) return false;
    if (!/[àáâãéêíóôõúç]/i.test(pt)) return false;
    return true;
  }
  if (!looksPortuguese(en)) return false;
  const ptAccents = /[àáâãéêíóôõúç]/i.test(pt);
  const enAccents = /[àáâãéêíóôõúç]/i.test(en);
  if (ptAccents && enAccents) return true;
  const ptWords = /\b(com|para|não|você|aldeão|aldeões|constru|treine|templo|sequência|início|subindo|plebeu)\b/i.test(pt);
  const enWords = /\b(com|para|não|você|aldeão|aldeões|constru|treine|templo|sequência|início|subindo|plebeu)\b/i.test(en);
  return ptWords && enWords;
}

const report = [];

function walk(pt, en, filePath, jsonPath = "") {
  if (typeof pt === "string" && typeof en === "string") {
    const key = jsonPath.split(".").pop()?.replace(/\[\d+\]$/, "") ?? "";
    if (shouldFlag(pt, en, key)) {
      report.push({ file: filePath, path: jsonPath, pt, en });
    }
    return;
  }
  if (Array.isArray(pt) && Array.isArray(en)) {
    pt.forEach((item, i) => walk(item, en[i], filePath, `${jsonPath}[${i}]`));
    return;
  }
  if (pt && typeof pt === "object" && en && typeof en === "object") {
    for (const k of Object.keys(pt)) {
      walk(pt[k], en[k], filePath, jsonPath ? `${jsonPath}.${k}` : k);
    }
  }
}

for (const file of LOCALE_JSON_FILES) {
  const pt = JSON.parse(fs.readFileSync(path.join(LOCALE_PT, file), "utf8"));
  const enPath = path.join(LOCALE_EN, file);
  if (!fs.existsSync(enPath)) {
    report.push({ file, path: "(missing en file)", pt: "", en: "" });
    continue;
  }
  const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
  walk(pt, en, file);
}

const outPath = path.join(__dirname, "locale-untranslated-report.json");
fs.writeFileSync(outPath, JSON.stringify({ count: report.length, items: report }, null, 2) + "\n", "utf8");

console.log(`Untranslated/PT-like strings: ${report.length}`);
console.log(`Report: ${outPath}`);

if (report.length > 0) {
  const byFile = {};
  for (const r of report) byFile[r.file] = (byFile[r.file] ?? 0) + 1;
  console.log("By file:", byFile);
  process.exitCode = 1;
}
