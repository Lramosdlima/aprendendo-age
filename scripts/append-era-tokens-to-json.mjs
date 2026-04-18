/**
 * Anexa `:aomr_*_age_icon:` aos campos `era` e `eras` (nome da era em eras.json).
 * Executar na raiz: node scripts/append-era-tokens-to-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data");

const ERA_NAME_TO_TOKEN = {
  Arcaica: "aomr_archaic_age_icon",
  Clássica: "aomr_classical_age_icon",
  Heróica: "aomr_heroic_age_icon",
  Mítica: "aomr_mythic_age_icon",
  Maravilha: "aomr_wonder_age_icon",
};

const FILES = ["construcoes.json", "unidades_aom.json", "godpowers.json", "deuses_aom.json", "tecnologias.json"];

function appendEraTokens(str) {
  let out = str;
  for (const [nome, token] of Object.entries(ERA_NAME_TO_TOKEN)) {
    const suffix = ` :${token}:`;
    const needle = `"${nome}"`;
    // "era": "Clássica" → "era": "Clássica :aomr_classical_age_icon:"
    out = out.replaceAll(`"era": ${needle}`, `"era": "${nome}${suffix}"`);
    out = out.replaceAll(`"eras": ${needle}`, `"eras": "${nome}${suffix}"`);
  }
  return out;
}

for (const name of FILES) {
  const fp = path.join(dataDir, name);
  if (!fs.existsSync(fp)) continue;
  const raw = fs.readFileSync(fp, "utf8");
  const next = appendEraTokens(raw);
  if (next !== raw) {
    fs.writeFileSync(fp, next);
    console.log("updated", name);
  }
}
