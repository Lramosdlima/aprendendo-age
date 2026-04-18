import { Link } from "react-router-dom";

import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { construcaoById, eraById, panteaoById, unidades } from "@/data/catalog";

type U = (typeof unidades)[number];

export function UnidadeVisaoGeralBody({ u }: { u: U }) {
  const era = u.era_id != null ? eraById.get(u.era_id) : undefined;
  const panteao = u.panteao_id != null ? panteaoById.get(u.panteao_id) : undefined;
  const constr = u.construcao_id != null ? construcaoById.get(u.construcao_id) : undefined;

  return (
    <div className="space-y-0">
      {u.tipo ? (
        <InfoRow label="Tipo">
          <NotionText text={u.tipo} />
        </InfoRow>
      ) : null}
      {u.categoria ? (
        <InfoRow label="Categoria">
          <NotionText text={u.categoria} />
        </InfoRow>
      ) : null}
      {panteao ? (
        <InfoRow label="Panteão">
          <Link to={`/panteoes/${panteao.id}`} className="text-amber-200 underline-offset-2 hover:underline">
            {panteao.nome}
          </Link>
        </InfoRow>
      ) : u.panteao ? (
        <InfoRow label="Panteão">
          <NotionText text={u.panteao} />
        </InfoRow>
      ) : null}
      {era ? (
        <InfoRow label="Era">
          <Link to={`/eras/${era.id}`} className="text-amber-200 underline-offset-2 hover:underline">
            {era.nome}
          </Link>
        </InfoRow>
      ) : u.era ? (
        <InfoRow label="Era">
          <NotionText text={u.era} />
        </InfoRow>
      ) : null}
      {constr ? (
        <InfoRow label="Construção">
          <Link to={`/construcoes/${constr.id}`} className="text-amber-200 underline-offset-2 hover:underline">
            {constr.nome}
          </Link>
        </InfoRow>
      ) : u.construcao ? (
        <InfoRow label="Construção">
          <NotionText text={u.construcao} />
        </InfoRow>
      ) : null}
    </div>
  );
}

export function UnidadeCombateBody({ u }: { u: U }) {
  return (
    <div className="space-y-0">
      <InfoRow label="PV">{u.pontos_de_vida ?? "—"}</InfoRow>
      <InfoRow label="DPS">{u.dps ?? "—"}</InfoRow>
      <InfoRow label="Vel. ataque (s)">{u.velocidade_de_ataque_atk_s ?? "—"}</InfoRow>
      <InfoRow label="Dano cortante">{u.dano_cortante ?? "—"}</InfoRow>
      <InfoRow label="Arm. corte">{u.armadura_anticorte ?? "—"}</InfoRow>
      <InfoRow label="Arm. perfuração">{u.armadura_antiperfurante ?? "—"}</InfoRow>
      <InfoRow label="Counter de">{u.counter_de ? <NotionText text={u.counter_de} /> : "—"}</InfoRow>
      <InfoRow label="Multiplicador">{u.multiplicador ?? "—"}</InfoRow>
      <InfoRow label="Forte contra">{u.forte_contra ? <NotionText text={u.forte_contra} /> : "—"}</InfoRow>
      <InfoRow label="Fraco contra">{u.fraco_contra ? <NotionText text={u.fraco_contra} /> : "—"}</InfoRow>
    </div>
  );
}

export function UnidadeCustoBody({ u }: { u: U }) {
  return (
    <div className="space-y-0">
      <InfoRow label="Comida">{u.comida ?? "—"}</InfoRow>
      <InfoRow label="Madeira">{u.madeira ?? "—"}</InfoRow>
      <InfoRow label="Ouro">{u.ouro ?? "—"}</InfoRow>
      <InfoRow label="População">{u.populacao ?? "—"}</InfoRow>
      <InfoRow label="Tempo treino (s)">{u.tempo_treinamento ?? "—"}</InfoRow>
      <InfoRow label="Velocidade movimento">{u.velocidade_movimento ?? "—"}</InfoRow>
      <InfoRow label="Força atributos">{u.forca_atributos ?? "—"}</InfoRow>
    </div>
  );
}
