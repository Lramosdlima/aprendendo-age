/**
 * Migra `aldeoes.json` e `deuses_aom.json` para referências `{ id, nome }` em arrays.
 * Executar: node scripts/migrate-aldeoes-deuses-entity-refs.mjs
 */
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, root), "utf8"));

function stripLeadingNotionTokens(text) {
  let t = String(text).trim();
  const re = /^:[a-z0-9_-]+:\s*/i;
  while (re.test(t)) t = t.replace(re, "");
  return t.trim();
}

function buildStartLookupKey(s) {
  const t = s.titulo.trim();
  if (!s.author?.length) return t;
  return `${t} - por ${s.author.map((a) => a.trim()).join(" | ")}`;
}

function buildStartLookupKeyWithoutIcons(s) {
  const t = stripLeadingNotionTokens(s.titulo);
  if (!s.author?.length) return t;
  return `${t} - por ${s.author.map((a) => a.trim()).join(" | ")}`;
}

function canonicalStartTitle(s) {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\)\s*-\s*por\b/gi, ") - por")
    .replace(/:\s*-\s*por\b/gi, ":- por")
    .replace(/\s-\s*por\b/gi, " - por");
}

function normalizeDeusesStartPart(part) {
  const p = part.trim().replace(/\s+/g, " ");
  if (/\s-\s*por\s+/i.test(p)) return p;
  const porIdx = p.lastIndexOf(" por ");
  if (porIdx >= 0) {
    const left = p.slice(0, porIdx).trim();
    const right = p.slice(porIdx + 4).trim();
    if (left && right) return `${left} - por ${right}`;
  }
  const dashIdx = p.lastIndexOf(" - ");
  if (dashIdx <= 0) return p;
  const left = p.slice(0, dashIdx).trim();
  const right = p.slice(dashIdx + 3).trim();
  if (!right) return p;
  return `${left} - por ${right}`;
}

function splitCsvNames(s) {
  return String(s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function godRelIds(x) {
  if (Array.isArray(x.god_maior_relacao_ids) && x.god_maior_relacao_ids.length) return x.god_maior_relacao_ids;
  if (x.god_maior_relacao_id != null) return [x.god_maior_relacao_id];
  return [];
}

function unidadeIds(x) {
  if (Array.isArray(x.unidades_exclusivas_ids) && x.unidades_exclusivas_ids.length) return x.unidades_exclusivas_ids;
  if (x.unidades_exclusivas_id != null) return [x.unidades_exclusivas_id];
  return [];
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Alinha «by Autor» do título com «- por Autor» dos textos em deuses/panteões. */
function tituloPorAuthorLookupKey(s) {
  const t = stripLeadingNotionTokens(s.titulo);
  const a0 = (s.author && s.author[0]) || "";
  if (!a0 || !/\sby\s/i.test(t)) return null;
  const re = new RegExp(`\\s+by\\s+${escapeRe(a0)}\\s*$`, "i");
  if (!re.test(t)) return null;
  const base = t.replace(re, "").trim();
  return canonicalStartTitle(`${base} - por ${a0}`);
}

function buildStartLookupMap(starts) {
  const startByCanonicalKey = new Map();
  for (const s of starts) {
    const keys = new Set([
      canonicalStartTitle(buildStartLookupKey(s)),
      canonicalStartTitle(buildStartLookupKeyWithoutIcons(s)),
    ]);
    const alt = tituloPorAuthorLookupKey(s);
    if (alt) keys.add(alt);
    for (const k of keys) {
      if (k) startByCanonicalKey.set(k, s);
    }
  }
  return startByCanonicalKey;
}

function extractAuthorFromPart(part) {
  const m = part.match(/\s-\s*por\s+(.+)$/i);
  if (m) return m[1].trim();
  return "";
}

function fuzzyStartMatch(part, starts) {
  const authorNeedle = extractAuthorFromPart(part).toLowerCase();
  if (!authorNeedle) return null;
  const leftRaw = part.replace(/\s*-\s*por\s+.+$/i, "").trim();
  const left = stripLeadingNotionTokens(leftRaw).toLowerCase();

  let best = null;
  let bestScore = 0;
  for (const s of starts) {
    const auths = (s.author ?? []).map((a) => a.toLowerCase());
    const authMatch = auths.some(
      (a) => authorNeedle.includes(a) || a.includes(authorNeedle) || authorNeedle.startsWith(a.slice(0, 5)),
    );
    if (!authMatch) continue;
    const tit = stripLeadingNotionTokens(s.titulo).toLowerCase();
    let score = 0;
    const head = left.slice(0, 14);
    if (head && tit.includes(head)) score += 4;
    for (const w of tit.split(/\s+/)) {
      if (w.length > 4 && left.includes(w)) score += 1;
    }
    if (s.pantheon && part.toLowerCase().includes(String(s.pantheon).toLowerCase().slice(0, 5))) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return bestScore >= 3 ? best : null;
}

/** Trechos de `deuses_aom.starts` que não batem com as chaves canônicas de `starts_build_order`. */
const START_PART_OVERRIDES = [
  [/Hades.*Cofre.*Aussie_Drongo/i, 7],
  [/Nórdicos.*exceto Thor.*Moose/i, 3],
  [/Loki.*Herlíquias.*HuskSuppe/i, 15],
  [/Gaia Eco.*Balerion/i, 21],
  [/Gaia Heróica.*Boxer/i, 22],
  [/Shennong Fazendeiro.*HuskSuppe/i, 25],
  [/Freyr Rush\/2TC.*Aussie_Drongo/i, 14],
];

function overrideStartId(part, startsArr) {
  for (const [re, id] of START_PART_OVERRIDES) {
    if (re.test(part)) return startsArr.find((s) => s.id === id);
  }
  return null;
}

function parseStartsRefs(startsText, startByCanonicalKey, starts) {
  if (!startsText?.trim()) return [];
  const parts = startsText
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const out = [];
  for (const rawPart of parts) {
    const part = rawPart.replace(/\)\s*-\s*por/gi, ") - por").replace(/\s+por\s+HuskSuppe$/i, " - por HuskSuppe");
    const normalized = normalizeDeusesStartPart(part);
    const c = canonicalStartTitle(normalized);
    let exact = startByCanonicalKey.get(c);
    if (!exact) {
      const collapsed = canonicalStartTitle(normalized.replace(/\s+/g, " ").trim());
      exact = startByCanonicalKey.get(collapsed);
    }
    if (!exact) exact = fuzzyStartMatch(part, starts);
    if (!exact) exact = overrideStartId(part, starts);
    if (exact) out.push({ id: exact.id, nome: rawPart });
    else console.warn("[starts] sem match:", rawPart.slice(0, 96));
  }
  return out;
}

const deuses = read("src/data/locale/pt/deuses_aom.json");
const aldeoes = read("src/data/locale/pt/aldeoes.json");
const starts = read("src/data/locale/pt/starts_build_order.json");
const godpowers = read("src/data/locale/pt/godpowers.json");
const godpowerById = new Map(godpowers.map((g) => [g.id, g]));
const deusById = new Map(deuses.map((d) => [d.id, d]));
const startByCanonicalKey = buildStartLookupMap(starts);

const aldeoesOut = aldeoes.map((a) => {
  const { panteao_id, panteao, ...rest } = a;
  return {
    ...rest,
    panteao: [{ id: panteao_id, nome: panteao }],
  };
});

const deusesOut = deuses.map((x) => {
  const o = { ...x };
  delete o.panteao_id;
  delete o.era_id;
  delete o.godpower_id;
  delete o.god_maior_relacao_ids;
  delete o.god_maior_relacao_id;
  delete o.tecnologias_ids;
  delete o.unidades_exclusivas_ids;
  delete o.unidades_exclusivas_id;

  o.panteao = [{ id: x.panteao_id, nome: x.panteao }];
  o.era = [{ id: x.era_id, nome: x.era }];
  o.godpower = [
    {
      id: x.godpower_id,
      nome: x.godpower ?? godpowerById.get(x.godpower_id)?.nome ?? String(x.godpower_id),
    },
  ];

  const gri = godRelIds(x);
  const gNames = splitCsvNames(x.god_maior_relacao);
  o.god_maior_relacao = gri.map((id, i) => ({
    id,
    nome: gNames[i] ?? deusById.get(id)?.nome ?? String(id),
  }));

  const ti = x.tecnologias_ids ?? [];
  const tNames = splitCsvNames(x.tecnologias);
  o.tecnologias = ti.map((id, i) => ({
    id,
    nome: tNames[i] ?? String(id),
  }));

  const ui = unidadeIds(x);
  const uNames = splitCsvNames(x.unidades_exclusivas);
  o.unidades_exclusivas = ui.map((id, i) => ({
    id,
    nome: uNames[i] ?? String(id),
  }));

  if (x.starts) o.starts = parseStartsRefs(x.starts, startByCanonicalKey, starts);
  else delete o.starts;

  return o;
});

fs.writeFileSync(new URL("src/data/locale/pt/aldeoes.json", root), `${JSON.stringify(aldeoesOut, null, 2)}\n`);
fs.writeFileSync(new URL("src/data/locale/pt/deuses_aom.json", root), `${JSON.stringify(deusesOut, null, 2)}\n`);
console.log("OK: aldeoes", aldeoesOut.length, "deuses", deusesOut.length);
