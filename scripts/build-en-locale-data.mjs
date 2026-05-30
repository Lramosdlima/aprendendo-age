#!/usr/bin/env node
/**
 * Gera src/data/locale/en/*.json a partir dos JSON PT na raiz de src/data.
 * - nome ← ingles quando existir
 * - traduz strings conhecidas via dicionário
 * - preserva tokens :aomr_*:, markup e IDs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../src/data");
const OUT_DIR = path.resolve(DATA_DIR, "locale/en");

const PHRASES = [
  ["Essa é a 1ª Era do jogo!", "This is the 1st Age of the game!"],
  ["Já começa com acesso a 1 poder divíno", "Starts with access to 1 god power"],
  ["algumas construções básicas", "some basic buildings"],
  ["Seu start é importante para definir o ritmo da partida", "Your start is important to set the pace of the match"],
  ["então escolha bem baseado na estratégia", "so choose wisely based on your strategy"],
  ["Build Order importante!", "Build order important!"],
  ["A partir daqui podemos escolher 1 entre 2 deuses menores", "From here we can choose 1 of 2 minor gods"],
  ["com passiva, unidades míticas, poder divino e tecnologias exclusivas", "with passive, myth units, god power, and exclusive technologies"],
  ["Temos acesso as primeiras cabanas para treinar tropas", "We gain access to the first barracks to train troops"],
  ["A depender de sua estratégia", "Depending on your strategy"],
  ["coloque em prática seu", "put your"],
  ["Ideal: Passe no tempo de", "Ideal: Age up in"],
  ["minutos!", "minutes!"],
  ["Geralmente necessário para ter mais poder de destruição", "Usually needed for more destruction power"],
  ["para construções na fortaleza", "for fortress buildings"],
  ["utilizando unidades de cerco", "using siege units"],
  ["ou para acessar tropas mais poderosas", "or to access more powerful troops"],
  ["Ideal: tempo de", "Ideal: time of"],
  ["Sequência de ações para o início do jogo", "Sequence of actions for the start of the game"],
  ["da Arcaica até a Clássica", "from Archaic to Classical"],
  ["Começa com", "Starts with"],
  ["Aldeões", "Villagers"],
  ["Aldeão", "Villager"],
  ["deuses menores", "minor gods"],
  ["deuses maiores", "major gods"],
  ["poder divino", "god power"],
  ["poderes divinos", "god powers"],
  ["unidades míticas", "myth units"],
  ["Infantaria", "Infantry"],
  ["Cavalaria", "Cavalry"],
  ["Arqueiros", "Archers"],
  ["Cerco", "Siege"],
  ["Herói", "Hero"],
  ["Heróis", "Heroes"],
  ["Maior", "Major"],
  ["Menor", "Minor"],
  ["Grego", "Greek"],
  ["Egípcio", "Egyptian"],
  ["Nórdico", "Norse"],
  ["Atlante", "Atlantean"],
  ["Chinês", "Chinese"],
  ["Japonês", "Japanese"],
  ["Asteca", "Aztec"],
  ["Templo", "Temple"],
  ["Casa", "House"],
  ["Mercado", "Market"],
  ["Armaria", "Armory"],
  ["Fortaleza", "Fortress"],
  ["Ranqueada", "Ranked"],
  ["Terra", "Land"],
  ["Naval", "Naval"],
  ["Econômico", "Economic"],
  ["Militar", "Military"],
  ["Geral", "General"],
  ["Cancelar último item", "Cancel last item"],
  ["Cancelar fila inteira", "Cancel entire queue"],
  ["Quase metade dos jogadores", "Almost half of players"],
  ["Elo inicial, aprendizado, retorno ao jogo", "Starting rank, learning, returning to the game"],
  ["Maior concentração ativa", "Largest active concentration"],
  ["Jogadores casuais, mas ainda inconsistentes", "Casual players, but still inconsistent"],
  ["Acima da média!", "Above average!"],
  ["Aqui o jogador já \"joga bem\"", "Here the player already \"plays well\""],
  ["Cancelar", "Cancel"],
  ["Comparar", "Compare"],
  ["Filtrar", "Filter"],
  ["Nenhum resultado", "No results"],
  ["Descrição", "Description"],
  ["Origem", "Origin"],
  ["Tipo", "Type"],
  ["Padrão", "Default"],
  ["Partidas rápidas", "Quick match"],
  ["Arcaica", "Archaic"],
  ["Clássica", "Classical"],
  ["Heróica", "Heroic"],
  ["Mítica", "Mythic"],
  ["Titan", "Titan"],
];

const LABEL_MAP = {
  "Infantaria & Heróis": "Infantry & Heroes",
  "Cavalaria & Arqueiros": "Cavalry & Archers",
  "Eco & Boom": "Eco & Boom",
  "Rush & Aggro": "Rush & Aggro",
  "Turtle & Defesa": "Turtle & Defense",
  "Econômico 💰": "Economic 💰",
  "Militar ⚔": "Military ⚔",
  "Militar ⚔️": "Military ⚔️",
  "Recurso ⚒": "Resource ⚒",
  "Básico": "Basic",
  "Militar": "Military",
  "Defesa": "Defense",
  "Tecnologia": "Technology",
  "Terra 🌳": "Land 🌳",
  "Naval 🌊": "Naval 🌊",
  "Híbrido 🌊🌳": "Hybrid 🌊🌳",
  "AoM: Retold (2024)": "AoM: Retold (2024)",
  "AoM: Extended Edition": "AoM: Extended Edition",
  "AoM (2002)": "AoM (2002)",
  "Soft-Counter Cavalaria": "Soft-Counter Cavalry",
  "Soft-Counter Infantaria": "Soft-Counter Infantry",
};

function translateString(value) {
  if (typeof value !== "string") return value;
  let out = LABEL_MAP[value] ?? value;
  for (const [from, to] of PHRASES) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

function localizeNode(node) {
  if (Array.isArray(node)) return node.map(localizeNode);
  if (node && typeof node === "object") {
    const copy = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "ingles") {
        copy[k] = v;
        continue;
      }
      if (k === "nome" && typeof node.ingles === "string" && node.ingles.trim()) {
        copy.nome = node.ingles;
        copy.ingles = node.ingles;
        continue;
      }
      copy[k] = localizeNode(v);
    }
    return copy;
  }
  return translateString(node);
}

const JSON_FILES = [
  "aldeoes.json",
  "construcoes.json",
  "deuses_aom.json",
  "eras.json",
  "godpowers.json",
  "mapas.json",
  "panteoes.json",
  "starts_build_order.json",
  "tecnologias.json",
  "unidades_aom.json",
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const file of JSON_FILES) {
  const src = path.join(DATA_DIR, file);
  const raw = JSON.parse(fs.readFileSync(src, "utf8"));
  const out = localizeNode(raw);
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Wrote", file);
}

// clans.ts → clans.json for EN
const clansSrc = path.join(DATA_DIR, "clans.ts");
const clansRaw = fs.readFileSync(clansSrc, "utf8");
const clansMatch = clansRaw.match(/export const clans[^=]*=\s*(\[[\s\S]*?\]);/);
if (clansMatch) {
  const clans = Function(`return ${clansMatch[1]}`)();
  fs.writeFileSync(path.join(OUT_DIR, "clans.json"), JSON.stringify(clans, null, 2) + "\n", "utf8");
  console.log("Wrote clans.json");
}

console.log("Done.");
