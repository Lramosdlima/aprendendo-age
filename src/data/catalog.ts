import aldeoesJson from "./aldeoes.json";
import construcoesJson from "./construcoes.json";
import deusesJson from "./deuses_aom.json";
import erasJson from "./eras.json";
import godpowersJson from "./godpowers.json";
import mapasJson from "./mapas.json";

/** Entrada em `mapas.json` — campos sim/não são booleanos para i18n. */
export type Mapa = {
  nome: string;
  ingles: string;
  mapas_da_ranqueada: boolean;
  saiu_da_ranqueada: boolean;
  origem: string;
  padrao: boolean;
  partidas_rapidas: boolean;
  tipo: string;
};
import panteoesJson from "./panteoes.json";
import startsBuildOrderJson from "./starts_build_order.json";
import tecnologiasJson from "./tecnologias.json";
import unidadesJson from "./unidades_aom.json";

export type StartTableRow = {
  description: string;
  food: string | null;
  wood: string | null;
  gold: string | null;
  favor: string | null;
  pop: string | null;
  type: string | null;
};

export type StartLeadBlock =
  | { kind: "callout"; text: string }
  | { kind: "heading"; level: 1 | 2 | 3; text: string };

/** Rodapé após a tabela: parágrafos simples, títulos ou callouts. */
export type StartFooterBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "callout"; text: string }
  | { kind: "heading"; level: 1 | 2 | 3; text: string };

export type StartBuildSegment = {
  lead?: StartLeadBlock[];
  table?: StartTableRow[];
  footer?: StartFooterBlock[];
};

export type StartStructured = {
  segments: StartBuildSegment[];
};

export type StartBuildOrder = {
  id: number;
  titulo: string;
  /** Deus principal inferido do título; vazio se for só civilização ou sem correspondência. */
  god: string;
  notion_file_id: string;
  youtube: string[];
  descricao_curta: string;
  /** Conteúdo em dados (mini-markup), sem HTML do Notion. */
  structured: StartStructured;
};

export const startsBuildOrder = startsBuildOrderJson as StartBuildOrder[];
export const startById = new Map(startsBuildOrder.map((s) => [s.id, s]));

export const aldeoes = aldeoesJson;
export const construcoes = construcoesJson;
export const deuses = deusesJson;
export const eras = erasJson;
export const godpowers = godpowersJson;
export const mapas = mapasJson as Mapa[];
export const panteoes = panteoesJson;
export const tecnologias = tecnologiasJson;
export const unidades = unidadesJson;

export const deusById = new Map(deuses.map((d) => [d.id, d]));
export const panteaoById = new Map(panteoes.map((p) => [p.id, p]));
export const eraById = new Map(eras.map((e) => [e.id, e]));
export const godpowerById = new Map(godpowers.map((g) => [g.id, g]));
export const construcaoById = new Map(construcoes.map((c) => [c.id, c]));
export const unidadeById = new Map(unidades.map((u) => [u.id, u]));
export const aldeaoById = new Map(aldeoes.map((a) => [a.id, a]));

