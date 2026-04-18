import fs from "fs";

const p = new URL("../src/data/starts_build_order.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(p, "utf8"));

function hasMultipleGods(god) {
  return typeof god === "string" && god.includes(",");
}

/** Ignora o prefixo `:aomr_*:` para ordenar pelo nome visível. */
function tituloSortKey(titulo) {
  return titulo.replace(/^:aomr_[a-z0-9_]+:\s*/i, "").trim();
}

const sorted = [...data].sort((a, b) => {
  const ma = hasMultipleGods(a.god);
  const mb = hasMultipleGods(b.god);
  if (ma !== mb) return ma ? -1 : 1;
  return tituloSortKey(a.titulo).localeCompare(tituloSortKey(b.titulo), "pt", { sensitivity: "base" });
});

const out = sorted.map((item, i) => ({
  id: i + 1,
  titulo: item.titulo,
  god: item.god,
  notion_file_id: item.notion_file_id,
  youtube: item.youtube,
  descricao_curta: item.descricao_curta,
  conteudo_html: item.conteudo_html,
}));

fs.writeFileSync(p, `${JSON.stringify(out, null, 2)}\n`);
console.log(`reorder-starts-build-order: ${out.length} entradas (vários deuses primeiro, depois nome).`);
