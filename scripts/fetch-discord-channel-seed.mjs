/**
 * Busca metadados de convites Discord (ícone do servidor) e grava a seed SQL.
 * Uso: node scripts/fetch-discord-channel-seed.mjs [caminho-do-arquivo.sql]
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function parseInviteCode(url) {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "discord.gg" && host !== "discord.com") return null;
    if (host === "discord.gg") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (parsed.pathname.startsWith("/invite/")) {
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

const SERVERS = [
  { url: "https://discord.gg/2aQS3APZaT", nameHint: "CaOK", sortOrder: 6 },
  { url: "https://discord.gg/qhHJMqUcaV", nameHint: "MDRE", sortOrder: 7 },
  { url: "https://discord.gg/3xGx8WyRva", nameHint: "Forkx", sortOrder: 8 },
  { url: "https://discord.gg/UFCE2KS2yv", nameHint: "KevenAoM", sortOrder: 9 },
  { url: "https://discord.gg/mcgQWYy4CE", nameHint: "RECANTO DA DISCORDIA", sortOrder: 10 },
];

async function fetchDiscordMeta(entry) {
  const code = parseInviteCode(entry.url);
  if (!code) throw new Error(`Convite inválido: ${entry.url}`);

  const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=false`);
  if (!res.ok) {
    throw new Error(`${code}: Discord API HTTP ${res.status}`);
  }

  const json = await res.json();
  const guild = json.guild;
  if (!guild?.id) {
    throw new Error(`${code}: convite sem servidor associado`);
  }

  return {
    name: entry.nameHint,
    urlLink: `https://discord.gg/${code}`,
    imagePath: guildIconUrl(guild.id, guild.icon),
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

  return `-- Links: servidores Discord da comunidade BR (ícones via Discord API / CDN)
-- sort_order 6–9 = após sites (0–5) e antes do YouTube (10+)

insert into public.channels (name, url_link, category, image_path, sort_order)
select v.name, v.url_link, 'discord'::public.channel_category, nullif(v.image_path, ''), v.sort_order
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where not exists (
  select 1
  from public.channels c
  where c.clan_id is null
    and c.category = 'discord'::public.channel_category
    and c.sort_order = v.sort_order
);

update public.channels c
set
  name = v.name,
  url_link = v.url_link,
  image_path = nullif(v.image_path, ''),
  sort_order = v.sort_order,
  category = 'discord'::public.channel_category
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where c.clan_id is null
  and c.category = 'discord'::public.channel_category
  and c.sort_order = v.sort_order;
`;
}

async function main() {
  const rows = [];
  for (const entry of SERVERS) {
    const meta = await fetchDiscordMeta(entry);
    rows.push(meta);
    console.error(`OK ${entry.nameHint} -> ${meta.imagePath || "(sem ícone)"}`);
    await new Promise((r) => setTimeout(r, 200));
  }

  const outPath =
    process.argv[2] ??
    resolve(ROOT, "../hud-aom/supabase/migrations/20260617200000_channels_seed_discord.sql");
  writeFileSync(outPath, `${buildSql(rows)}\n`, "utf8");
  console.error(`Seed gravada em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
