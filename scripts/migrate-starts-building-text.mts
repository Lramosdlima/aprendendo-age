/**
 * Uma vez: `starts_build_order.json` fica só com nomes de edifício;
 * a UI aplica `expandBuildingKeywords` (StartMiniMarkup).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { stripStartTextForData } from "../src/lib/startBuildingKeywords.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, "../src/data/starts_build_order.json");

function walk(v: unknown): unknown {
  if (typeof v === "string") return stripStartTextForData(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [
        k,
        walk(val),
      ]),
    );
  return v;
}

const data = JSON.parse(readFileSync(path, "utf8")) as unknown;
const out = walk(data);
writeFileSync(path, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("ok:", path);
