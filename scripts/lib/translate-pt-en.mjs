import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, "../locale-glossary.json"), "utf8"));

const TOKEN_RE = /(:[a-z0-9_-]+:|<\/?(?:highlight(?:-[a-z]+)?|strong|code|em|a)[^>]*>)/gi;
const PT_INDICATORS = /\b(de|para|com|sem|uma|um|que|não|nao|por|sobre|aldeão|aldeões|constru|treine|treinar|poder|deus|deuses|era|eras|partida|jogador|unidade|unidades|templo|fortaleza|madeira|ouro|comida|favor|celeiro|armazém|armazem|gregos|egípcio|nórdico|chinês|japonês|asteca|atlante|também|são|está|estão|você|seu|sua|até|desde|após|antes|durante|entre|sobre|contra|utilizando|usando|criar|cria|erguer|proteger|atrain|gerar|deixar|permanece|sequência|início|começo|ritmo|escolha|passagem|primeira|primeiro|cabana|tropas|mític|passiv|destruição|poderos|important|ideal|metade|aprendizado|retorno|concentração|inconsistent|casuais|ativa|ativo)\b|[àáâãéêíóôõúç]/i;

const TRANSLATABLE_KEYS = new Set([
  "nome",
  "titulo",
  "descricao_curta",
  "descricao_resumida",
  "descricao_avancada",
  "description",
  "hint",
  "text",
  "texto",
  "tipo",
  "beneficia",
  "foco",
  "hierarquia",
  "forte_contra",
  "fraco_contra",
  "counter_de",
  "requisitos_para_subir_de_era",
  "pantheon",
  "origem",
  "todas_as_tecnologias",
  "tecnologias",
  "unidades",
  "panteao",
  "era",
  "beneficia",
]);

export function looksPortuguese(text) {
  if (typeof text !== "string" || !text.trim()) return false;
  return PT_INDICATORS.test(text);
}

function protectTokens(text) {
  const slots = [];
  const protectedText = text.replace(TOKEN_RE, (m) => {
    const i = slots.length;
    slots.push(m);
    return `\x00T${i}\x00`;
  });
  return { protectedText, slots };
}

function restoreTokens(text, slots) {
  return text.replace(/\x00T(\d+)\x00/g, (_, i) => slots[Number(i)] ?? "");
}

function applyPhrases(text) {
  let out = text;
  const phrases = [...(glossary.phrases ?? [])].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of phrases) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  const exact = glossary.exact ?? {};
  const keys = Object.keys(exact).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (out.includes(k)) out = out.split(k).join(exact[k]);
  }
  return out;
}

export function translateString(text, { parentKey } = {}) {
  if (typeof text !== "string" || !text.trim()) return text;
  if (!looksPortuguese(text) && parentKey !== "nome") return text;

  const { protectedText, slots } = protectTokens(text);
  let out = applyPhrases(protectedText);

  // Residual common replacements (longest first)
  const residual = [
    [" unidade alvo", " target unit"],
    [" unidade", " unit"],
    [" unidades", " units"],
    [" poder divino", " god power"],
    [" poderes divinos", " god powers"],
    [" deuses menores", " minor gods"],
    [" deuses maiores", " major gods"],
    [" deus menor", " minor god"],
    [" deus maior", " major god"],
    [" com o", " with the"],
    [" com a", " with the"],
    [" com ", " with "],
    [" para a ", " to "],
    [" para o ", " to the "],
    [" para ", " to "],
    [" na ", " on "],
    [" no ", " on the "],
    [" da ", " from "],
    [" do ", " of the "],
    [" de ", " of "],
    [" e ", " and "],
    [" ou ", " or "],
    [" que ", " that "],
    [" este ", " this "],
    [" esta ", " this "],
    [" esse ", " that "],
    [" essa ", " that "],
    [" seu ", " your "],
    [" sua ", " your "],
    [" você ", " you "],
    [" jogadores ", " players "],
    [" jogador ", " player "],
    [" partida", " match"],
    [" estratégia", " strategy"],
    [" economia", " economy"],
    [" coleta", " gathering"],
    [" treino", " training"],
    [" treinamento", " training"],
    [" dano divino", " divine damage"],
    [" dano ", " damage "],
    [" armadura", " armor"],
    [" velocidade", " speed"],
    [" alcance", " range"],
    [" custo", " cost"],
    [" bônus", " bonus"],
    [" bonus", " bonus"],
    [" melhoria", " upgrade"],
    [" melhorias", " upgrades"],
    [" tecnologia", " technology"],
    [" tecnologias", " technologies"],
    [" construção", " building"],
    [" construções", " buildings"],
    [" civilização", " civilization"],
    [" aliado", " ally"],
    [" aliados", " allies"],
    [" inimigo", " enemy"],
    [" inimigos", " enemies"],
    [" mapa", " map"],
    [" mapas", " maps"],
    [" celeiro", " granary"],
    [" celeiro ,", " granary,"],
    [" , além", ", also"],
    [" além de", " in addition to"],
    [" também", " also"],
    [" geralmente", " usually"],
    [" geralmente ", " usually "],
    [" quando ", " when "],
    [" enquanto ", " while "],
    [" após ", " after "],
    [" antes ", " before "],
    [" durante ", " during "],
    [" até ", " until "],
    [" desde ", " since "],
    [" sobre ", " about "],
    [" contra ", " against "],
    [" através ", " through "],
    [" através de ", " through "],
    [" utilizando ", " using "],
    [" usando ", " using "],
    [" criar ", " create "],
    [" cria ", " creates "],
    [" erguer ", " raise "],
    [" proteger ", " protect "],
    [" protegê-lo", " protect it"],
    [" atrai ", " attracts "],
    [" atrair ", " attract "],
    [" gera ", " generates "],
    [" gerar ", " generate "],
    [" deixar ", " drop off "],
    [" deixam ", " drop off "],
    [" permanece ", " stays "],
    [" permanecem ", " stay "],
    [" inicial", " initial"],
    [" iniciais", " starting"],
    [" exclusivas", " exclusive"],
    [" exclusivos", " exclusive"],
    [" exclusiva", " exclusive"],
    [" exclusivo", " exclusive"],
    [" referências", " references"],
    [" referência", " reference"],
    [" sequência", " sequence"],
    [" ações", " actions"],
    [" ação", " action"],
    [" início", " start"],
    [" começo", " beginning"],
    [" ritmo", " pace"],
    [" escolha", " choose"],
    [" escolher", " choose"],
    [" passagem", " advancing"],
    [" passar", " advance"],
    [" subir de era", " age up"],
    [" subir de Era", " age up"],
    [" primeira", " first"],
    [" primeiras", " first"],
    [" primeiros", " first"],
    [" primeiro", " first"],
    [" segundo", " second"],
    [" terceiro", " third"],
    [" quarto", " fourth"],
    [" quinto", " fifth"],
    [" cabanas", " barracks"],
    [" cabana", " barracks"],
    [" tropas", " troops"],
    [" tropa", " troop"],
    [" míticas", " myth"],
    [" mítica", " myth"],
    [" míticos", " myth"],
    [" mítico", " myth"],
    [" passiva", " passive"],
    [" passivo", " passive"],
    [" destruição", " destruction"],
    [" poderosas", " powerful"],
    [" poderosa", " powerful"],
    [" poderosos", " powerful"],
    [" poderoso", " powerful"],
    [" importantes", " important"],
    [" importante", " important"],
    [" ideal", " ideal"],
    [" Ideal", " Ideal"],
    [" metade", " half"],
    [" aprendizado", " learning"],
    [" retorno", " return"],
    [" acima da média", " above average"],
    [" joga bem", " plays well"],
    [" concentração", " concentration"],
    [" inconsistentes", " inconsistent"],
    [" casuais", " casual"],
    [" ativa", " active"],
    [" ativo", " active"],
    [" elo inicial", " starting rank"],
  ];
  for (const [from, to] of residual) {
    if (out.includes(from)) out = out.split(from).join(to);
  }

  return restoreTokens(out, slots);
}

export function localizeNode(node, key = null, parent = null) {
  if (Array.isArray(node)) {
    if (key === "campo" || key === "itens" || key === "god") {
      return node.map((item) =>
        typeof item === "string" ? translateString(item, { parentKey: key }) : localizeNode(item, null, node),
      );
    }
    return node.map((item, i) => localizeNode(item, String(i), node));
  }
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
      if (typeof v === "string" && (TRANSLATABLE_KEYS.has(k) || k.startsWith("no_oasis") || k.includes("trabalhador") || k.includes("requisitos") || k === "description" || k === "text" || k === "texto" || k === "descricao_curta" || k.startsWith("descricao"))) {
        copy[k] = translateString(v, { parentKey: k });
      } else {
        copy[k] = localizeNode(v, k, node);
      }
    }
    return copy;
  }
  if (typeof node === "string" && (key === "description" || key === "text" || key === "texto")) {
    return translateString(node, { parentKey: key });
  }
  return node;
}
