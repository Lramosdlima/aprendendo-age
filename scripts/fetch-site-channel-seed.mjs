/**
 * Busca metadados de sites (nome, favicon) e grava a seed SQL.
 * Uso: node scripts/fetch-site-channel-seed.mjs [caminho-do-arquivo.sql]
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function siteDomain(url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return host;
}

function faviconUrl(url) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(siteDomain(url))}&sz=128`;
}

const SITES = [
  {
    url: "https://www.ageofempires.com/news?game=aoem",
    nameHint: "Age of Empires",
    sortOrder: 0,
  },
  { url: "https://aomstats.io/", nameHint: "AoM Stats", sortOrder: 1 },
  { url: "https://www.aom.gg/", nameHint: "AoM.gg", sortOrder: 2 },
  {
    url: "https://liquipedia.net/ageofempires/Age_of_Mythology/Tournaments",
    nameHint: "Liquipedia",
    sortOrder: 3,
  },
  { url: "https://kevenaom.com.br/", nameHint: "Keven AoM", sortOrder: 4 },
  { url: "https://thedodclan.com/", nameHint: "The DOD Clan", sortOrder: 5 },
];

async function fetchSiteMeta(entry) {
  return {
    name: entry.nameHint,
    urlLink: entry.url,
    imagePath: faviconUrl(entry.url),
    sortOrder: entry.sortOrder,
  };
}

function buildSql(rows) {
  const valueLines = rows
    .map(
      (r) =>
        `    (${sqlLiteral(r.name)}, ${sqlLiteral(r.urlLink)}, ${sqlLiteral(r.imagePath)}, ${r.sortOrder})`,
    )
    .join(",\n");

  return `-- Links: sites da comunidade AoM (favicons via Google favicon service)
-- sort_order 0–5 = topo da página /links-streamers

-- Espaço no topo para quem já aplicou seeds YouTube/Twitch com ordem antiga
do $$
begin
  if exists (
    select 1
    from public.channels
    where clan_id is null
      and category = 'youtube'::public.channel_category
      and sort_order < 10
  ) then
    update public.channels
    set sort_order = sort_order + 10
    where clan_id is null
      and category in (
        'youtube'::public.channel_category,
        'twitch'::public.channel_category
      );
  end if;
end $$;

insert into public.channels (name, url_link, category, image_path, sort_order)
select v.name, v.url_link, 'site'::public.channel_category, nullif(v.image_path, ''), v.sort_order
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where not exists (
  select 1
  from public.channels c
  where c.clan_id is null
    and c.category = 'site'::public.channel_category
    and c.sort_order = v.sort_order
);

update public.channels c
set
  name = v.name,
  url_link = v.url_link,
  image_path = nullif(v.image_path, ''),
  sort_order = v.sort_order,
  category = 'site'::public.channel_category
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where c.clan_id is null
  and c.category = 'site'::public.channel_category
  and c.sort_order = v.sort_order;
`;
}

async function main() {
  const rows = [];
  for (const entry of SITES) {
    const meta = await fetchSiteMeta(entry);
    rows.push(meta);
    console.error(`OK ${siteDomain(entry.url)} -> ${meta.name}`);
    await new Promise((r) => setTimeout(r, 200));
  }

  const outPath =
    process.argv[2] ??
    resolve(ROOT, "../hud-aom/supabase/migrations/20260617180000_channels_seed_sites.sql");
  writeFileSync(outPath, `${buildSql(rows)}\n`, "utf8");
  console.error(`Seed gravada em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
