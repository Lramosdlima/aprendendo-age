#!/usr/bin/env node
/** Apply glossary + phrase fixes to all strings in locale/en JSON files. */
import fs from "node:fs";
import path from "node:path";
import { LOCALE_EN, LOCALE_JSON_FILES } from "./data-paths.mjs";
import { translateString as applyGlossary } from "./lib/translate-pt-en.mjs";

const EXTRA = {
  "Patrocínio Argivo": "Argive Patronage",
  Jazão: "Jason",
  Hélios: "Helios",
  "Dísablót": "Disblot",
  "Mina Enânica": "Dwarven Mine",
  Herlíquias: "Relics",
  Licaão: "Lycaon",
  Néftis: "Nepthys",
  Valquíria: "Valkyrie",
  Autômato: "Automaton",
  Mirmidão: "Myrmidon",
  Gastrafeta: "Gastraphetes",
  "Plebeu da madeira": "Wood Villager",
  "Sarcerdote de Guerra": "War Priest",
  "Pioneiros de Pã": "Pan's Pioneers",
  "Pilar de Tlaloc": "Pillar of Tlalocan",
  "Ideal: Passe no tempo de 3-5 minutos!": "Ideal: Age up in 3-5 minutes!",
  "Ideal: tempo de 8-10 minutos!": "Ideal: time of 8-10 minutes!",
};

function fixString(s) {
  if (typeof s !== "string") return s;
  let out = s;
  for (const [from, to] of Object.entries(EXTRA)) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return applyGlossary(out);
}

function walk(node) {
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = typeof v === "string" ? fixString(v) : walk(v);
    }
    return out;
  }
  return node;
}

for (const file of LOCALE_JSON_FILES) {
  const p = path.join(LOCALE_EN, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  fs.writeFileSync(p, JSON.stringify(walk(data), null, 2) + "\n", "utf8");
  console.log("Glossary applied:", file);
}
