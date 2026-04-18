import fs from "fs";

const p = new URL("../src/data/starts_build_order.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(p, "utf8"));

/** Nome do campo `god` (um só) → token Notion usado em `titulo`. */
const GOD_TOKEN = {
  Amaterasu: "aomr_amaterasu_icon",
  /** No asset map: `aomr_kronos_icon` */
  Cronos: "aomr_kronos_icon",
  Freyr: "aomr_freyr_icon",
  "Fu Xi": "aomr_fuxi_icon",
  Gaia: "aomr_gaia_icon",
  Hades: "aomr_hades_icon",
  Loki: "aomr_loki_icon",
  Poseidon: "aomr_poseidon_icon",
  Ra: "aomr_ra_icon",
  Set: "aomr_set_icon",
  Shennong: "aomr_shennong_icon",
  Susanoo: "aomr_susanoo_icon",
  Thor: "aomr_thor_icon",
  Tsukuyomi: "aomr_tsukuyomi_icon",
  Isis: "aomr_isis_icon",
};

function singleGodName(god) {
  if (!god?.trim()) return null;
  const parts = god
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length !== 1) return null;
  return parts[0];
}

function stripLeadingGodIconToken(titulo) {
  return titulo.replace(/^:aomr_[a-z0-9_]+:\s*/i, "");
}

for (const item of data) {
  const one = singleGodName(item.god);
  const token = one ? GOD_TOKEN[one] : null;
  if (token) {
    const body = stripLeadingGodIconToken(item.titulo);
    item.titulo = `:${token}: ${body}`;
  }
}

fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
