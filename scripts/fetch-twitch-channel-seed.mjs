/**
 * Busca metadados dos canais Twitch (nome, url_link, avatar) e grava a seed SQL.
 * Uso: node scripts/fetch-twitch-channel-seed.mjs [caminho-do-arquivo.sql]
 *
 * Preferencial: TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET em aprendendo-age/.env (Helix API).
 * Fallback: avatar via decapi.me; nome derivado do login.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

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

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function parseTwitchLogin(urlOrLogin) {
  const trimmed = urlOrLogin.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  if (!trimmed.includes("://")) return trimmed.toLowerCase();

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "twitch.tv") return null;
    const login = url.pathname.split("/").filter(Boolean)[0];
    return login?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function formatLoginDisplayName(login) {
  return login
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Fallback quando Helix não está configurado (login → nome conhecido na comunidade). */
const DISPLAY_NAME_HINTS = {
  keven_lightyagami: "KevenAOM",
  ocafeina: "ocafeina",
  forkxx: "Forkxx",
  thunder_aom: "Thunder AoM",
  errow_1988: "Errow",
  milanogods: "MilanoGods",
  xmosca: "xMosca",
  tunison: "Tunison",
  zapataaom: "Zapata AoM",
  superafimmt: "Super Afim MT",
  shaolimmatadordeporco5: "Shaolin Matador de Porco",
  jerbot: "Jerbot",
  ajaxmanuel: "Professor Ajax",
  caok_renegad0: "CaOK Renegad0",
  balerionaom: "Balerion AOM",
  ericbr_: "EricBR",
  gen_gama: "Gen Gama",
  metall0_: "Metall0",
  gagliardogabriel: "Gabriel Galhardo",
};

function fallbackDisplayName(login) {
  return DISPLAY_NAME_HINTS[login] ?? formatLoginDisplayName(login);
}

function normalizeProfileImageUrl(url) {
  if (!url) return "";
  return url.replace(/-\d+x\d+\./, "-300x300.");
}

const CHANNELS = [
  { url: "https://www.twitch.tv/keven_lightyagami", sortOrder: 110 },
  { url: "https://www.twitch.tv/ocafeina", sortOrder: 111 },
  { url: "https://www.twitch.tv/forkxx", sortOrder: 112 },
  { url: "https://www.twitch.tv/thunder_aom", sortOrder: 113 },
  { url: "https://www.twitch.tv/errow_1988", sortOrder: 114 },
  { url: "https://www.twitch.tv/milanogods", sortOrder: 115 },
  { url: "https://www.twitch.tv/xmosca", sortOrder: 116 },
  { url: "https://www.twitch.tv/tunison", sortOrder: 117 },
  { url: "https://www.twitch.tv/zapataaom", sortOrder: 118 },
  { url: "https://www.twitch.tv/superafimmt", sortOrder: 119 },
  { url: "https://www.twitch.tv/shaolimmatadordeporco5", sortOrder: 120 },
  { url: "https://www.twitch.tv/jerbot", sortOrder: 121 },
  { url: "https://www.twitch.tv/ajaxmanuel", sortOrder: 122 },
  { url: "https://www.twitch.tv/caok_renegad0", sortOrder: 123 },
  { url: "https://www.twitch.tv/balerionaom", sortOrder: 124 },
  { url: "https://www.twitch.tv/ericbr_", sortOrder: 125 },
  { url: "https://www.twitch.tv/gen_gama", sortOrder: 126 },
  { url: "https://www.twitch.tv/metall0_", sortOrder: 127 },
  { url: "https://www.twitch.tv/gagliardogabriel", sortOrder: 128 },
];

async function fetchTwitchAppToken(clientId, clientSecret) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`);
  if (!res.ok) {
    throw new Error(`Twitch OAuth HTTP ${res.status}`);
  }
  const json = await res.json();
  if (!json.access_token) {
    throw new Error("Twitch OAuth: token ausente");
  }
  return json.access_token;
}

async function fetchHelixUsers(clientId, token, logins) {
  const params = new URLSearchParams();
  for (const login of logins) {
    params.append("login", login);
  }
  const res = await fetch(`https://api.twitch.tv/helix/users?${params}`, {
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Twitch Helix HTTP ${res.status}`);
  }
  const json = await res.json();
  const byLogin = new Map();
  for (const user of json.data ?? []) {
    byLogin.set(user.login.toLowerCase(), user);
  }
  return byLogin;
}

async function fetchDecapiAvatar(login) {
  const res = await fetch(`https://decapi.me/twitch/avatar/${encodeURIComponent(login)}`);
  if (!res.ok) {
    throw new Error(`${login}: decapi avatar HTTP ${res.status}`);
  }
  const text = (await res.text()).trim();
  if (!text.startsWith("http")) {
    throw new Error(`${login}: avatar inválido`);
  }
  return normalizeProfileImageUrl(text);
}

async function fetchChannelMeta(login, helixUser) {
  const urlLink = `https://www.twitch.tv/${login}`;
  if (helixUser) {
    return {
      name: helixUser.display_name.trim(),
      urlLink,
      imagePath: normalizeProfileImageUrl(helixUser.profile_image_url),
    };
  }

  const imagePath = await fetchDecapiAvatar(login);
  return {
    name: fallbackDisplayName(login),
    urlLink,
    imagePath,
  };
}

function buildSql(rows) {
  const valueLines = rows
    .map(
      (r) =>
        `    (${sqlLiteral(r.name)}, ${sqlLiteral(r.urlLink)}, ${sqlLiteral(r.imagePath)}, ${r.sortOrder})`,
    )
    .join(",\n");

  return `-- Links: canais Twitch da comunidade BR (metadados via Twitch Helix / decapi)
-- clan_id nulo = exibidos em /links-streamers
-- sort_order 110+ = após sites (0–5) e YouTube (10–28)

insert into public.channels (name, url_link, category, image_path, sort_order)
select v.name, v.url_link, 'twitch'::public.channel_category, nullif(v.image_path, ''), v.sort_order
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where not exists (
  select 1
  from public.channels c
  where c.clan_id is null
    and c.category = 'twitch'::public.channel_category
    and c.sort_order = v.sort_order
);

update public.channels c
set
  name = v.name,
  url_link = v.url_link,
  image_path = nullif(v.image_path, ''),
  sort_order = v.sort_order,
  category = 'twitch'::public.channel_category
from (
  values
${valueLines}
) as v(name, url_link, image_path, sort_order)
where c.clan_id is null
  and c.category = 'twitch'::public.channel_category
  and c.sort_order = v.sort_order;
`;
}

async function main() {
  const env = loadEnv();
  const clientId = env.TWITCH_CLIENT_ID ?? process.env.TWITCH_CLIENT_ID ?? "";
  const clientSecret = env.TWITCH_CLIENT_SECRET ?? process.env.TWITCH_CLIENT_SECRET ?? "";

  const entries = CHANNELS.map((entry) => {
    const login = parseTwitchLogin(entry.url);
    if (!login) throw new Error(`Login inválido: ${entry.url}`);
    return { login, sortOrder: entry.sortOrder };
  });

  let helixByLogin = new Map();
  if (clientId && clientSecret) {
    const token = await fetchTwitchAppToken(clientId, clientSecret);
    helixByLogin = await fetchHelixUsers(
      clientId,
      token,
      entries.map((e) => e.login),
    );
    console.error(`Helix: ${helixByLogin.size} usuários`);
  } else {
    console.error("TWITCH_CLIENT_ID/SECRET ausentes — usando decapi para avatares");
  }

  const rows = [];
  for (const entry of entries) {
    const meta = await fetchChannelMeta(entry.login, helixByLogin.get(entry.login));
    rows.push({ ...meta, sortOrder: entry.sortOrder });
    console.error(`OK ${entry.login} -> ${meta.name}`);
    if (!helixByLogin.size) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  const outPath =
    process.argv[2] ??
    resolve(ROOT, "../hud-aom/supabase/migrations/20260617170000_channels_seed_twitch_streamers.sql");
  writeFileSync(outPath, `${buildSql(rows)}\n`, "utf8");
  console.error(`Seed gravada em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
