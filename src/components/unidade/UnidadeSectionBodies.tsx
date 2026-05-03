import { useLocation } from "react-router-dom";

import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitOrText } from "@/components/ui/InfoRowPortraitCluster";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import { formatArmorPercent } from "@/lib/armorDisplay";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { NotionText } from "@/components/ui/NotionText";
import {
  hasMultiplicadorContent,
  multiplicadorItemsToNotionText,
} from "@/lib/unidadeMultiplicador";
import {
  categoriaItemsToNotionText,
  hasCategoriaContent,
  hasTipoContent,
} from "@/lib/unidadeTipo";
import {
  construcaoById,
  construcaoSlugById,
  eraById,
  eraSlugById,
  panteaoById,
  panteaoSlugById,
  unidades,
} from "@/data/catalog";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";

type U = (typeof unidades)[number];

export function UnidadeVisaoGeralBody({ u }: { u: U }) {
  const { pathname, search: locSearch } = useLocation();
  const linkState = listIndexLinkStateFromLocation(pathname, locSearch);
  const panteaoRefs = u.panteao;
  const eraRefs = u.era;
  const constrRefs = u.construcao;

  const panteoesPortraitItems =
    Array.isArray(panteaoRefs) && panteaoRefs.length
      ? panteaoRefs.map((r, i) => {
          const p = panteaoById.get(r.id);
          return {
            key: `${r.id}-${i}`,
            to: `/panteoes/${panteaoSlugById.get(r.id) ?? r.id}`,
            nome: r.nome,
            src: p ? getPantheonWatermarkUrl(p) : undefined,
          };
        })
      : [];

  const eraPortraitItems =
    Array.isArray(eraRefs) && eraRefs.length
      ? eraRefs.map((r, i) => {
          const e = eraById.get(r.id);
          return {
            key: `${r.id}-${i}`,
            to: `/eras/${eraSlugById.get(r.id) ?? r.id}`,
            nome: r.nome,
            src: e ? getEraAssetUrl(e) : undefined,
          };
        })
      : [];

  const construcaoPortraitItems =
    Array.isArray(constrRefs) && constrRefs.length
      ? constrRefs.map((r, i) => {
          const c = construcaoById.get(r.id);
          return {
            key: `${r.id}-${i}`,
            to: `/construcoes/${construcaoSlugById.get(r.id) ?? r.id}`,
            nome: r.nome,
            src: c ? getConstrucaoAssetUrl(c) : undefined,
          };
        })
      : [];

  return (
    <div className="space-y-0">
      {hasTipoContent(u.tipo) ? (
        <InfoRow label="Tipo">
          <UnidadeTipoLine tipo={u.tipo} colored />
        </InfoRow>
      ) : null}
      {hasCategoriaContent(u.categoria) ? (
        <InfoRow label="Categoria">
          <NotionText text={categoriaItemsToNotionText(u.categoria)} />
        </InfoRow>
      ) : null}
      {panteoesPortraitItems.length ? (
        <InfoRow label="Panteão">
          <InfoRowPortraitOrText
            portraits={
              <PortraitHeaderActions
                items={panteoesPortraitItems}
                linkState={linkState}
                size="sm"
                justify="start"
              />
            }
            textFallback={null}
          />
        </InfoRow>
      ) : null}
      {eraPortraitItems.length ? (
        <InfoRow label="Era">
          <InfoRowPortraitOrText
            portraits={
              <PortraitHeaderActions
                items={eraPortraitItems}
                linkState={linkState}
                size="sm"
                justify="start"
              />
            }
            textFallback={null}
          />
        </InfoRow>
      ) : null}
      {construcaoPortraitItems.length ? (
        <InfoRow label="Construção">
          <InfoRowPortraitOrText
            portraits={
              <PortraitHeaderActions
                items={construcaoPortraitItems}
                linkState={linkState}
                size="sm"
                justify="start"
              />
            }
            textFallback={null}
          />
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
      <InfoRow label="Forte contra" icon="aomr_better_icon">
        {u.forte_contra ? <NotionText text={u.forte_contra} /> : "—"}
      </InfoRow>
      <InfoRow label="Fraco contra" icon="aomr_worse_icon">
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
