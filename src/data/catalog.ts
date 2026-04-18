import aldeoesJson from "./aldeoes.json";
import construcoesJson from "./construcoes.json";
import deusesJson from "./deuses_aom.json";
import erasJson from "./eras.json";
import godpowersJson from "./godpowers.json";
import mapasJson from "./mapas.json";
import panteoesJson from "./panteoes.json";
import startsBuildOrderJson from "./starts_build_order.json";
import tecnologiasJson from "./tecnologias.json";
import unidadesJson from "./unidades_aom.json";

export type StartBuildOrder = {
  id: number;
  titulo: string;
  /** Deus principal inferido do título; vazio se for só civilização ou sem correspondência. */
  god: string;
  notion_file_id: string;
  youtube: string[];
  descricao_curta: string;
  /** Corpo exportado do Notion: títulos, callouts, tabelas simple-table, bookmarks. */
  conteudo_html: string;
};

export const startsBuildOrder = startsBuildOrderJson as StartBuildOrder[];
export const startById = new Map(startsBuildOrder.map((s) => [s.id, s]));

export const aldeoes = aldeoesJson;
export const construcoes = construcoesJson;
export const deuses = deusesJson;
export const eras = erasJson;
export const godpowers = godpowersJson;
export const mapas = mapasJson;
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

