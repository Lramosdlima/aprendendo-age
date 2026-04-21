import { Link } from "react-router-dom";

import { InfoRow } from "@/components/ui/InfoRow";
import { formatArmorPercent } from "@/lib/armorDisplay";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { NotionText } from "@/components/ui/NotionText";
import {
  hasMultiplicadorContent,
  multiplicadorItemsToNotionText,
} from "@/lib/unidadeMultiplicador";
import { hasTipoContent } from "@/lib/unidadeTipo";
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

export function UnidadeVisaoGeralBody({ u }: { u: U }) {
  const era = u.era_id != null ? eraById.get(u.era_id) : undefined;
  const panteao =
    u.panteao_id != null ? panteaoById.get(u.panteao_id) : undefined;
  const constr =
    u.construcao_id != null ? construcaoById.get(u.construcao_id) : undefined;

  return (
    <div className="space-y-0">
      {hasTipoContent(u.tipo) ? (
        <InfoRow label="Tipo">
          <UnidadeTipoLine tipo={u.tipo} colored />
        </InfoRow>
      ) : null}
      {u.categoria ? (
        <InfoRow label="Categoria">
          <NotionText text={u.categoria} />
        </InfoRow>
      ) : null}
      {panteao ? (
        <InfoRow label="Panteão">
          <Link
            to={`/panteoes/${panteaoSlugById.get(panteao.id) ?? panteao.id}`}
            className="text-amber-200 underline-offset-2 hover:underline"
          >
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
          <Link
            to={`/eras/${eraSlugById.get(era.id) ?? era.id}`}
            className="text-amber-200 underline-offset-2 hover:underline"
          >
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
          <Link
            to={`/construcoes/${construcaoSlugById.get(constr.id) ?? constr.id}`}
            className="text-amber-200 underline-offset-2 hover:underline"
          >
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
      <InfoRow label="Pontos de vida" icon="aomr_hit_points_icon">
        {u.pontos_de_vida ?? "—"}
      </InfoRow>
      <InfoRow label="Alcance" icon="rangeicon">
        {u.alcance ?? "—"}
      </InfoRow>  
      <InfoRow label="Dano cortante" icon="hackdamage">
        {u.dano_cortante ?? "—"}
      </InfoRow>
      <InfoRow label="Dano perfurante" icon="piercedamage">
        {u.dano_perfurante ?? "—"}
      </InfoRow>
      <InfoRow label="Velocidade de ataque (seg)" icon="aomr_rate_of_fire_icon">
        {u.velocidade_de_ataque_atk_s ?? "—"}
      </InfoRow>
      <InfoRow label="DPS" icon="attack_cur">
        {u.dps ?? "—"}
      </InfoRow>
      <InfoRow label="Armadura de corte" icon="hackarmor">
        {formatArmorPercent(u.armadura_anticorte)}
      </InfoRow>
      <InfoRow label="Armadura de perfuração" icon="piercearmor">
        {formatArmorPercent(u.armadura_antiperfurante)}
      </InfoRow>
      <InfoRow label="Counter de">
        {u.counter_de ? <NotionText text={u.counter_de} /> : "—"}
      </InfoRow>
      <InfoRow label="Multiplicador">
        {hasMultiplicadorContent(u.multiplicador) ? (
          <NotionText text={multiplicadorItemsToNotionText(u.multiplicador)} />
        ) : (
          "—"
        )}
      </InfoRow>
      <InfoRow label="Forte contra">
        {u.forte_contra ? <NotionText text={u.forte_contra} /> : "—"}
      </InfoRow>
      <InfoRow label="Fraco contra">
        {u.fraco_contra ? <NotionText text={u.fraco_contra} /> : "—"}
      </InfoRow>
    </div>
  );
}

export function UnidadeCustoBody({ u }: { u: U }) {
  return (
    <div className="space-y-0">
      <InfoRow label="Comida" icon="foodaom">
        {u.comida ?? "—"}
      </InfoRow>
      <InfoRow label="Madeira" icon="woodaom">
        {u.madeira ?? "—"}
      </InfoRow>
      <InfoRow label="Ouro" icon="goldaom">
        {u.ouro ?? "—"}
      </InfoRow>
      <InfoRow label="População" icon="aomr_population_provision_icon">
        {u.populacao ?? "—"}
      </InfoRow>
      <InfoRow label="Tempo treino (seg)" icon="aomr_time_icon">
        {u.tempo_treinamento ?? "—"}
      </InfoRow>
      <InfoRow label="Velocidade movimento" icon="aomr_speed_icon">
        {u.velocidade_movimento ?? "—"}
      </InfoRow>
      <InfoRow label="Força atributos" icon="attack_cur">
        {u.forca_atributos ?? "—"}
      </InfoRow>
    </div>
  );
}
