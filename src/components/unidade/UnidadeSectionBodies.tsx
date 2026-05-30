import { useLocation } from "react-router-dom";

import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitOrText } from "@/components/ui/InfoRowPortraitCluster";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import { formatArmorPercent } from "@/lib/armorDisplay";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { NotionText } from "@/components/ui/NotionText";
import type { LocaleCatalog } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import {
  hasMultiplicadorContent,
  multiplicadorItemsToNotionText,
} from "@/lib/unidadeMultiplicador";
import {
  categoriaItemsToNotionText,
  hasCategoriaContent,
  hasTipoContent,
} from "@/lib/unidadeTipo";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { localeSectionPath } from "@/lib/localeRoutes";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";

type U = LocaleCatalog["unidades"][number];

export function UnidadeVisaoGeralBody({ u }: { u: U }) {
  const { t } = useTranslation();
  const catalog = useCatalog();
  const { locale, construcaoById, construcaoSlugById, eraById, eraSlugById, panteaoById, panteaoSlugById } =
    catalog;
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
            to: localeSectionPath(locale, "panteoes", panteaoSlugById.get(r.id) ?? r.id),
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
            to: localeSectionPath(locale, "eras", eraSlugById.get(r.id) ?? r.id),
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
            to: localeSectionPath(locale, "construcoes", construcaoSlugById.get(r.id) ?? r.id),
            nome: r.nome,
            src: c ? getConstrucaoAssetUrl(c) : undefined,
          };
        })
      : [];

  return (
    <div className="space-y-0">
      {hasTipoContent(u.tipo) ? (
        <InfoRow label={t("common.type")}>
          <UnidadeTipoLine tipo={u.tipo} colored />
        </InfoRow>
      ) : null}
      {hasCategoriaContent(u.categoria) ? (
        <InfoRow label={t("common.category")}>
          <NotionText text={categoriaItemsToNotionText(u.categoria)} />
        </InfoRow>
      ) : null}
      {panteoesPortraitItems.length ? (
        <InfoRow label={t("common.pantheon")}>
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
        <InfoRow label={t("common.era")}>
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
        <InfoRow label={t("spreadsheet.unidades.building")}>
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
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      <InfoRow label={t("spreadsheet.unidades.hitPoints")} icon="aomr_hit_points_icon">
        {u.pontos_de_vida ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.range")} icon="rangeicon">
        {u.alcance ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.hackDamage")} icon="hackdamage">
        {u.dano_cortante ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.pierceDamage")} icon="piercedamage">
        {u.dano_perfurante ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.attackSpeed")} icon="aomr_rate_of_fire_icon">
        {u.velocidade_de_ataque_atk_s ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.dps")} icon="attack_cur">
        {u.dps ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.hackArmor")} icon="hackarmor">
        {formatArmorPercent(u.armadura_anticorte)}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.pierceArmor")} icon="piercearmor">
        {formatArmorPercent(u.armadura_antiperfurante)}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.counterOf")}>
        {u.counter_de ? <NotionText text={u.counter_de} /> : "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.multiplier")}>
        {hasMultiplicadorContent(u.multiplicador) ? (
          <NotionText text={multiplicadorItemsToNotionText(u.multiplicador)} />
        ) : (
          "—"
        )}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.strongAgainst")} icon="aomr_better_icon">
        {u.forte_contra ? <NotionText text={u.forte_contra} /> : "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.weakAgainst")} icon="aomr_worse_icon">
        {u.fraco_contra ? <NotionText text={u.fraco_contra} /> : "—"}
      </InfoRow>
    </div>
  );
}

export function UnidadeCustoBody({ u }: { u: U }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      <InfoRow label={t("common.food")} icon="foodaom">
        {u.comida ?? "—"}
      </InfoRow>
      <InfoRow label={t("common.wood")} icon="woodaom">
        {u.madeira ?? "—"}
      </InfoRow>
      <InfoRow label={t("common.gold")} icon="goldaom">
        {u.ouro ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.population")} icon="aomr_population_provision_icon">
        {u.populacao ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.trainTime")} icon="aomr_time_icon">
        {u.tempo_treinamento ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.moveSpeed")} icon="aomr_speed_icon">
        {u.velocidade_movimento ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.attributeStrength")} icon="attack_cur">
        {u.forca_atributos ?? "—"}
      </InfoRow>
    </div>
  );
}
