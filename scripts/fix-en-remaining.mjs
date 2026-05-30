#!/usr/bin/env node
/**
 * Segunda passagem: traduz no EN qualquer string ainda igual ao PT ou com PT residual.
 * node scripts/fix-en-remaining.mjs [--file deuses_aom.json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translate } from "google-translate-api-x";
import { LOCALE_PT, LOCALE_EN, LOCALE_JSON_FILES } from "./data-paths.mjs";
import { looksPortuguese, translateString as glossaryTranslate } from "./lib/translate-pt-en.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, ".translate-cache.json");
const TOKEN_RE = /(:[a-z0-9_-]+:|<\/?(?:highlight(?:-[a-z]+)?|strong|code|em|a)[^>]*>)/gi;

const SKIP_KEYS = new Set([
  "slug",
  "icon",
  "image",
  "imageUrl",
  "youtube",
  "status",
  "id",
  "name",
  "tag",
  "logoSrc",
  "incremento_por_uso",
  "cooldown_seg",
  "duracao_no_mapa_seg",
  "custo_repetir",
  "comida",
  "madeira",
  "ouro",
  "favor",
  "tempo_s",
  "tempo_seg",
  "food",
  "wood",
  "gold",
  "pop",
  "type",
  "value",
  "author",
  "ingles",
  "imageUrl",
]);

let cache = {};
if (fs.existsSync(CACHE_PATH)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    cache = {};
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf8");
}

function protectTokens(text) {
  const slots = [];
  const out = text.replace(TOKEN_RE, (m) => {
    slots.push(m);
    return `__TOK${slots.length - 1}__`;
  });
  return { out, slots };
}

function restoreTokens(text, slots) {
  return text.replace(/__TOK(\d+)__/g, (_, i) => slots[Number(i)] ?? "");
}

async function translateText(text) {
  if (!text?.trim()) return text;
  if (cache[text]) return cache[text];
  const { out, slots } = protectTokens(text);
  let translated = out;
  try {
    const res = await translate(out, { from: "pt", to: "en" });
    translated = res.text;
  } catch {
    translated = glossaryTranslate(out);
  }
  translated = glossaryTranslate(restoreTokens(translated, slots));
  cache[text] = translated;
  return translated;
}

async function fixPair(pt, en, key) {
  if (SKIP_KEYS.has(key)) return en;
  if (typeof pt === "string" && typeof en === "string") {
    if (pt === en && looksPortuguese(pt)) return translateText(pt);
    if (pt !== en && looksPortuguese(en)) return translateText(en);
    return en;
  }
  if (Array.isArray(pt) && Array.isArray(en)) {
    const out = [];
    for (let i = 0; i < pt.length; i++) {
      out.push(await fixPair(pt[i], en[i], key));
    }
    return out;
  }
  if (pt && typeof pt === "object" && en && typeof en === "object" && !Array.isArray(pt)) {
    const out = { ...en };
    for (const k of Object.keys(pt)) {
      if (k === "nome" && typeof pt.nome === "string" && typeof pt.ingles === "string" && pt.ingles.trim()) {
        out.nome = pt.ingles;
        out.ingles = pt.ingles;
        continue;
      }
      out[k] = await fixPair(pt[k], en[k], k);
    }
    return out;
  }
  return en;
}

const fileArg = process.argv.indexOf("--file");
const onlyFile = fileArg >= 0 ? process.argv[fileArg + 1] : null;
const files = onlyFile ? [onlyFile] : LOCALE_JSON_FILES;

for (const file of files) {
  console.log("Fixing", file);
  const pt = JSON.parse(fs.readFileSync(path.join(LOCALE_PT, file), "utf8"));
  const en = JSON.parse(fs.readFileSync(path.join(LOCALE_EN, file), "utf8"));
  const fixed = await fixPair(pt, en, null);
  fs.writeFileSync(path.join(LOCALE_EN, file), JSON.stringify(fixed, null, 2) + "\n", "utf8");
  saveCache();
  console.log("Wrote", file);
}

console.log("Done.");
