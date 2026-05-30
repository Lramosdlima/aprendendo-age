#!/usr/bin/env node
/** @deprecated Use translate-locale-en.mjs or translate-locale-en-api.mjs */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, [path.join(__dirname, "translate-locale-en-api.mjs")], {
  stdio: "inherit",
});
process.exit(r.status ?? 1);
