#!/usr/bin/env node
/**
 * Traduz locale/pt → locale/en via Google Translate (cache + tokens).
 * Apenas campos de prose — nomes usam `ingles` quando disponível.
 * node scripts/translate-locale-en-api.mjs [--file godpowers.json]
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

const PROSE_KEYS = new Set([
  "titulo",
  "descricao_curta",
  "descricao_resumida",
  "descricao_avancada",
  "description",
  "hint",
  "text",
  "texto",
  "beneficia",
  "foco",
  "hierarquia",
  "forte_contra",
  "fraco_contra",
  "counter_de",
  "requisitos_para_subir_de_era",
  "origem",
  "tipo",
  "todas_as_tecnologias",
  "tecnologias",
  "unidades",
  "panteao",
  "era",
  "pantheon",
]);

function isProseKey(k) {
  return (
    PROSE_KEYS.has(k) ||
    k.startsWith("descricao") ||
    k.startsWith("no_oasis") ||
    k.includes("trabalhador") ||
    k.includes("requisitos")
  );
}

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
  if (!text?.trim() || !looksPortuguese(text)) return text;
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

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function processNode(node, key = null) {
  if (Array.isArray(node)) {
    if (key === "campo" || key === "itens") {
      return Promise.all(
        node.map((item) => (typeof item === "string" ? translateText(item) : processNode(item, null))),
      );
    }
    return Promise.all(node.map((item) => processNode(item, null)));
  }
  if (node && typeof node === "object") {
    const entries = Object.entries(node);
    const results = await Promise.all(
      entries.map(async ([k, v]) => {
        if (k === "ingles") return [k, v];
        if (k === "nome" && typeof node.ingles === "string" && node.ingles.trim()) {
          return [k, node.ingles];
        }
        if (typeof v === "string" && isProseKey(k)) {
          return [k, await translateText(v)];
        }
        return [k, await processNode(v, k)];
      }),
    );
    return Object.fromEntries(results);
  }
  return node;
}

const fileArg = process.argv.indexOf("--file");
const onlyFile = fileArg >= 0 ? process.argv[fileArg + 1] : null;
const files = onlyFile ? [onlyFile] : LOCALE_JSON_FILES;

fs.mkdirSync(LOCALE_EN, { recursive: true });

for (const file of files) {
  console.log("Translating", file, "...");
  const enPath = path.join(LOCALE_EN, file);
  const base = fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, "utf8")) : null;
  const pt = JSON.parse(fs.readFileSync(path.join(LOCALE_PT, file), "utf8"));

  // Merge: keep structure from PT, apply nome from ingles, translate prose from PT
  const out = await processNode(pt);
  fs.writeFileSync(enPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  saveCache();
  console.log("Wrote", file);
  await delay(500);
}

console.log("Done. Cache:", Object.keys(cache).length);
