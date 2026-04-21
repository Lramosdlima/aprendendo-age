/**
 * Converte `tipo` string → array `{ type, icon }` em `unidades_aom.json`.
 * `node scripts/convert-unidade-tipo.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "..", "src", "data", "unidades_aom.json");

function parseTipoString(str) {
  if (typeof str !== "string" || str.trim() === "") return [];
  const parts = str.split(", ").map((p) => p.trim()).filter(Boolean);
  const out = [];
  for (const seg of parts) {
    const m = /^(.+?)\s+:([a-z0-9_-]+):\s*$/i.exec(seg);
    if (m) {
      out.push({ type: (m[1] ?? "").trim(), icon: (m[2] ?? "").trim() });
    } else {
      out.push({ type: seg, icon: "" });
    }
  }
  return out;
}

const raw = fs.readFileSync(jsonPath, "utf8");
const data = JSON.parse(raw);
if (!Array.isArray(data)) throw new Error("Esperado array.");

const sample = data.find((r) => r && Array.isArray(r.tipo));
if (sample) {
  console.error("tipo já é array (ex. id", sample.id, "). Abortar.");
  process.exit(1);
}

for (const row of data) {
  if (!Object.prototype.hasOwnProperty.call(row, "tipo")) continue;
  row.tipo = parseTipoString(row.tipo);
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("OK", jsonPath, data.length);
