/**
 * Mantém os 6 primeiros starts (ids 1–6); reordena do 7º em diante por panteão
 * (Grego → Egípcio → Nórdico → Atlante → Chinês → Japonês → Astecas).
 * Dentro de cada panteão, preserva a ordem anterior (por id).
 * node scripts/reorder-starts-tail-by-pantheon.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const startsPath = join(__dirname, "..", "src/data/locale/pt/starts_build_order.json");

/** Alinhado a `panteoes.json` / campo `pantheon` nos starts */
const PANTHEON_ORDER = [
  "Grego",
  "Egípcio",
  "Nórdico",
  "Atlante",
  "Chinês",
  "Japonês",
  "Astecas",
];

function rank(pantheon) {
  const i = PANTHEON_ORDER.indexOf(pantheon);
  return i === -1 ? PANTHEON_ORDER.length : i;
}

const starts = JSON.parse(readFileSync(startsPath, "utf8"));
if (starts.length < 7) {
  console.error("Esperado pelo menos 7 starts.");
  process.exit(1);
}

const firstSix = starts.slice(0, 6);
const rest = starts.slice(6);

rest.sort((a, b) => {
  const ra = rank(a.pantheon);
  const rb = rank(b.pantheon);
  if (ra !== rb) return ra - rb;
  return a.id - b.id;
});

const reordered = [...firstSix, ...rest];
let id = 1;
for (const s of reordered) {
  s.id = id++;
}

writeFileSync(startsPath, JSON.stringify(reordered, null, 2) + "\n", "utf8");
console.log("OK: tail reordered by pantheon, ids 1.." + (id - 1));
