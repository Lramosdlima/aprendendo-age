/**
 * Busca metadados de Instagram / WhatsApp e grava a seed SQL.
 * Uso: node scripts/fetch-instagram-whatsapp-seed.mjs [caminho-do-arquivo.sql]
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchOgImage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return "";
  const html = await res.text();
  const match = html.match(/property="og:image" content="([^"]+)"/i);
  return match?.[1] ? decodeHtml(match[1]) : "";
}

const CHANNELS = [
  {
    name: "MDRE",
    url: "https://www.instagram.com/mdre.mandarecurso",
    category: "instagram",
    sortOrder: 10,
  },
  {
    name: "AOM BR - Avisos, Stream, Divulgações",
    url: "https://chat.whatsapp.com/JBQuJDJk9cZ1j5D3NYfJNY",
    category: "whatsapp",
    sortOrder: 11,
  },
];

function buildSql(rows) {
  const valueLines = rows
    .map(
      (r) =>
        `    (${sqlLiteral(r.name)}, ${sqlLiteral(r.urlLink)}, '${r.category}'::public.channel_category, ${sqlLiteral(r.imagePath)}, ${r.sortOrder})`,
    )
    .join(",\n");

  return `-- Links: Instagram + WhatsApp (após Discord 6–9, antes do YouTube 12+)

do $$ begin
  alter type public.channel_category add value 'whatsapp';
exception
  when duplicate_object then null;
end $$;

-- Desloca YouTube se ainda estiver na ordem antiga (KevenAOM em sort_order 10)
do $$
begin
  if exists (
    select 1
    from public.channels
    where clan_id is null
      and category = 'youtube'::public.channel_category
      and sort_order = 10
      and lower(url_link) like '%@kevenaom%'
  ) and not exists (
    select 1
    from public.channels
    where clan_id is null
      and category = 'instagram'::public.channel_category
      and sort_order = 10
  ) then
    update public.channels
    set sort_order = sort_order + 2
    where clan_id is null
      and category = 'youtube'::public.channel_category;
  end if;
end $$;

insert into public.channels (name, url_link, category, image_path, sort_order)
select v.name, v.url_link, v.category, nullif(v.image_path, ''), v.sort_order
from (
  values
${valueLines}
) as v(name, url_link, category, image_path, sort_order)
where not exists (
  select 1
  from public.channels c
  where c.clan_id is null
    and c.category = v.category
    and c.sort_order = v.sort_order
);

update public.channels c
set
  name = v.name,
  url_link = v.url_link,
  image_path = nullif(v.image_path, ''),
  sort_order = v.sort_order,
  category = v.category
from (
  values
${valueLines}
) as v(name, url_link, category, image_path, sort_order)
where c.clan_id is null
  and c.category = v.category
  and c.sort_order = v.sort_order;
`;
}

async function main() {
  const rows = [];
  for (const entry of CHANNELS) {
    const imagePath = await fetchOgImage(entry.url);
    rows.push({
      name: entry.name,
      urlLink: entry.url.replace(/\/+$/, ""),
      imagePath,
      category: entry.category,
      sortOrder: entry.sortOrder,
    });
    console.error(`OK ${entry.category} ${entry.name} -> ${imagePath ? "imagem ok" : "sem imagem"}`);
  }

  const outPath =
    process.argv[2] ??
    resolve(ROOT, "../hud-aom/supabase/migrations/20260617220000_channels_seed_instagram_whatsapp.sql");
  writeFileSync(outPath, `${buildSql(rows)}\n`, "utf8");
  console.error(`Seed gravada em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
