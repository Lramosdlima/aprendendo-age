#!/usr/bin/env node
/**
 * Gera locale/en/*.json a partir de locale/pt com tradução completa.
 * node scripts/translate-locale-en.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { LOCALE_PT, LOCALE_EN, LOCALE_JSON_FILES } from "./data-paths.mjs";
import { localizeNode } from "./lib/translate-pt-en.mjs";

fs.mkdirSync(LOCALE_EN, { recursive: true });

for (const file of LOCALE_JSON_FILES) {
  const src = path.join(LOCALE_PT, file);
  const raw = JSON.parse(fs.readFileSync(src, "utf8"));
  const out = localizeNode(raw);
  fs.writeFileSync(path.join(LOCALE_EN, file), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Translated", file);
}

console.log("Done.");
