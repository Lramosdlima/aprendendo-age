/**
 * Migração única: remove highlight + :token: legados dos quatro recursos no starts_build_order.json,
 * deixando só as palavras (comida, madeira, ouro, favor) — a UI expande de novo na renderização.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, "../src/data/starts_build_order.json");

function stripLegacyResourceMarkup(text) {
  let t = text;
  t = t.replace(
    /<highlight-brown>([^<]*)<\/highlight-brown><highlight-brown>:woodaom:<\/highlight-brown>/gi,
    "$1",
  );
  t = t.replace(/<highlight-red>([^<]*)<\/highlight-red>\s*:foodaom:/gi, "$1");
  t = t.replace(/<highlight-brown>([^<]*)<\/highlight-brown>\s*:woodaom:/gi, "$1");
  t = t.replace(/<highlight-yellow>([^<]*)<\/highlight-yellow>\s*:goldaom:/gi, "$1");
  t = t.replace(/<highlight-blue>([^<]*)<\/highlight-blue>\s*:favoraom:/gi, "$1");
  return t;
}

function walk(v) {
  if (typeof v === "string") return stripLegacyResourceMarkup(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v)) {
      out[k] = walk(v[k]);
    }
    return out;
  }
  return v;
}

const raw = readFileSync(jsonPath, "utf8");
const data = JSON.parse(raw);
const next = walk(data);
writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log("OK:", jsonPath);
