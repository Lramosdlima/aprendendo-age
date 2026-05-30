/**
 * Sincroniza tecnologias.json a partir do export Notion (HTML por UP + CSV da planilha).
 * Beneficia: converte <img alt="token"> e <mark class="highlight-*"> para :token: e <highlight-*>.
 *
 * node scripts/sync-tecnologias-from-notion.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const notionDir = path.join(root, "..", "Notion Aprendendo Age", "Aprendendo Age");
const htmlDir = path.join(notionDir, "Tecnologias");
const csvPath = path.join(notionDir, "Tecnologias 29500f30e2118062b0fcf262a3f188b4.csv");
const jsonPath = path.join(root, "src/data/locale/pt/tecnologias.json");

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function decodeHtmlText(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

/** Converte HTML inline do Notion (Beneficia) para mini-markup do app. */
function htmlInlineToMarkup(html) {
  let pos = 0;
  let out = "";

  while (pos < html.length) {
    const rest = html.slice(pos);
    const img = rest.match(/^<img[^>]*\salt="([^"]*)"[^>]*\/?>/i);
    if (img) {
      const alt = img[1].trim().toLowerCase();
      if (alt) out += `:${alt}:`;
      pos += img[0].length;
      continue;
    }
    const mark = rest.match(/^<mark class="highlight-([\w-]+)">([\s\S]*?)<\/mark>/i);
    if (mark) {
      const tag = mark[1];
      const inner = htmlInlineToMarkup(mark[2]);
      if (tag === "default") {
        if (inner) out += inner;
      } else if (inner) {
        out += `<highlight-${tag}>${inner}</highlight-${tag}>`;
      }
      pos += mark[0].length;
      continue;
    }
    const text = rest.match(/^[^<]+/);
    if (text) {
      out += decodeHtmlText(text[0]);
      pos += text[0].length;
      continue;
    }
    if (rest[0] === "<") {
      const gt = rest.indexOf(">");
      pos += gt >= 0 ? gt + 1 : 1;
      continue;
    }
    pos++;
  }

  return out.replace(/\s+/g, " ").trim();
}

/** Ícone + cor quando o export Notion só traz o rótulo (ex.: «Lanceiro ()»). */
const UNIT_ENRICH = [
  { label: "Lanceiro Yari", icon: "aomr_yari_spearman_icon", wrap: "red" },
  { label: "Lanceiro", icon: "aomr_spearman_icon", wrap: "red" },
  { label: "Machadeiro", icon: "aomr_axeman_icon", wrap: "red" },
  { label: "Fundeiro", icon: "aomr_slinger_icon", wrap: "red" },
  { label: "Cameleiro", icon: "aomr_camel_rider_icon", wrap: "teal" },
  { label: "Elefantes de Guerra", icon: "aomr_war_elephant_icon", wrap: "teal" },
  { label: "Elefante de Guerra", icon: "aomr_war_elephant_icon", wrap: "teal" },
  { label: "Arqueiro de Biga", icon: "aomr_chariot_archer_icon", wrap: "blue" },
  { label: "Infantaria", icon: "aomr_type_infantry_icon", wrap: "red" },
  { label: "Cavalaria", icon: "aomr_type_cavalry_icon", wrap: "teal" },
  { label: "Artilharia", icon: "aomr_type_archer_icon", wrap: "blue" },
  { label: "Aldeão", icon: "aomr_type_villager_icon", wrap: "default" },
  { label: "Construção", icon: "aomr_type_building_icon", wrap: "default" },
  { label: "Torre", icon: "aomr_tower_icon", wrap: "default" },
  { label: "Muro", icon: "aomr_wall_icon", wrap: "default" },
  { label: "Fazenda", icon: "aomr_farm_icon", wrap: "default" },
  { label: "Madeira", icon: "woodaom", wrap: "brown" },
  { label: "Comida", icon: "foodaom", wrap: "red" },
  { label: "Ouro", icon: "goldaom", wrap: "yellow" },
];

function enrichBeneficia(text) {
  let t = text;
  for (const { label, icon, wrap } of UNIT_ENRICH) {
    const token = `:${icon}:`;
    if (t.includes(token)) continue;
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const highlighted = new RegExp(
      `(<highlight-[\\w-]+>\\s*${escaped}\\s*</highlight-[\\w-]+>)`,
      "i",
    );
    if (highlighted.test(t)) {
      t = t.replace(highlighted, `${token} $1`);
      continue;
    }
    const plain = new RegExp(`\\b${escaped}\\b(?=\\s*\\()`, "i");
    if (plain.test(t)) {
      const wrapOpen = wrap === "default" ? "" : `<highlight-${wrap}>`;
      const wrapClose = wrap === "default" ? "" : `</highlight-${wrap}>`;
      t = t.replace(plain, `${token} ${wrapOpen}${label}${wrapClose}`);
    }
  }
  return cleanupBeneficia(t.replace(/\s+/g, " ").trim());
}

function cleanupBeneficia(t) {
  let out = t
    .replace(/<\/highlight-red><\/highlight-red>/gi, "</highlight-red>")
    .replace(/<\/highlight-teal><\/highlight-teal>/gi, "</highlight-teal>")
    .replace(/<\/highlight-blue><\/highlight-blue>/gi, "</highlight-blue>")
    .replace(/<\/highlight-brown><\/highlight-brown>/gi, "</highlight-brown>")
    .replace(/<highlight-default>/gi, "")
    .replace(/<\/highlight-default>/gi, "")
    .replace(/<<highlight-/gi, "<highlight-")
    .replace(/highlight-red>highlight-red>/gi, "highlight-red>")
    .replace(/highlight-blue>highlight-blue>/gi, "highlight-blue>")
    .replace(/highlight-teal>highlight-teal>/gi, "highlight-teal>")
    .trim();

  // :token: Madeira</highlight-brown> → :token: <highlight-brown>Madeira</highlight-brown>
  out = out.replace(
    /:([a-z0-9_-]+):\s+([^<]+?)<\/highlight-([\w-]+)>(?!\s*<\/highlight-\3>)/gi,
    ":$1: <highlight-$3>$2</highlight-$3>",
  );
  // :token: Lanceiro</highlight-red>( → :token: <highlight-red>Lanceiro</highlight-red> (
  out = out.replace(
    /:([a-z0-9_-]+):\s+([^<]+?)<\/highlight-([\w-]+)>\(/gi,
    ":$1: <highlight-$3>$2</highlight-$3> (",
  );
  out = out.replace(/<highlight-gray>Torre\(/gi, "<highlight-gray>Torre</highlight-gray> (");
  out = out.replace(/<\/highlight-([\w-]+)>\(/g, "</highlight-$1> (");
  out = out.replace(/\s+\(/g, " (").replace(/\(\s+/g, "(");
  // espaço após :token: antes de highlight ou texto
  out = out.replace(/:([a-z0-9_-]+):(?=<highlight|[A-Za-zÀ-ú])/gi, ":$1: ");
  return out.trim();
}

function extractPageTitle(html) {
  return html.match(/<h1 class="page-title"[^>]*>([^<]*)</)?.[1]?.trim() ?? "";
}

function extractProperties(html) {
  const props = {};
  for (const row of html.matchAll(/<tr class="property-row[^"]*">([\s\S]*?)<\/tr>/g)) {
    const label = row[1].match(/<th>[\s\S]*?<\/span>([^<]+)</)?.[1]?.trim();
    const td = row[1].match(/<td>([\s\S]*?)<\/td>/)?.[1];
    if (!label || td == null) continue;
    props[label] = td;
  }
  return props;
}

function beneficiaFromProps(props) {
  const raw = props.Beneficia;
  if (raw == null) return undefined;
  const parsed = enrichBeneficia(htmlInlineToMarkup(raw));
  return parsed || undefined;
}

function tipoFromProps(props) {
  const raw = props.Tipo;
  if (!raw) return undefined;
  return decodeHtmlText(raw.replace(/<[^>]+>/g, " "));
}

function numFromTd(td) {
  if (!td) return undefined;
  const n = Number(td.replace(/<[^>]+>/g, "").trim());
  return Number.isFinite(n) ? n : undefined;
}

function parseLinkName(td) {
  const names = [...td.matchAll(/>([^<]+)</g)].map((m) => m[1].trim()).filter(Boolean);
  return names.join(", ");
}

/** Texto mecânico do corpo da página (parágrafos após «Beneficia» na planilha). */
function cleanupCampo(t) {
  return t
    .replace(/:([a-z0-9_-]+):(?=:)/gi, ":$1: ")
    .replace(/([^\s:]):([a-z0-9_-]+):/g, "$1 :$2:")
    .replace(/:([a-z0-9_-]+):(?=[A-Za-zÀ-ú])/gi, ":$1: ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPageBodyHtml(html) {
  const start = html.indexOf('<div class="page-body">');
  if (start < 0) return "";
  const slice = html.slice(start + '<div class="page-body">'.length);
  const end = slice.indexOf("</article>");
  return end < 0 ? slice : slice.slice(0, end);
}

/** Efeitos mecânicos: um item por <p> no page-body (ignora blockquote de lore). */
function extractCampoFromHtml(html) {
  const body = extractPageBodyHtml(html);
  if (!body.trim()) return undefined;

  const lines = [];
  for (const m of body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const inner = m[1].replace(/<br\s*\/?>/gi, " ").trim();
    const plain = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!plain) continue;
    const line = cleanupCampo(htmlInlineToMarkup(inner));
    if (line) lines.push(line);
  }
  return lines.length ? lines : undefined;
}

function campoEquals(a, b) {
  const na = Array.isArray(a) ? a : a ? [a] : [];
  const nb = Array.isArray(b) ? b : b ? [b] : [];
  if (na.length !== nb.length) return false;
  return na.every((line, i) => line === nb[i]);
}

function loadHtmlByName() {
  const map = new Map();
  for (const file of fs.readdirSync(htmlDir)) {
    if (!file.endsWith(".html")) continue;
    const html = fs.readFileSync(path.join(htmlDir, file), "utf8");
    const nome = extractPageTitle(html);
    if (!nome || nome === "Sem título") continue;
    const props = extractProperties(html);
    map.set(nome, {
      props,
      beneficia: beneficiaFromProps(props),
      tipo: tipoFromProps(props),
      campo: extractCampoFromHtml(html),
    });
  }
  return map;
}

function normKey(s) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

const tecnologias = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const htmlByName = loadHtmlByName();
const changes = [];

for (const t of tecnologias) {
  const html = htmlByName.get(t.nome);
  if (!html) continue;

  if (html.beneficia != null) {
    if (html.beneficia !== t.beneficia) {
      changes.push({ nome: t.nome, field: "beneficia", from: t.beneficia, to: html.beneficia });
    }
    t.beneficia = html.beneficia;
  }

  const p = html.props;
  const nums = {
    Comida: "comida",
    Madeira: "madeira",
    Ouro: "ouro",
    Favor: "favor",
    "Tempo (s)": "tempo_s",
  };
  for (const [pt, jk] of Object.entries(nums)) {
    const v = numFromTd(p[pt]);
    if (v != null && t[jk] !== v) {
      changes.push({ nome: t.nome, field: jk, from: t[jk], to: v });
      t[jk] = v;
    }
  }
  const ing = p.Inglês?.replace(/<[^>]+>/g, "").trim();
  if (ing && ing !== t.ingles) {
    changes.push({ nome: t.nome, field: "ingles", from: t.ingles, to: ing });
    t.ingles = ing;
  }

  if (html.campo != null) {
    if (!campoEquals(t.campo, html.campo)) {
      changes.push({
        nome: t.nome,
        field: "campo",
        from: t.campo,
        to: html.campo,
        lines: html.campo.length,
      });
    }
    t.campo = html.campo;
  } else if (t.campo != null) {
    changes.push({ nome: t.nome, field: "campo", from: t.campo, to: undefined, lines: 0 });
    delete t.campo;
  }
}

console.log(`HTML pages loaded: ${htmlByName.size}`);
console.log(`Changes: ${changes.length}`);
for (const c of changes.slice(0, 40)) {
  const extra = c.lines != null ? ` (${c.lines} linha(s))` : "";
  const from = c.from == null ? "—" : JSON.stringify(c.from);
  const to = c.to == null ? "—" : JSON.stringify(c.to);
  console.log(`- ${c.nome} [${c.field}]${extra}: ${from} → ${to}`);
}
if (changes.length > 40) console.log(`... +${changes.length - 40} more`);

const broken = tecnologias.filter(
  (t) => t.beneficia && (/\(\s*\)/.test(t.beneficia) || t.beneficia === "()"),
);
console.log(`Still with empty (): ${broken.length}`);
for (const t of broken.slice(0, 12)) console.log(`  ${t.nome}: ${t.beneficia}`);

const semCampo = tecnologias.filter(
  (t) => !Array.isArray(t.campo) || t.campo.length === 0,
);
const multiCampo = tecnologias.filter((t) => Array.isArray(t.campo) && t.campo.length > 1);
console.log(`Without campo: ${semCampo.length}`);
console.log(`With 2+ campo lines: ${multiCampo.length}`);

if (changes.length) {
  const payload = `${JSON.stringify(tecnologias, null, 2)}\n`;
  const tmpPath = `${jsonPath}.tmp`;
  fs.writeFileSync(tmpPath, payload, "utf8");
  fs.renameSync(tmpPath, jsonPath);
  console.log("Updated", jsonPath);
} else {
  console.log("No changes");
}
