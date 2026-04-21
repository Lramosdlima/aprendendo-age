/**
 * Reconstrói `categoria` em `unidades_aom.json`:
 * - Prefixos Soft-/HardCounter- a partir de `counter_de` com o **mesmo ícone** do segmento.
 * - Remove entradas `Contra*` redundantes com `HardCounter X` equivalente.
 * - Remove entradas cuja classe repete `tipo` (mesmo `icon`).
 * - Remove rótulo “nu” igual ao alvo do counter (ex.: SoftCounter Infantaria + linha "Infantaria").
 *
 * `node scripts/convert-categoria-unidades.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "..", "src", "data", "unidades_aom.json");

function parseLabeledIconParts(str) {
  if (typeof str !== "string" || str.trim() === "") return [];
  const parts = str.split(", ").map((p) => p.trim()).filter(Boolean);
  const out = [];
  for (const seg of parts) {
    const m = /^(.+?)\s+:([a-z0-9_-]+):\s*$/i.exec(seg);
    if (m) {
      out.push({ type: (m[1] ?? "").trim(), icon: (m[2] ?? "").trim() });
    } else {
      out.push({ type: seg, icon: "" });
    }
  }
  return out;
}

function isSyntheticPrefix(it) {
  const t = it?.type ?? "";
  return t.startsWith("SoftCounter ") || t.startsWith("HardCounter ");
}

/** Prefixos com ícone copiado do `counter_de`. */
function extractCounterDePrefixes(counterDe) {
  if (typeof counterDe !== "string" || !counterDe.trim()) return [];
  const segs = counterDe.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
  const seen = new Set();
  const out = [];

  for (const seg of segs) {
    let m = /^Soft-(.+?)\s+:([a-z0-9_-]+):/i.exec(seg);
    if (m) {
      const role = (m[1] ?? "").trim();
      const icon = (m[2] ?? "").trim();
      if (!role || !icon) continue;
      const type = `SoftCounter ${role}`;
      if (seen.has(type)) continue;
      seen.add(type);
      out.push({ type, icon });
      continue;
    }
    m = /^HardCounter-(.+?)\s+:([a-z0-9_-]+):/i.exec(seg);
    if (m) {
      const role = (m[1] ?? "").trim();
      const icon = (m[2] ?? "").trim();
      if (!role || !icon) continue;
      const type = `HardCounter ${role}`;
      if (seen.has(type)) continue;
      seen.add(type);
      out.push({ type, icon });
    }
  }
  return out;
}

function getBaseEntries(row) {
  if (Array.isArray(row.categoria)) {
    return row.categoria.filter((it) => !isSyntheticPrefix(it));
  }
  if (typeof row.categoria === "string") {
    return parseLabeledIconParts(row.categoria);
  }
  return [];
}

function filterBase(base, prefixes, tipoArr) {
  const tipoIcons = new Set(
    (Array.isArray(tipoArr) ? tipoArr : [])
      .map((t) => (t.icon ?? "").trim())
      .filter(Boolean),
  );

  return base.filter((item) => {
    const type = (item.type ?? "").trim();
    const icon = (item.icon ?? "").trim();

    if (icon && tipoIcons.has(icon)) return false;

    const contraRole = type.startsWith("Contra") ? type.slice("Contra".length) : null;
    for (const p of prefixes) {
      if (!p.type.startsWith("HardCounter ")) continue;
      const role = p.type.slice("HardCounter ".length).trim();
      if (contraRole && contraRole === role) return false;
    }

    for (const p of prefixes) {
      const m = /^(Soft|Hard)Counter (.+)$/.exec(p.type);
      if (!m) continue;
      const role = (m[2] ?? "").trim();
      if (type === role) return false;
    }

    return true;
  });
}

function rebuildCategoria(row) {
  const prefixes = extractCounterDePrefixes(row.counter_de);
  const baseRaw = getBaseEntries(row);
  const base = filterBase(baseRaw, prefixes, row.tipo);
  const merged = [...prefixes, ...base];
  if (merged.length) {
    row.categoria = merged;
  } else {
    delete row.categoria;
  }
}

const raw = fs.readFileSync(jsonPath, "utf8");
const data = JSON.parse(raw);
if (!Array.isArray(data)) throw new Error("Esperado array.");

for (const row of data) {
  rebuildCategoria(row);
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("OK", jsonPath, data.length);
