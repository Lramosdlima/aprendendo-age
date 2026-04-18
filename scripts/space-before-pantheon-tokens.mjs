/**
 * "Grego:aomr_pantheon_..." → "Grego :aomr_pantheon_..." (espaço antes do token).
 * Só quando o carácter antes de `:` é letra Unicode — não altera "+2:aomr_pantheon_...".
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data");
/** `Grego:aomr_...` → `Grego :aomr_...` (espaço antes de `:aomr_pantheon_...:`). Não altera `+2:aomr_...`. */
const re = /([\p{L}]+)(:aomr_pantheon_[a-z_]+:)/gu;
const skip = new Set(["token_asset_map.json"]);

for (const name of fs.readdirSync(dataDir)) {
  if (!name.endsWith(".json") || skip.has(name)) continue;
  const fp = path.join(dataDir, name);
  let s = fs.readFileSync(fp, "utf8");
  const next = s.replace(re, "$1 $2");
  if (next !== s) {
    fs.writeFileSync(fp, next);
    console.log("updated", name);
  }
}
