/**
 * Reordena os 6 primeiros starts (civis), renumer ids, god -> string[],
 * resolve pantheon a partir de panteoes.json.
 * Executar: node scripts/rebuild-starts-build-order.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const startsPath = join(root, "src/data/starts_build_order.json");
const panteoesPath = join(root, "src/data/panteoes.json");

function norm(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function expandDeuses(deusesStr) {
  if (!deusesStr || typeof deusesStr !== "string") return [];
  const out = [];
  for (const part of deusesStr.split(",")) {
    const p = part.trim();
    if (!p) continue;
    for (const sub of p.split("/")) {
      const t = sub.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

/** @param {string} g @param {string} candidate */
function nameMatch(g, candidate) {
  const a = norm(g);
  const b = norm(candidate);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return true;
  return false;
}

/**
 * Panteão Astecas inclui "Zeus" (DLC); não usar para tint dos starts principais.
 * @param {string[]} gods
 * @param {Array<{ id: number, nome: string, deuses?: string }>} panteoes
 */
function resolvePantheon(gods, panteoes) {
  const ordered = [...panteoes].filter((p) => p.nome !== "Astecas").sort((a, b) => a.id - b.id);
  for (const god of gods) {
    for (const p of ordered) {
      if (nameMatch(god, p.nome)) return p.nome;
      const deusList = expandDeuses(p.deuses ?? "");
      for (const d of deusList) {
        if (nameMatch(god, d)) return p.nome;
      }
    }
  }
  return undefined;
}

function godStringToArray(god) {
  if (Array.isArray(god)) return god.map((x) => String(x).trim()).filter(Boolean);
  if (typeof god !== "string") return [];
  return god
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

const starts = JSON.parse(readFileSync(startsPath, "utf8"));
const panteoes = JSON.parse(readFileSync(panteoesPath, "utf8"));

const TITULO_GREGOS_MAR = "Gregos (Mar 🌊:aomr_type_ship_icon:)";

/** Ordem pedida: Gregos, Egípcios, Nórdicos, Atlantes, Chineses, Gregos (Mar) — não há entrada "Japoneses". */
const FIRST_SIX_TITLES = [
  "Gregos",
  "Egípcios",
  "Nórdicos",
  "Atlantes",
  "Chineses",
  TITULO_GREGOS_MAR,
];

function takeByTitulo(arr, titulo) {
  const i = arr.findIndex((s) => s.titulo === titulo);
  if (i === -1) throw new Error(`Título não encontrado: ${titulo}`);
  const [x] = arr.splice(i, 1);
  return x;
}

const pool = [...starts];
const firstSix = [];
for (const t of FIRST_SIX_TITLES) {
  firstSix.push(takeByTitulo(pool, t));
}

pool.sort((a, b) => a.id - b.id);
const reordered = [...firstSix, ...pool];

let id = 1;
for (const s of reordered) {
  s.id = id++;
  s.god = godStringToArray(s.god);
  const pant = resolvePantheon(s.god, panteoes);
  if (pant) s.pantheon = pant;
  else delete s.pantheon;
}

writeFileSync(startsPath, JSON.stringify(reordered, null, 2) + "\n", "utf8");
console.log("OK:", reordered.length, "starts, ids 1.." + (id - 1));
