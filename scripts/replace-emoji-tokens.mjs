/**
 * Substitui emojis que antes eram tratados em emojiTypeIcons.tsx por :tokens:
 * (executar a partir da raiz do projeto: node scripts/replace-emoji-tokens.mjs)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data");

/**
 * Ordem: sequências mais longas primeiro.
 * - ⚔/🔪 = infantaria (`aomr_type_infantry_icon`); ⚡ = panteão grego (`aomr_pantheon_greeks_icon`), não infantaria.
 * - 💀 omitido — uso ambíguo (morte vs Asteca).
 */
const REPLACEMENTS = [
  ["\u2601\uFE0F", ":aomr_type_flying_unit_icon:"],
  ["\u26E9\uFE0F", ":aomr_pantheon_japanese_icon:"],
  ["⚔", ":aomr_type_infantry_icon:"],
  ["🔪", ":aomr_type_infantry_icon:"],
  ["🏹", ":aomr_type_archer_icon:"],
  ["🏇", ":aomr_type_cavalry_icon:"],
  ["🐴", ":aomr_type_cavalry_icon:"],
  ["🐲", ":aomr_type_myth_unit_icon:"],
  ["🛡", ":aomr_type_human_soldier_icon:"],
  ["⭐", ":aomr_type_hero_icon:"],
  ["💥", ":aomr_type_siege_weapon_icon:"],
  ["🏠", ":aomr_type_building_icon:"],
  ["🏘", ":aomr_type_building_icon:"],
  ["⚡", ":aomr_pantheon_greeks_icon:"],
  ["🐍", ":aomr_pantheon_egyptians_icon:"],
  ["🐺", ":aomr_pantheon_norse_icon:"],
  ["🌌", ":aomr_pantheon_atlanteans_icon:"],
  ["🐉", ":aomr_pantheon_chinese_icon:"],
  ["⛩", ":aomr_pantheon_japanese_icon:"],
  ["☁", ":aomr_type_flying_unit_icon:"],
];

function replaceInString(s) {
  let out = s;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

const skip = new Set(["token_asset_map.json"]);

for (const name of fs.readdirSync(dataDir)) {
  if (!name.endsWith(".json") || skip.has(name)) continue;
  const fp = path.join(dataDir, name);
  const raw = fs.readFileSync(fp, "utf8");
  const next = replaceInString(raw);
  if (next !== raw) {
    fs.writeFileSync(fp, next, "utf8");
    console.log("updated", name);
  }
}
