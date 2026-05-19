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
  /** Token `aomr_…` em `token_asset_map` (preenchido no JSON; não deriva de `ingles`). */
  icon: string | null;
};
import { buildIndexSlugMaps, buildRecordSlugMaps } from "@/lib/entitySlug";
import type { EntityNumRef } from "@/lib/entityRefs";
import type { UnidadeMultiplicadorItem } from "@/lib/unidadeMultiplicador";
import type { UnidadeTipoItem } from "@/lib/unidadeTipo";

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

/** Valores de `StartTableRow.type` usados no CSS (`StartStructuredContent`). */
export const START_TABLE_ROW_TYPE_OPTIONS = [
  { value: "", label: "(padrão)" },
  { value: "hint", label: "hint — dica" },
  { value: "blue", label: "blue — destaque azul" },
  { value: "pink", label: "pink — era / marco" },
  { value: "teal", label: "teal" },
  { value: "orange", label: "orange" },
  { value: "red", label: "red" },
  { value: "gray", label: "gray (como hint)" },
] as const;

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

/** Blocos do corpo legado Notion (`page-body`) para deuses com hierarquia Maior. */
export type DeusExplicacaoBloco =
  | { tipo: "citacao"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "titulo"; texto: string }
  | { tipo: "paragrafo"; texto: string };

export type DeusExplicacaoMaior = {
  blocos: DeusExplicacaoBloco[];
};

export type StartBuildOrder = {
  id: number;
  /** Rota `/starts/:slug` — derivado de título + autores (ver `buildStartSlug`). */
  slug: string;
  /** Ex.: `"new"` — lista em `/starts` coloca no topo e mostra etiqueta «Novo!». */
  status?: string;
  titulo: string;
  /** Autor(es) do build (após « - por » no Notion); vários separados por | no texto original. */
  author: string[];
  /** Deuses major/minor inferidos do título ou da civilização. */
  god: string[];
  /**
   * Chave em `token_asset_map.json`: ícone do deus (se `god` tiver 1 nome) ou do panteão.
   * @see panteoes.json `icon` / deuses `icon`
   */
  image: string;
  /** Nome do panteão em `panteoes.json` (ex.: Grego, Chinês); opcional se não houver match. */
  pantheon?: string;
  notion_file_id: string;
  youtube: string[];
  descricao_curta: string;
  /** Conteúdo em dados (mini-markup), sem HTML do Notion. */
  structured: StartStructured;
};

export const startsBuildOrder = startsBuildOrderJson as StartBuildOrder[];
export const startById = new Map(startsBuildOrder.map((s) => [s.id, s]));
export const startBySlug = new Map(startsBuildOrder.map((s) => [s.slug, s]));

export const aldeoes = aldeoesJson;
export const construcoes = construcoesJson;
export const deuses = deusesJson;
export const eras = erasJson;
export const mapas = mapasJson as Mapa[];

/** Referência `{ id, nome }` nos arrays `deuses`, `vill` e `starts` de `panteoes.json`. */
export type PanteaoRef = EntityNumRef;

/** Entrada em `godpowers.json` — deus, era e panteão como listas de {@link EntityNumRef}. */
export type Godpower = {
  id: number;
  nome: string;
  god: EntityNumRef[];
  era: EntityNumRef[];
  panteao: EntityNumRef[];
  icon: string;
  ingles?: string;
  cooldown_seg?: number;
  duracao_no_mapa_seg?: number;
  custo_repetir?: number;
  incremento_por_uso?: string | number;
  descricao_resumida?: string;
  descricao_avancada?: string;
};

export const godpowers = godpowersJson as Godpower[];

/** Entrada em `tecnologias.json` — custos e textos opcionais conforme a linha. */
export type Tecnologia = {
  nome: string;
  eras: EntityNumRef[];
  construcao_origem: EntityNumRef[] | string;
  /** `"Geral"` ou lista quando há `panteoes` civ‑específico no dado. */
  panteoes?: string | EntityNumRef[];
  god_especifico?: string | EntityNumRef[];
  beneficia?: string;
  campo?: string;
  comida?: number;
  favor?: number;
  icon: string;
  ingles?: string;
  madeira?: number;
  ouro?: number;
  tempo_s?: number;
  tipo?: string;
  todas_as_tecnologias?: string;
};

export const tecnologias = tecnologiasJson as Tecnologia[];

/** Entrada em `unidades_aom.json` — campos de combate/recursos opcionais conforme o tipo de unidade. */
export type Unidade = {
  id: number;
  nome: string;
  panteao: EntityNumRef[];
  era: EntityNumRef[];
  tipo: UnidadeTipoItem[];
  icon: string;
  ingles?: string;
  counter_de?: string;
  multiplicador?: UnidadeMultiplicadorItem[];
  categoria?: UnidadeTipoItem[];
  forte_contra?: string;
  fraco_contra?: string;
  construcao?: EntityNumRef[];
  god_dono?: EntityNumRef[];
  pontos_de_vida?: number;
  dano_cortante?: number;
  dano_perfurante?: number;
  dano_contundente?: number;
  dano_divino?: number;
  dano_area?: number;
  alcance?: number;
  velocidade_de_ataque_atk_s?: number;
  dps?: number;
  armadura_anticorte?: number;
  armadura_antiperfurante?: number;
  comida?: number;
  madeira?: number;
  ouro?: number;
  favor?: number;
  populacao?: number;
  tempo_treinamento?: number;
  velocidade_movimento?: number;
  forca_atributos?: number;
};

export const unidades = unidadesJson as Unidade[];

export const panteoes = panteoesJson;

export const deusById = new Map(deuses.map((d) => [d.id, d]));
export const panteaoById = new Map(panteoes.map((p) => [p.id, p]));
export const eraById = new Map(eras.map((e) => [e.id, e]));
export const godpowerById = new Map(godpowers.map((g) => [g.id, g]));
export const construcaoById = new Map(construcoes.map((c) => [c.id, c]));
export const unidadeById = new Map(unidades.map((u) => [u.id, u]));
export const aldeaoById = new Map(aldeoes.map((a) => [a.id, a]));

const deusSlugMaps = buildRecordSlugMaps(deuses, (d) => d.nome);
export const deusBySlug = deusSlugMaps.bySlug;
export const deusSlugById = deusSlugMaps.slugById;

const panteaoSlugMaps = buildRecordSlugMaps(panteoes, (p) => p.nome);
export const panteaoBySlug = panteaoSlugMaps.bySlug;
export const panteaoSlugById = panteaoSlugMaps.slugById;

const eraSlugMaps = buildRecordSlugMaps(eras, (e) => e.nome);
export const eraBySlug = eraSlugMaps.bySlug;
export const eraSlugById = eraSlugMaps.slugById;

const godpowerSlugMaps = buildRecordSlugMaps(godpowers, (g) => g.nome);
export const godpowerBySlug = godpowerSlugMaps.bySlug;
export const godpowerSlugById = godpowerSlugMaps.slugById;

const construcaoSlugMaps = buildRecordSlugMaps(construcoes, (c) => c.nome);
export const construcaoBySlug = construcaoSlugMaps.bySlug;
export const construcaoSlugById = construcaoSlugMaps.slugById;

const unidadeSlugMaps = buildRecordSlugMaps(unidades, (u) => u.nome);
export const unidadeBySlug = unidadeSlugMaps.bySlug;
export const unidadeSlugById = unidadeSlugMaps.slugById;

const aldeaoSlugMaps = buildRecordSlugMaps(aldeoes, (a) => a.nome);
export const aldeaoBySlug = aldeaoSlugMaps.bySlug;
export const aldeaoSlugById = aldeaoSlugMaps.slugById;

const tecnologiaSlugMaps = buildIndexSlugMaps(tecnologias, (t) => t.nome ?? "");
export const tecnologiaBySlug = tecnologiaSlugMaps.bySlug;
export const tecnologiaSlugByIndex = tecnologiaSlugMaps.slugByIndex;

const mapaSlugMaps = buildIndexSlugMaps(mapas, (m) => m.nome ?? "");
export const mapaBySlug = mapaSlugMaps.bySlug;
export const mapaSlugByIndex = mapaSlugMaps.slugByIndex;

