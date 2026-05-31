import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_ROOT = path.resolve(__dirname, "../src/data");
export const LOCALE_PT = path.join(DATA_ROOT, "locale/pt");
export const LOCALE_EN = path.join(DATA_ROOT, "locale/en");
export const TOKEN_MAP = path.join(DATA_ROOT, "token_asset_map.json");

export const LOCALE_JSON_FILES = [
  "aldeoes.json",
  "construcoes.json",
  "deuses_aom.json",
  "eras.json",
  "godpowers.json",
  "mapas.json",
  "panteoes.json",
  "starts_build_order.json",
  "tecnologias.json",
  "unidades_aom.json",
];

export function localePtPath(file) {
  return path.join(LOCALE_PT, file);
}

export function localeEnPath(file) {
  return path.join(LOCALE_EN, file);
}
