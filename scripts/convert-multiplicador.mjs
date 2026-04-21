/**
 * One-off: reescreve `multiplicador` em `unidades_aom.json` para array estruturado.
 * Executar da raiz do pacote: `node scripts/convert-multiplicador.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "..", "src", "data", "unidades_aom.json");

const PANTHEON_PT = {
  greeks: "Grego",
  egyptians: "Egípcio",
  norse: "Nórdico",
  atlanteans: "Atlante",
  chinese: "Chinês",
  japanese: "Japonês",
  azteca: "Asteca",
};

const TYPE_SLUG_PT = {
  archer: "Artilharia",
  infantry: "Infantaria",
  cavalry: "Cavalaria",
  building: "Construção",
  myth_unit: "Unidade mítica",
  hero: "Herói",
  ship: "Navio",
  siege_ship: "Navio de cerco",
  siege_weapon: "Arma de cerco",
  flying_unit: "Unidade voadora",
  titan: "Titã",
  tower: "Torre",
  wall: "Muralha",
  villager: "Aldeão",
  human_soldier: "Soldado humano",
  close_combat_ship: "Navio de combate corpo a corpo",
  archer_ship: "Navio arqueiro",
};

function typeFromIcon(icon) {
  const k = icon.toLowerCase().trim();
  const pant = /^aomr_pantheon_([a-z]+)_icon$/.exec(k);
  if (pant?.[1]) {
    return (
      PANTHEON_PT[pant[1]] ??
      pant[1].charAt(0).toUpperCase() + pant[1].slice(1)
    );
  }
  const unit = /^aomr_type_([a-z0-9_]+)_icon$/.exec(k);
  if (unit?.[1]) {
    return TYPE_SLUG_PT[unit[1]] ?? unit[1].replace(/_/g, " ");
  }
  return k.replace(/^aomr_/, "").replace(/_icon$/i, "").replace(/_/g, " ");
}

/** Converte cauda após `:`token:` para `value` canónico quando é multiplicador simples. */
function tailToValue(tail) {
  const t = tail.trim();
  const mx = /^(\d+(?:[.,]\d+)?)\s*([xX])(.*)$/.exec(t);
  if (mx) {
    const rest = (mx[3] ?? "").trim();
    if (!rest) {
      return (mx[1] ?? "").replace(",", ".");
    }
  }
  return t;
}

function parseStructuredSegment(seg) {
  const s = seg.trim();
  const firstTok = s.search(/:aomr_/);
  if (firstTok > 0) {
    return [{ type: "Texto", icon: "", value: s }];
  }

  const re = /:(aomr_[a-z0-9_-]+):([\s\S]*?)(?=:(?=aomr_)|$)/gi;
  const matches = [...s.matchAll(re)];
  if (matches.length === 0) {
    return [{ type: "Texto", icon: "", value: s }];
  }

  return matches.map((m) => {
    const icon = m[1] ?? "";
    const tail = (m[2] ?? "").trim();
    return {
      type: typeFromIcon(icon),
      icon,
      value: tailToValue(tail),
    };
  });
}

function stringToItems(str) {
  const s = typeof str === "string" ? str.trim() : "";
  if (s === "" || s === "-") {
    return [];
  }

  const chunks = s.split(/\s*\|\|\s*/).map((c) => c.trim());
  const out = [];
  for (const chunk of chunks) {
    out.push(...parseStructuredSegment(chunk));
  }
  return out;
}

const raw = fs.readFileSync(jsonPath, "utf8");
const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  throw new Error("unidades_aom.json deve ser um array.");
}

const sample = data.find((r) => r && Array.isArray(r.multiplicador));
if (sample) {
  console.error(
    "Nada a fazer: `multiplicador` já parece ser um array (ex.: id",
    sample.id,
    "). Restaure o JSON em formato string antes de correr este script.",
  );
  process.exit(1);
}

for (const row of data) {
  if (!Object.prototype.hasOwnProperty.call(row, "multiplicador")) continue;
  row.multiplicador = stringToItems(row.multiplicador);
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("OK:", jsonPath, "unidades:", data.length);
