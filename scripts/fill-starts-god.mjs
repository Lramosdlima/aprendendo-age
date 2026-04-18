import fs from "fs";

const p = new URL("../src/data/starts_build_order.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(p, "utf8"));

/** Extrai o deus principal do título; entradas só por civilização ficam "". */
function godFromTitulo(titulo) {
  if (!titulo) return "";
  const t = titulo.trim();
  if (/^Atlantes\b/i.test(t)) return "";
  if (/^Chineses\b/i.test(t)) return "";
  if (/^Egípcios\b/i.test(t)) return "";
  if (/^Gregos\b/i.test(t)) return "";
  if (/^Nórdicos\b/i.test(t)) return "";
  if (/^Amaterasu\b/i.test(t)) return "Amaterasu";
  if (/^Cronos\b/i.test(t)) return "Cronos";
  if (/^Freyr\b/i.test(t)) return "Freyr";
  if (/^Fu Xi\b/i.test(t)) return "Fu Xi";
  if (/^Gaia\b/i.test(t)) return "Gaia";
  if (/^Hades\b/i.test(t)) return "Hades";
  if (/^Loki\b/i.test(t)) return "Loki";
  if (/^Poseidon\b/i.test(t)) return "Poseidon";
  /** `\b` após letras acentuadas falha no JS clássico */
  if (t.startsWith("Rá")) return "Ra";
  if (/^Set\b/i.test(t)) return "Set";
  if (/^Shennong\b/i.test(t)) return "Shennong";
  if (/^Susanoo\b/i.test(t)) return "Susanoo";
  if (/^Thor\b/i.test(t)) return "Thor";
  if (/^Tsukuyomi\b/i.test(t)) return "Tsukuyomi";
  if (/^Ísis\b/i.test(t)) return "Isis";
  return "";
}

const out = data.map((item) => ({
  id: item.id,
  titulo: item.titulo,
  god: godFromTitulo(item.titulo),
  notion_file_id: item.notion_file_id,
  youtube: item.youtube,
  descricao_curta: item.descricao_curta,
  conteudo_html: item.conteudo_html,
}));

fs.writeFileSync(p, `${JSON.stringify(out, null, 2)}\n`);
