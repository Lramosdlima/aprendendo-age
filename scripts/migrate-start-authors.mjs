import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "../src/data/starts_build_order.json");

const AUTHOR_NAME_ALIASES = { "Light Yagami": "KevenAoM" };

const START_AUTHOR_IMAGE_URLS = {
  Moose:
    "https://yt3.googleusercontent.com/doYIQ7DUckOTiQwwCIyBrsMoMYmzaXYbhJnIJqCPS176Sztk_NNsLq1MV-0bHRDeuxqu0rPmTA=s160-c-k-c0x00ffffff-no-rj",
  TheRapl:
    "https://yt3.googleusercontent.com/0jz4T0uQ3pmAl953SR6BFeqs8dgNPvJcEjkcwR7UhbbyQZwcslyEIdgCY5owdCF1HV0SvfFz3A=s160-c-k-c0x00ffffff-no-rj",
  KevenAoM:
    "https://yt3.googleusercontent.com/8GDya_nISo4VD6PygrZ8ziWPVma_DCQ6PbBJLYL4ovRF4hr-rAapq6s5sez3YDZVZAFdQAKU7w=s160-c-k-c0x00ffffff-no-rj",
  Miniyeti:
    "https://avatars.steamstatic.com/49d94564bef50f7ae277379ab49d745e18590301_full.jpg",
  Cafeína:
    "https://avatars.steamstatic.com/c169a4e0670e4fb33ce0fb1d9321b80a73adc7a0_full.jpg",
  "Morley Games":
    "https://yt3.googleusercontent.com/whaU7TrzxilqsCWJfKdcBCaEjRqpGL8Dt6JaWUqhrOJkjKnFmRDNYcqWswb5fb3OHzaTBAYg=s160-c-k-c0x00ffffff-no-rj",
  Morley:
    "https://yt3.googleusercontent.com/whaU7TrzxilqsCWJfKdcBCaEjRqpGL8Dt6JaWUqhrOJkjKnFmRDNYcqWswb5fb3OHzaTBAYg=s160-c-k-c0x00ffffff-no-rj",
  Balerion:
    "https://yt3.googleusercontent.com/2poWZZtWyNVFCtLMmiiYeLwZw1WYr-VwUdDAtQc-BflKZeVE7G_RxMgRFuMkzQYh4A6Q2qLC9w=s160-c-k-c0x00ffffff-no-rj",
  HuskSuppe:
    "https://yt3.googleusercontent.com/LSsFrC1RmJi-mqiNTmC5W2eDMShIq3kDKb0kEEx3QMlYPZmsqAc0i1cDdGoval6zAmlveh2HwQ=s160-c-k-c0x00ffffff-no-rj",
  Aussie_Drongo: "/assets/authors/aussie-drongo.jpg",
};

function normalizeStartAuthorName(raw) {
  const trimmed = raw.trim();
  return AUTHOR_NAME_ALIASES[trimmed] ?? trimmed;
}

function startAuthorImageUrl(name) {
  const normalized = normalizeStartAuthorName(name);
  if (START_AUTHOR_IMAGE_URLS[normalized]) return START_AUTHOR_IMAGE_URLS[normalized];
  if (/^Cafeína\b/i.test(normalized)) return START_AUTHOR_IMAGE_URLS["Cafeína"];
  return undefined;
}

function toAuthorObject(raw) {
  if (typeof raw === "object" && raw !== null && "name" in raw) {
    const name = normalizeStartAuthorName(String(raw.name));
    const imageUrl = raw.imageUrl ?? startAuthorImageUrl(name);
    return imageUrl ? { name, imageUrl } : { name };
  }
  const name = normalizeStartAuthorName(String(raw));
  const imageUrl = startAuthorImageUrl(name);
  return imageUrl ? { name, imageUrl } : { name };
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let migrated = 0;
for (const s of data) {
  if (!Array.isArray(s.author)) continue;
  const next = s.author.map(toAuthorObject);
  if (JSON.stringify(next) !== JSON.stringify(s.author)) migrated++;
  s.author = next;
}
fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Migrated ${data.length} starts (${migrated} entries changed).`);
