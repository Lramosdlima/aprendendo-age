import type { ReactNode } from "react";

import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitOrText } from "@/components/ui/InfoRowPortraitCluster";
import { NotionText } from "@/components/ui/NotionText";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import type { LocaleCatalog } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { firstNome, firstNumId } from "@/lib/entityRefs";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";
import { localeSectionPath } from "@/lib/localeRoutes";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";

type A = LocaleCatalog["aldeoes"][number];

export function AldeaoGeralBody({ a, linkState }: { a: A; linkState?: ListIndexLinkState }) {
  const { locale, panteaoById, panteaoSlugById } = useCatalog();
  const { t } = useTranslation();
  const panteaoId = firstNumId(a.panteao);
  const panteao = panteaoId != null ? panteaoById.get(panteaoId) : undefined;

  return (
    <div className="space-y-0">
      {panteao ? (
        <InfoRow label={t("common.pantheon")}>
          <InfoRowPortraitOrText
            portraits={
              <PortraitHeaderActions
                items={[
                  {
                    key: String(panteao.id),
                    to: localeSectionPath(locale, "panteoes", panteaoSlugById.get(panteao.id) ?? panteao.id),
                    nome: panteao.nome,
                    src: getPantheonWatermarkUrl(panteao),
                  },
                ]}
                linkState={linkState ?? {}}
                size="sm"
                justify="start"
              />
            }
            textFallback={null}
          />
        </InfoRow>
      ) : firstNome(a.panteao) ? (
        <InfoRow label={t("common.pantheon")}>
          <InfoRowPortraitOrText portraits={null} textFallback={<NotionText text={firstNome(a.panteao)!} />} />
        </InfoRow>
      ) : null}
      <InfoRow label={t("spreadsheet.unidades.hitPoints")} icon="aomr_hit_points_icon">
        {a.vida ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.unidades.population")} icon="aomr_population_provision_icon">
        {a.populacao ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.resourceCost")} icon="aomr_type_villager_icon">
        {a.recursos ?? "—"}
      </InfoRow>
      {a.carne != null && (
        <InfoRow label={t("spreadsheet.aldeoes.resourceCostFood")} icon="foodaom">
          {a.carne}
        </InfoRow>
      )}
      {a.madeira != null && (
        <InfoRow label={t("spreadsheet.aldeoes.resourceCostWood")} icon="woodaom">
          {a.madeira}
        </InfoRow>
      )}
      {a.ouro != null && (
        <InfoRow label={t("spreadsheet.aldeoes.resourceCostGold")} icon="aomr_gold_icon">
          {a.ouro}
        </InfoRow>
      )}
      <InfoRow label={t("spreadsheet.aldeoes.trainTime")} icon="aomr_time_icon">
        {a.tempo_de_treinamento ?? "—"}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.trainTimePatch")} icon="aomr_time_icon">
        {a.tempo_de_treinamento_patch_18_65484 ?? "—"}
      </InfoRow>
    </div>
  );
}

function coletaRow(label: string, icon: string, value: ReactNode) {
  return (
    <InfoRow label={label} icon={icon}>
      {value}
    </InfoRow>
  );
}

export function AldeaoColetaBody({ a }: { a: A }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      {coletaRow(t("spreadsheet.aldeoes.hunt"), "aomr_caribou_icon", a.cacar ?? "—")}
      {coletaRow(t("spreadsheet.aldeoes.livestock"), "aomr_cow_icon", a.gado_galinhas ?? "—")}
      {coletaRow(t("spreadsheet.aldeoes.berries"), "aomr_berry_bush_icon", a.frutinhas ?? "—")}
      {coletaRow(t("spreadsheet.aldeoes.farm"), "aomr_farm_icon", a.fazenda ?? "—")}
      {coletaRow(t("spreadsheet.aldeoes.tree"), "aomr_tree_oak_icon", a.arvore ?? "—")}
      {coletaRow(t("spreadsheet.aldeoes.mine"), "aomr_gold_mine_icon", a.mina ?? "—")}
      {coletaRow(t("spreadsheet.aldeoes.buildSpeed"), "aomr_type_building_icon", a.velocidade_construcao ?? "—")}
    </div>
  );
}

export function AldeaoBonusBody({ a }: { a: A }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      <InfoRow label={t("spreadsheet.aldeoes.huntPercent")} icon="aomr_caribou_icon">
        {a.cacar_porcento ?? 0}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.livestockPercent")} icon="aomr_cow_icon">
        {a.gado_porcento ?? 0}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.berriesPercent")} icon="aomr_berry_bush_icon">
        {a.frutinhas_porcento ?? 0}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.farmPercent")} icon="aomr_farm_icon">
        {a.fazenda_porcento ?? 0}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.treePercent")} icon="aomr_tree_oak_icon">
        {a.arvore_porcento ?? 0}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.minePercent")} icon="aomr_gold_mine_icon">
        {a.mina_porcento ?? 0}
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.buildSpeedPercent")} icon="aomr_type_building_icon">
        {a.velocidade_construcao_porcento ?? 0}
      </InfoRow>
    </div>
  );
}
