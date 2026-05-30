/**
 * Migração: remove dos starts os tokens :aomr_*_icon: que agora são inferidos pelo texto.
 * Rode: node scripts/migrate-start-worker-text.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, "../src/data/locale/pt/starts_build_order.json");

/** Ordem: frases longas primeiro. */
const STRIPS = [
  [/Aldeões\s+iniciais\s*:aomr_villager_greek_icon:/gi, "Aldeões iniciais"],
  [/Aldeão\s+Inicial\s*:aomr_villager_greek_icon:/gi, "Aldeão Inicial"],
  [/Aldeões\s*:aomr_villager_greek_icon:/gi, "Aldeões"],
  [/Aldeão\s*:aomr_villager_greek_icon:/gi, "Aldeão"],

  [/Trabalhadores\s+Iniciais\s*:aomr_laborer_icon:/gi, "Trabalhadores Iniciais"],
  [/Trabalhador\s+Inicial\s*:aomr_laborer_icon:/gi, "Trabalhador Inicial"],
  [/Trabalhadores\s*:aomr_laborer_icon:/gi, "Trabalhadores"],
  [/Trabalhador\s*:aomr_laborer_icon:/gi, "Trabalhador"],

  [/Coletores\s+do\s+Ouro\s*:aomr_gatherer_icon:/gi, "Coletores do Ouro"],
  [/Coletor\s+do\s+Ouro\s*:aomr_gatherer_icon:/gi, "Coletor do Ouro"],
  [/Coletores\s+iniciais\s*:aomr_gatherer_icon:/gi, "Coletores iniciais"],
  [/Coletores\s+inicial\s*:aomr_gatherer_icon:/gi, "Coletores inicial"],
  [/Coletor\s+inicial\s*:aomr_gatherer_icon:/gi, "Coletor inicial"],
  [/Coletores\s*:aomr_gatherer_icon:/gi, "Coletores"],
  [/Coletor\s*:aomr_gatherer_icon:/gi, "Coletor"],

  [/Anões\s+iniciais\s*:aomr_dwarf_icon:/gi, "Anões iniciais"],
  [/Anões\s*:aomr_dwarf_icon:/gi, "Anões"],
  [/Anão\s*:aomr_dwarf_icon:/gi, "Anão"],

  [/Cidadão\s+Inicial\s*:aomr_citizen_icon:/gi, "Cidadão Inicial"],
  [/Cidadãos\s*:aomr_citizen_icon:/gi, "Cidadãos"],
  [/Cidadão\s*:aomr_citizen_icon:/gi, "Cidadão"],

  [/Camponeses\s+inicias\s*:aomr_peasant_icon:/gi, "Camponeses inicias"],
  [/Camponês\s+Inicial\s*:aomr_peasant_icon:/gi, "Camponês Inicial"],
  [/Camponeses\s+iniciais\s*:aomr_peasant_icon:/gi, "Camponeses iniciais"],
  [/Camponeses\s*:aomr_peasant_icon:/gi, "Camponeses"],
  [/Camponês\s*:aomr_peasant_icon:/gi, "Camponês"],

  [/Kuafu\s+inicial\s*:aomr_kuafu_icon:/gi, "Kuafu inicial"],
  [/Kuafus\s*:aomr_kuafu_icon:/gi, "Kuafus"],
  [/Kuafu\s*:aomr_kuafu_icon:/gi, "Kuafu"],

  [/Plebeus\s+Iniciais\s*:aomr_commoner_icon:/gi, "Plebeus Iniciais"],
  [/Plebeu\s+Inicial\s*:aomr_commoner_icon:/gi, "Plebeu Inicial"],
  [/Plebeus\s*:aomr_commoner_icon:/gi, "Plebeus"],
  [/Plebeu\s*:aomr_commoner_icon:/gi, "Plebeu"],

  [/Colonos\s*:aomr_settler_icon:/gi, "Colonos"],
  [/Colono\s*:aomr_settler_icon:/gi, "Colono"],

  [/Rebalanceie os Aldeões imediatamente\s*:aomr_villager_greek_icon:/gi, "Rebalanceie os Aldeões imediatamente"],
  [/Rebalanceie as Coletores imediatamente\s*:aomr_gatherer_icon:/gi, "Rebalanceie as Coletores imediatamente"],
  [/Rebalanceie os Camponeses imediatamente\s*:aomr_peasant_icon:/gi, "Rebalanceie os Camponeses imediatamente"],
  [/Rebalanceie as Coletores e Anões imediatamente\s*:aomr_gatherer_icon:\s*:aomr_dwarf_icon:/gi, "Rebalanceie as Coletores e Anões imediatamente"],

  [/<\/strong><strong>:aomr_citizen_icon:<\/strong><strong>:<\/strong>/gi, "</strong>"],
  [/<\/strong><strong>:aomr_citizen_icon:<\/strong>/gi, "</strong>"],
  [/<\/strong>\s*:aomr_commoner_icon:/gi, "</strong>"],
];

function walk(v) {
  if (typeof v === "string") {
    let t = v;
    for (const [re, rep] of STRIPS) {
      t = t.replace(re, rep);
    }
    return t;
  }
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v)) out[k] = walk(v[k]);
    return out;
  }
  return v;
}

const data = JSON.parse(readFileSync(jsonPath, "utf8"));
writeFileSync(jsonPath, `${JSON.stringify(walk(data), null, 2)}\n`, "utf8");
console.log("OK worker strip:", jsonPath);
