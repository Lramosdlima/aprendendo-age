import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || (c === "\r" && text[i + 1] === "\n")) {
      row.push(field);
      field = "";
      if (row.length > 1 || row[0]) rows.push(row);
      row = [];
      if (c === "\r") i++;
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeNome(n) {
  return n
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

const csvPath = path.join(
  __dirname,
  "..",
  "..",
  "Notion Aprendendo Age",
  "Deuses AoM 24f00f30e2118067bd75ecfbfb0393a5.csv",
);
const jsonPath = path.join(__dirname, "..", "src", "data", "deuses_aom.json");

const rows = parseCSV(fs.readFileSync(csvPath, "utf8"));
const headers = rows[0].map((h) => h.replace(/^\uFEFF/, "").trim());
rows[0] = headers;
const col = (name) => headers.indexOf(name);

const csvByNome = new Map();
for (const r of rows.slice(1)) {
  if (r[col("Hierarquia")] !== "Maior") continue;
  const nome = r[col("Deus")]?.trim();
  if (!nome) continue;
  csvByNome.set(normalizeNome(nome), {
    nome,
    rush: Number(r[col("Rush")]),
    turtle: Number(r[col("Turtle")]),
    eco: Number(r[col("Eco")]),
  });
}

const deuses = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let updated = 0;
const unmatched = [];

for (const d of deuses) {
  if (d.hierarquia !== "Maior") continue;
  const csv = csvByNome.get(normalizeNome(d.nome));
  if (!csv) {
    unmatched.push(d.nome);
    continue;
  }
  if (d.rush !== csv.rush || d.turtle !== csv.turtle || d.eco !== csv.eco) {
    d.rush = csv.rush;
    d.turtle = csv.turtle;
    d.eco = csv.eco;
    updated++;
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(deuses, null, 2) + "\n", "utf8");
console.log(`Updated ${updated} major gods.${unmatched.length ? ` Unmatched: ${unmatched.join(", ")}` : ""}`);
