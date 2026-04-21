import { Link } from "react-router-dom";

import { CompareInfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { parseGameNumber } from "@/lib/numericCompare";
import {
  construcaoById,
  construcaoSlugById,
  eraById,
  eraSlugById,
  panteaoById,
  panteaoSlugById,
  unidades,
} from "@/data/catalog";

type U = (typeof unidades)[number];

function dash(s: string | null | undefined): boolean {
  return s == null || s === "";
}

function renderPanteaoCell(u: U) {
  const panteao = u.panteao_id != null ? panteaoById.get(u.panteao_id) : undefined;
  if (panteao) {
    return (
      <Link
        to={`/panteoes/${panteaoSlugById.get(panteao.id) ?? panteao.id}`}
        className="text-amber-200 underline-offset-2 hover:underline"
      >
        {panteao.nome}
      </Link>
    );
  }
  if (u.panteao) {
    return <NotionText text={u.panteao} />;
  }
  return "—";
}

function showPanteaoRow(u1: U, u2: U) {
  const p1 = u1.panteao_id != null ? panteaoById.get(u1.panteao_id) : undefined;
  const p2 = u2.panteao_id != null ? panteaoById.get(u2.panteao_id) : undefined;
  return !!(p1 || u1.panteao || p2 || u2.panteao);
}

function renderEraCell(u: U) {
  const era = u.era_id != null ? eraById.get(u.era_id) : undefined;
  if (era) {
    return (
      <Link to={`/eras/${eraSlugById.get(era.id) ?? era.id}`} className="text-amber-200 underline-offset-2 hover:underline">
        {era.nome}
      </Link>
    );
  }
  if (u.era) {
    return <NotionText text={u.era} />;
  }
  return "—";
}

function showEraRow(u1: U, u2: U) {
  const e1 = u1.era_id != null ? eraById.get(u1.era_id) : undefined;
  const e2 = u2.era_id != null ? eraById.get(u2.era_id) : undefined;
  return !!(e1 || u1.era || e2 || u2.era);
}

function renderConstrucaoCell(u: U) {
  const constr = u.construcao_id != null ? construcaoById.get(u.construcao_id) : undefined;
  if (constr) {
    return (
      <Link
        to={`/construcoes/${construcaoSlugById.get(constr.id) ?? constr.id}`}
        className="text-amber-200 underline-offset-2 hover:underline"
      >
        {constr.nome}
      </Link>
    );
  }
  if (u.construcao) {
    return <NotionText text={u.construcao} />;
  }
  return "—";
}

function showConstrucaoRow(u1: U, u2: U) {
  const c1 = u1.construcao_id != null ? construcaoById.get(u1.construcao_id) : undefined;
  const c2 = u2.construcao_id != null ? construcaoById.get(u2.construcao_id) : undefined;
  return !!(c1 || u1.construcao || c2 || u2.construcao);
}

function numericPairFrom(a: unknown, b: unknown) {
  return { left: parseGameNumber(a), right: parseGameNumber(b) };
}

export function UnidadeVisaoGeralCompare({ u1, u2 }: { u1: U; u2: U }) {
  return (
    <div className="space-y-0">
      {!dash(u1.tipo) || !dash(u2.tipo) ? (
        <CompareInfoRow
          label="Tipo"
          left={u1.tipo ? <NotionText text={u1.tipo} /> : "—"}
          right={u2.tipo ? <NotionText text={u2.tipo} /> : "—"}
        />
      ) : null}
      {!dash(u1.categoria) || !dash(u2.categoria) ? (
        <CompareInfoRow
          label="Categoria"
          left={u1.categoria ? <NotionText text={u1.categoria} /> : "—"}
          right={u2.categoria ? <NotionText text={u2.categoria} /> : "—"}
        />
      ) : null}
      {showPanteaoRow(u1, u2) ? (
        <CompareInfoRow label="Panteão" left={renderPanteaoCell(u1)} right={renderPanteaoCell(u2)} />
      ) : null}
      {showEraRow(u1, u2) ? (
        <CompareInfoRow label="Era" left={renderEraCell(u1)} right={renderEraCell(u2)} />
      ) : null}
      {showConstrucaoRow(u1, u2) ? (
        <CompareInfoRow label="Construção" left={renderConstrucaoCell(u1)} right={renderConstrucaoCell(u2)} />
      ) : null}
    </div>
  );
}

export function UnidadeCombateCompare({ u1, u2 }: { u1: U; u2: U }) {
  return (
    <div className="space-y-0">
      <CompareInfoRow
        label="Pontos de vida"
        icon="aomr_hit_points_icon"
        left={u1.pontos_de_vida ?? "—"}
        right={u2.pontos_de_vida ?? "—"}
        numericPair={numericPairFrom(u1.pontos_de_vida, u2.pontos_de_vida)}
      />
      <CompareInfoRow
        label="Alcance"
        icon="rangeicon"
        left={u1.alcance ?? "—"}
        right={u2.alcance ?? "—"}
        numericPair={numericPairFrom(u1.alcance, u2.alcance)}
      />
      <CompareInfoRow
        label="Dano cortante"
        icon="hackdamage"
        left={u1.dano_cortante ?? "—"}
        right={u2.dano_cortante ?? "—"}
        numericPair={numericPairFrom(u1.dano_cortante, u2.dano_cortante)}
      />
      <CompareInfoRow
        label="Dano perfurante"
        icon="piercedamage"
        left={u1.dano_perfurante ?? "—"}
        right={u2.dano_perfurante ?? "—"}
        numericPair={numericPairFrom(u1.dano_perfurante, u2.dano_perfurante)}
      />
      <CompareInfoRow
        label="Velocidade de ataque (seg)"
        icon="aomr_rate_of_fire_icon"
        left={u1.velocidade_de_ataque_atk_s ?? "—"}
        right={u2.velocidade_de_ataque_atk_s ?? "—"}
        numericPair={numericPairFrom(u1.velocidade_de_ataque_atk_s, u2.velocidade_de_ataque_atk_s)}
      />
      <CompareInfoRow
        label="DPS"
        icon="attack_cur"
        left={u1.dps ?? "—"}
        right={u2.dps ?? "—"}
        numericPair={numericPairFrom(u1.dps, u2.dps)}
      />
      <CompareInfoRow
        label="Armadura de corte"
        icon="hackarmor"
        left={u1.armadura_anticorte ?? "—"}
        right={u2.armadura_anticorte ?? "—"}
        numericPair={numericPairFrom(u1.armadura_anticorte, u2.armadura_anticorte)}
      />
      <CompareInfoRow
        label="Armadura de perfuração"
        icon="piercearmor"
        left={u1.armadura_antiperfurante ?? "—"}
        right={u2.armadura_antiperfurante ?? "—"}
        numericPair={numericPairFrom(u1.armadura_antiperfurante, u2.armadura_antiperfurante)}
      />
      <CompareInfoRow
        label="Counter de"
        left={u1.counter_de ? <NotionText text={u1.counter_de} /> : "—"}
        right={u2.counter_de ? <NotionText text={u2.counter_de} /> : "—"}
      />
      <CompareInfoRow
        label="Multiplicador"
        left={u1.multiplicador != null && u1.multiplicador !== "" ? <NotionText text={u1.multiplicador} /> : "—"}
        right={u2.multiplicador != null && u2.multiplicador !== "" ? <NotionText text={u2.multiplicador} /> : "—"}
      />
      <CompareInfoRow
        label="Forte contra"
        left={u1.forte_contra ? <NotionText text={u1.forte_contra} /> : "—"}
        right={u2.forte_contra ? <NotionText text={u2.forte_contra} /> : "—"}
      />
      <CompareInfoRow
        label="Fraco contra"
        left={u1.fraco_contra ? <NotionText text={u1.fraco_contra} /> : "—"}
        right={u2.fraco_contra ? <NotionText text={u2.fraco_contra} /> : "—"}
      />
    </div>
  );
}

export function UnidadeCustoCompare({ u1, u2 }: { u1: U; u2: U }) {
  return (
    <div className="space-y-0">
      <CompareInfoRow
        label="Comida"
        icon="foodaom"
        left={u1.comida ?? "—"}
        right={u2.comida ?? "—"}
        numericPair={numericPairFrom(u1.comida, u2.comida)}
      />
      <CompareInfoRow
        label="Madeira"
        icon="woodaom"
        left={u1.madeira ?? "—"}
        right={u2.madeira ?? "—"}
        numericPair={numericPairFrom(u1.madeira, u2.madeira)}
      />
      <CompareInfoRow
        label="Ouro"
        icon="goldaom"
        left={u1.ouro ?? "—"}
        right={u2.ouro ?? "—"}
        numericPair={numericPairFrom(u1.ouro, u2.ouro)}
      />
      <CompareInfoRow
        label="População"
        icon="aomr_population_provision_icon"
        left={u1.populacao ?? "—"}
        right={u2.populacao ?? "—"}
        numericPair={numericPairFrom(u1.populacao, u2.populacao)}
      />
      <CompareInfoRow
        label="Tempo treino (seg)"
        icon="aomr_time_icon"
        left={u1.tempo_treinamento ?? "—"}
        right={u2.tempo_treinamento ?? "—"}
        numericPair={numericPairFrom(u1.tempo_treinamento, u2.tempo_treinamento)}
      />
      <CompareInfoRow
        label="Velocidade movimento"
        icon="aomr_speed_icon"
        left={u1.velocidade_movimento ?? "—"}
        right={u2.velocidade_movimento ?? "—"}
        numericPair={numericPairFrom(u1.velocidade_movimento, u2.velocidade_movimento)}
      />
      <CompareInfoRow
        label="Força atributos"
        icon="attack_cur"
        left={u1.forca_atributos ?? "—"}
        right={u2.forca_atributos ?? "—"}
        numericPair={numericPairFrom(u1.forca_atributos, u2.forca_atributos)}
      />
    </div>
  );
}
