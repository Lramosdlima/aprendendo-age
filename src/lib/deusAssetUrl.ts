import tokenAssetMap from "@/data/token_asset_map.json";

/** Slugs `aomr_<slug>_icon` em `token_asset_map` que apontam para `/assets/gods/`. */
function buildGodIconUrlBySlug(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(tokenAssetMap)) {
    if (typeof v !== "string" || !v.includes("/assets/gods/")) continue;
    const match = k.match(/^aomr_(.+)_icon$/);
    if (!match) continue;
    const slug = match[1];
    if (!m.has(slug)) m.set(slug, v);
  }
  return m;
}

const urlBySlug = buildGodIconUrlBySlug();

function normalizeNomeToSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/\//g, "_");
}

/**
 * Nome exibido no JSON → slug do token (quando o PT não coincide com o ficheiro en).
 * Astecas em AoMR podem não ter ícone no mapa.
 */
const NOME_TO_SLUG: Record<string, string> = {
  Urano: "oranos",
  Cronos: "kronos",
  "Fu Xi": "fuxi",
  "Nu Wa": "nuwa",
  Frey: "freyr",
  Atena: "athena",
  Apolo: "apollo",
  "Dionísio": "dionysus",
  Afrodite: "aphrodite",
  Hefesto: "hephaestus",
  "Hathor/Sobek": "sobek",
  "Néftis": "nephthys",
  Prometeu: "prometheus",
  Oceano: "oceanus",
  "Hécate": "hekate",
  "Perséfone": "persephone",
};

/**
 * URL pública do retrato do deus em `/assets/gods/`, ou `undefined` se não existir no mapa.
 */
export function getDeusAssetUrl(nome: string | undefined): string | undefined {
  if (!nome?.trim()) return undefined;
  if (nome.trim() === "Sem título") return undefined;

  const slugOverride = NOME_TO_SLUG[nome];
  const candidates: string[] = [];
  if (slugOverride) candidates.push(slugOverride);

  const base = normalizeNomeToSlug(nome);
  candidates.push(base);
  candidates.push(base.replace(/-/g, "_"));
  candidates.push(base.replace(/_/g, "-"));

  for (const s of candidates) {
    const url = urlBySlug.get(s);
    if (url) return url;
  }

  return undefined;
}
