/**
 * Seed incremental: YouTube Spartan Games + Twitch após Zapata AoM.
 * Uso: node scripts/fetch-channels-extra2-seed.mjs [caminho-do-arquivo.sql]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TWITCH_AFTER_ZAPATA = [
  { login: "caok_carvalho", sortOrder: 119 },
  { login: "playeraot", sortOrder: 120 },
  { login: "tuinojacare", sortOrder: 121 },
  { login: "ehnoirse_itachi", sortOrder: 122 },
  { login: "iammito", sortOrder: 123 },
  { login: "tsm_kravz", sortOrder: 124 },
];

const YOUTUBE_SORT = 36;
const TWITCH_SHIFT = TWITCH_AFTER_ZAPATA.length;

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(resolve(ROOT, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (value) env[key] = value;
    }
  } catch {
    /* ignore */
  }
  return env;
}

function loadYouTubeApiKey() {
  const env = loadEnv();
  return env.VITE_YOUTUBE_API_KEY ?? process.env.VITE_YOUTUBE_API_KEY ?? "";
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
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

function normalizeProfileImageUrl(url) {
  if (!url) return "";
  return url.replace(/-\d+x\d+\./, "-300x300.");
}

function formatLoginDisplayName(login) {
  return login
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function fetchYouTube(apiKey, handle, nameHint) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(apiKey)}`,
    { headers: { Referer: "http://localhost:5173/" } },
  );
  if (!res.ok) throw new Error(`${handle}: YouTube HTTP ${res.status}`);
  const snippet = (await res.json()).items?.[0]?.snippet;
  if (!snippet?.title) throw new Error(`${handle}: canal não encontrado`);
  const customHandle = snippet.customUrl?.replace(/^@/, "").trim() || handle;
  return {
    name: nameHint ?? snippet.title.trim(),
    urlLink: `https://www.youtube.com/@${customHandle}`,
    imagePath: pickThumbnail(snippet.thumbnails),
    category: "youtube",
    sortOrder: YOUTUBE_SORT,
  };
}

async function fetchTwitchAppToken(clientId, clientSecret) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`);
  if (!res.ok) throw new Error(`Twitch OAuth HTTP ${res.status}`);
  return (await res.json()).access_token;
}

async function fetchHelixUsers(clientId, token, logins) {
  const params = new URLSearchParams();
  for (const login of logins) params.append("login", login);
  const res = await fetch(`https://api.twitch.tv/helix/users?${params}`, {
    headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Twitch Helix HTTP ${res.status}`);
  const byLogin = new Map();
  for (const user of (await res.json()).data ?? []) {
    byLogin.set(user.login.toLowerCase(), user);
  }
  return byLogin;
}

async function fetchDecapiAvatar(login) {
  const res = await fetch(`https://decapi.me/twitch/avatar/${encodeURIComponent(login)}`);
  if (!res.ok) throw new Error(`${login}: decapi HTTP ${res.status}`);
  const text = (await res.text()).trim();
  if (!text.startsWith("http")) throw new Error(`${login}: avatar inválido`);
  return normalizeProfileImageUrl(text);
}

async function fetchTwitch(login, sortOrder, helixUser) {
  const urlLink = `https://www.twitch.tv/${login}`;
  if (helixUser) {
    return {
      name: helixUser.display_name.trim(),
      urlLink,
      imagePath: normalizeProfileImageUrl(helixUser.profile_image_url),
      category: "twitch",
      sortOrder,
    };
  }
  return {
    name: formatLoginDisplayName(login),
    urlLink,
    imagePath: await fetchDecapiAvatar(login),
    category: "twitch",
    sortOrder,
  };
}

function buildSql(rows) {
  const valueLines = rows
    .map(
      (r) =>
        `    (${sqlLiteral(r.name)}, ${sqlLiteral(r.urlLink)}, '${r.category}'::public.channel_category, ${sqlLiteral(r.imagePath)}, ${r.sortOrder})`,
    )
    .join(",\n");

  return `-- Links: Spartan Games (YouTube) + Twitch após Zapata AoM

-- Desloca Twitch com sort_order > 118 (após Zapata AoM)
do $$
begin
  if exists (
    select 1
    from public.channels
    where clan_id is null
      and category = 'twitch'::public.channel_category
      and lower(url_link) like '%zapataaom%'
  ) and not exists (
    select 1
    from public.channels
    where clan_id is null
      and category = 'twitch'::public.channel_category
      and lower(url_link) like '%caok_carvalho%'
  ) then
    update public.channels
    set sort_order = sort_order + ${TWITCH_SHIFT}
    where clan_id is null
      and category = 'twitch'::public.channel_category
      and sort_order > 118;
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
  const apiKey = loadYouTubeApiKey();
  if (!apiKey) {
    console.error("Defina VITE_YOUTUBE_API_KEY em aprendendo-age/.env");
    process.exit(1);
  }

  const env = loadEnv();
  const clientId = env.TWITCH_CLIENT_ID ?? process.env.TWITCH_CLIENT_ID ?? "";
  const clientSecret = env.TWITCH_CLIENT_SECRET ?? process.env.TWITCH_CLIENT_SECRET ?? "";

  let helixByLogin = new Map();
  if (clientId && clientSecret) {
    const token = await fetchTwitchAppToken(clientId, clientSecret);
    helixByLogin = await fetchHelixUsers(
      clientId,
      token,
      TWITCH_AFTER_ZAPATA.map((e) => e.login),
    );
  }

  const rows = [];

  const youtube = await fetchYouTube(apiKey, "spartangamesoficial", null);
  rows.push(youtube);
  console.error(`OK youtube -> ${youtube.name}`);

  for (const entry of TWITCH_AFTER_ZAPATA) {
    const meta = await fetchTwitch(entry.login, entry.sortOrder, helixByLogin.get(entry.login));
    rows.push(meta);
    console.error(`OK twitch ${entry.login} -> ${meta.name}`);
    if (!helixByLogin.size) await new Promise((r) => setTimeout(r, 120));
  }

  const outPath =
    process.argv[2] ??
    resolve(ROOT, "../hud-aom/supabase/migrations/20260617240000_channels_seed_spartan_twitch_extra.sql");
  writeFileSync(outPath, `${buildSql(rows)}\n`, "utf8");
  console.error(`Seed gravada em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
