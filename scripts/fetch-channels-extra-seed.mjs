/**
 * Seed incremental: YouTube @arecs-aomr + Discord Recanto da Discordia.
 * Uso: node scripts/fetch-channels-extra-seed.mjs [caminho-do-arquivo.sql]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function parseInviteCode(url) {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "discord.gg") return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "discord.com" && parsed.pathname.startsWith("/invite/")) {
      return parsed.pathname.split("/").filter(Boolean)[1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

function guildIconUrl(guildId, iconHash, size = 128) {
  if (!guildId || !iconHash) return "";
  const ext = iconHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
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

const DISCORD_SORT = 10;
const YOUTUBE_SORT = 35;

async function fetchYouTube(apiKey, handle, nameHint) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(apiKey)}`,
    { headers: { Referer: "http://localhost:5173/" } },
  );
  if (!res.ok) throw new Error(`${handle}: YouTube HTTP ${res.status}`);
  const json = await res.json();
  const snippet = json.items?.[0]?.snippet;
  if (!snippet?.title) throw new Error(`${handle}: canal não encontrado`);
  const customHandle = snippet.customUrl?.replace(/^@/, "").trim() || handle;
  return {
    name: nameHint,
    urlLink: `https://www.youtube.com/@${customHandle}`,
    imagePath: pickThumbnail(snippet.thumbnails),
    category: "youtube",
    sortOrder: YOUTUBE_SORT,
  };
}

async function fetchDiscord(nameHint, url) {
  const code = parseInviteCode(url);
  if (!code) throw new Error(`Convite inválido: ${url}`);
  const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=false`);
  if (!res.ok) throw new Error(`${code}: Discord HTTP ${res.status}`);
  const guild = (await res.json()).guild;
  if (!guild?.id) throw new Error(`${code}: sem servidor`);
  return {
    name: nameHint,
    urlLink: `https://discord.gg/${code}`,
    imagePath: guildIconUrl(guild.id, guild.icon),
    category: "discord",
    sortOrder: DISCORD_SORT,
  };
}

function buildSql(rows) {
  const valueLines = rows
    .map(
      (r) =>
        `    (${sqlLiteral(r.name)}, ${sqlLiteral(r.urlLink)}, '${r.category}'::public.channel_category, ${sqlLiteral(r.imagePath)}, ${r.sortOrder})`,
    )
    .join(",\n");

  return `-- Links: Arecs-aomr (YouTube) + Recanto da Discordia (Discord)

-- Espaço para Discord em sort_order 10 (Instagram/WhatsApp/YouTube deslocam +1)
do $$
begin
  if exists (
    select 1
    from public.channels
    where clan_id is null
      and category = 'instagram'::public.channel_category
      and sort_order = 10
  ) and not exists (
    select 1
    from public.channels
    where clan_id is null
      and category = 'discord'::public.channel_category
      and lower(url_link) like '%mcgqwyy4ce%'
  ) then
    update public.channels
    set sort_order = sort_order + 1
    where clan_id is null
      and sort_order >= 10;
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
    and lower(rtrim(c.url_link, '/')) = lower(rtrim(v.url_link, '/'))
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
  and lower(rtrim(c.url_link, '/')) = lower(rtrim(v.url_link, '/'));
`;
}

async function main() {
  const apiKey = loadEnvKey();
  if (!apiKey) {
    console.error("Defina VITE_YOUTUBE_API_KEY em aprendendo-age/.env");
    process.exit(1);
  }

  const discord = await fetchDiscord("RECANTO DA DISCORDIA", "https://discord.gg/mcgQWYy4CE");
  console.error(`OK discord -> ${discord.name}`);

  const youtube = await fetchYouTube(apiKey, "arecs-aomr", "Arecs-aomr");
  console.error(`OK youtube -> ${youtube.name}`);

  const outPath =
    process.argv[2] ??
    resolve(ROOT, "../hud-aom/supabase/migrations/20260617230000_channels_seed_arecs_discordia.sql");
  writeFileSync(outPath, `${buildSql([discord, youtube])}\n`, "utf8");
  console.error(`Seed gravada em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
