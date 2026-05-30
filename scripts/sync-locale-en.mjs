#!/usr/bin/env node
/**
 * Deep-merge estrutura PT → EN sem sobrescrever strings EN já traduzidas.
 * node scripts/sync-locale-en.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { LOCALE_PT, LOCALE_EN, LOCALE_JSON_FILES } from "./data-paths.mjs";
import { looksPortuguese } from "./lib/translate-pt-en.mjs";

function mergePtIntoEn(pt, en) {
  if (Array.isArray(pt)) {
    if (!Array.isArray(en)) return pt;
    return pt.map((item, i) => mergePtIntoEn(item, en[i]));
  }
  if (pt && typeof pt === "object") {
    const out = en && typeof en === "object" && !Array.isArray(en) ? { ...en } : {};
    for (const [k, v] of Object.entries(pt)) {
      const ev = out[k];
      if (v && typeof v === "object") {
        out[k] = mergePtIntoEn(v, ev);
      } else if (typeof v === "string") {
        if (typeof ev !== "string" || ev === v || (looksPortuguese(ev) && !looksPortuguese(v))) {
          out[k] = ev && typeof ev === "string" && ev !== v && !looksPortuguese(ev) ? ev : v;
        } else {
          out[k] = ev;
        }
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return en ?? pt;
}

fs.mkdirSync(LOCALE_EN, { recursive: true });

for (const file of LOCALE_JSON_FILES) {
  const pt = JSON.parse(fs.readFileSync(path.join(LOCALE_PT, file), "utf8"));
  const enPath = path.join(LOCALE_EN, file);
  const en = fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, "utf8")) : null;
  const merged = mergePtIntoEn(pt, en);
  fs.writeFileSync(enPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log("Synced", file);
}

console.log("Done.");
