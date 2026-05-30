/**
 * Adiciona campo `slug` a cada start (titulo + authors). Colisões → -2, -3, …
 * Manter alinhado a `src/lib/startSlug.ts`.
 * node scripts/add-start-slugs.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { localePtPath } from "./data-paths.mjs";

const NOTION_TOKEN = /:[a-z0-9_-]+:/gi;

function slugifyStartSegment(raw) {
  const noTokens = raw.replace(NOTION_TOKEN, " ");
  return noTokens
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function buildStartSlug(s) {
  const title = slugifyStartSegment(s.titulo);
  const authors = (s.author ?? []).map((a) => slugifyStartSegment(a)).filter(Boolean);
  const authorJoined = authors.join("-");
  const combined = authorJoined ? `${title}-${authorJoined}` : title;
  return combined || "start";
}

const startsPath = localePtPath("starts_build_order.json");

const data = JSON.parse(readFileSync(startsPath, "utf8"));
const used = new Map();

for (const s of data) {
  const base = buildStartSlug(s);
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n++}`;
  }
  used.set(slug, true);
  s.slug = slug;
}

writeFileSync(startsPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("OK: slug em", data.length, "entradas");
