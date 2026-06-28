/**
 * Busca metadados dos canais YouTube (nome, url_link, avatar) e grava a seed SQL.
 * Uso: node scripts/fetch-youtube-channel-seed.mjs [caminho-do-arquivo.sql]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnvKey() {
  try {
    const raw = readFileSync(resolve(ROOT, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key === "VITE_YOUTUBE_API_KEY" && value) return value;
    }
  } catch {
    /* ignore */
  }
  return process.env.VITE_YOUTUBE_API_KEY?.trim() || null;
}

function pickThumbnail(thumbnails) {
  if (!thumbnails) return "";
  return (
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    ""
  );
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const CHANNELS = [
  { handle: "kevenaom", sortOrder: 10 },
  { handle: "Milanogods", sortOrder: 11 },
  { handle: "oCafeina", sortOrder: 12 },
  { handle: "Forkxx", sortOrder: 13 },
  { handle: "scoobymaniaco", sortOrder: 14 },
  { handle: "ProfessorAjax", sortOrder: 15 },
  { handle: "balerionaom", sortOrder: 16 },
  { handle: "TavernadoLug", sortOrder: 17 },
  { handle: "Gabriel_AoM", sortOrder: 18 },
  { handle: "BoitTV", sortOrder: 19 },
  { handle: "DeitiesofDeath", sortOrder: 20 },
  { handle: "AoMRetoldBrasil", sortOrder: 21 },
  { handle: "HunkAoM", sortOrder: 22 },
  { handle: "TheRapll", sortOrder: 23 },
  { handle: "NoobbSA", sortOrder: 24 },
  { handle: "HimuraAoM", sortOrder: 25 },
  { handle: "LeonidasBaianoBr", sortOrder: 26 },
  { handle: "Sementerj", sortOrder: 27 },
  { handle: "NaddoStrategy", sortOrder: 28 },
];

async function fetchChannel(apiKey, handle) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(apiKey)}`,
    { headers: { Referer: "http://localhost:5173/" } },
  );
  if (!res.ok) {
    throw new Error(`${handle}: HTTP ${res.status}`);
  }
  const json = await res.json();
  const snippet = json.items?.[0]?.snippet;
  if (!snippet?.title) {
    throw new Error(`${handle}: canal não encontrado`);
  }
  const customHandle = snippet.customUrl?.replace(/^@/, "").trim() || handle;
  return {
    name: snippet.title.trim(),
    urlLink: `https://www.youtube.com/@${customHandle}`,
    imagePath: pickThumbnail(snippet.thumbnails),
  };
}

async function main() {
  const apiKey = loadEnvKey();
  if (!apiKey) {
    console.error("Defina VITE_YOUTUBE_API_KEY em aprendendo-age/.env");
    process.exit(1);
  }

  const rows = [];
  for (const entry of CHANNELS) {
    const meta = await fetchChannel(apiKey, entry.handle);
    rows.push({ ...meta, sortOrder: entry.sortOrder });
    console.error(`OK ${entry.handle} -> ${meta.name}`);
    await new Promise((r) => setTimeout(r, 120));
  }

  const valueLines = rows
    .map(
      (r) =>
        `    (${sqlLiteral(r.name)}, ${sqlLiteral(r.urlLink)}, ${sqlLiteral(r.imagePath)}, ${r.sortOrder})`,
    )
    .join(",\n");

  const sql = `-- Links Streamers: canais YouTube da comunidade BR (metadados via YouTube Data API)
-- clan_id nulo = exibidos em /links-streamers

insert into public.channels (name, url_link, category, image_path, sort_order)
select v.name, v.url_link, 'youtube'::public.channel_category, nullif(v.image_path, ''), v.sort_order
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where not exists (
  select 1
  from public.channels c
  where c.clan_id is null
    and c.category = 'youtube'::public.channel_category
    and c.sort_order = v.sort_order
);

update public.channels c
set
  name = v.name,
  url_link = v.url_link,
  image_path = nullif(v.image_path, ''),
  sort_order = v.sort_order,
  category = 'youtube'::public.channel_category
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where c.clan_id is null
  and c.category = 'youtube'::public.channel_category
  and c.sort_order = v.sort_order;
`;

  const outPath =
    process.argv[2] ??
    resolve(ROOT, "../hud-aom/supabase/migrations/20260617150000_channels_seed_youtube_streamers.sql");
  writeFileSync(outPath, `${sql}\n`, "utf8");
  console.error(`Seed gravada em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
