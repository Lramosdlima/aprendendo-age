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
import { parseGameNumber } from "@/lib/numericCompare";
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

function AldeaoBonusBar({ value, locale }: { value: unknown; locale: string }) {
  const parsed = parseGameNumber(value) ?? 0;
  const magnitude = Math.min(Math.abs(parsed) / 100, 1) * 50;
  const positive = parsed > 0;
  const negative = parsed < 0;
  const formatted = parsed.toLocaleString(locale === "pt" ? "pt-BR" : "en-US", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex min-w-[11rem] items-center justify-end gap-3">
      <span
        className={[
          "w-16 shrink-0 text-right text-sm font-semibold tabular-nums",
          positive ? "text-emerald-400" : negative ? "text-red-400" : "text-zinc-400",
        ].join(" ")}
      >
        {positive ? "+" : ""}
        {formatted}%
      </span>
      <div
        className="relative h-2.5 w-32 overflow-hidden rounded-full bg-zinc-800/90 ring-1 ring-inset ring-zinc-700/60"
        title={`${positive ? "+" : ""}${formatted}%`}
      >
        <span className="absolute inset-y-0 left-1/2 w-px bg-zinc-500/70" aria-hidden />
        {positive ? (
          <span
            className="absolute inset-y-0 left-1/2 rounded-r-full bg-emerald-500 transition-[width]"
            style={{ width: `${magnitude}%` }}
            aria-hidden
          />
        ) : null}
        {negative ? (
          <span
            className="absolute inset-y-0 right-1/2 rounded-l-full bg-red-500 transition-[width]"
            style={{ width: `${magnitude}%` }}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
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
  const { t, locale } = useTranslation();

  return (
    <div className="space-y-0">
      <InfoRow label={t("spreadsheet.aldeoes.huntPercent")} icon="aomr_caribou_icon">
        <AldeaoBonusBar value={a.cacar_porcento} locale={locale} />
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.livestockPercent")} icon="aomr_cow_icon">
        <AldeaoBonusBar value={a.gado_porcento} locale={locale} />
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.berriesPercent")} icon="aomr_berry_bush_icon">
        <AldeaoBonusBar value={a.frutinhas_porcento} locale={locale} />
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.farmPercent")} icon="aomr_farm_icon">
        <AldeaoBonusBar value={a.fazenda_porcento} locale={locale} />
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.treePercent")} icon="aomr_tree_oak_icon">
        <AldeaoBonusBar value={a.arvore_porcento} locale={locale} />
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.minePercent")} icon="aomr_gold_mine_icon">
        <AldeaoBonusBar value={a.mina_porcento} locale={locale} />
      </InfoRow>
      <InfoRow label={t("spreadsheet.aldeoes.buildSpeedPercent")} icon="aomr_type_building_icon">
        <AldeaoBonusBar value={a.velocidade_construcao_porcento} locale={locale} />
      </InfoRow>
    </div>
  );
}
