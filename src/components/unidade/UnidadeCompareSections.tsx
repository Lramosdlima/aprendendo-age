import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { CompareInfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import type { LocaleCatalog } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { localeSectionPath, type LocaleSection } from "@/lib/localeRoutes";
import {
  formatMultiplicadorTailForNotion,
  hasMultiplicadorContent,
  multiplicadorCompareTones,
  type UnidadeMultiplicadorItem,
} from "@/lib/unidadeMultiplicador";
import { formatArmorPercent } from "@/lib/armorDisplay";
import {
  parseGameNumber,
  toneToTextClass,
  type CompareCellTone,
} from "@/lib/numericCompare";
import {
  categoriaItemsToNotionText,
  hasCategoriaContent,
  hasTipoContent,
} from "@/lib/unidadeTipo";

type U = LocaleCatalog["unidades"][number];

function hasRefList(v: unknown): v is { id: number; nome: string }[] {
  return Array.isArray(v) && v.length > 0 && typeof (v as { id: number }[])[0]?.id === "number";
}

function renderRefCell(
  refs: { id: number; nome: string }[] | undefined,
  locale: LocaleCatalog["locale"],
  section: LocaleSection,
  slugById: Map<number, string>,
) {
  if (!hasRefList(refs)) return "—";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      {refs.map((r, i) => (
        <Fragment key={`${r.id}-${i}`}>
          {i > 0 ? <span className="text-zinc-600">,</span> : null}
          <Link
            to={localeSectionPath(locale, section, slugById.get(r.id) ?? r.id)}
            className="text-amber-200 underline-offset-2 hover:underline"
          >
            <NotionText text={r.nome} />
          </Link>
        </Fragment>
      ))}
    </span>
  );
}

function showRefRow(u1: U, u2: U, key: "panteao" | "era" | "construcao") {
  return !!(hasRefList(u1[key]) || hasRefList(u2[key]));
}

function numericPairFrom(a: unknown, b: unknown) {
  return { left: parseGameNumber(a), right: parseGameNumber(b) };
}

function MultiplicadorCompareSegment({
  item,
  tone,
}: {
  item: UnidadeMultiplicadorItem;
  tone: CompareCellTone;
}) {
  const toneCls = toneToTextClass(tone);
  const icon = (item.icon ?? "").trim();

  if (!icon) {
    return (
      <span className={toneCls}>
        <NotionText text={item.value} />
      </span>
    );
  }

  return (
    <span className="inline align-baseline">
      <NotionText text={`:${icon}:`} />
      <span className={toneCls}>{formatMultiplicadorTailForNotion(item.value)}</span>
    </span>
  );
}

function renderMultiplicadorCompareSide(
  items: UnidadeMultiplicadorItem[],
  tones: CompareCellTone[],
): ReactNode {
  return (
    <>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 ? <span className="text-zinc-500"> || </span> : null}
          <MultiplicadorCompareSegment item={item} tone={tones[i] ?? "default"} />
        </Fragment>
      ))}
    </>
  );
}

export function UnidadeVisaoGeralCompare({ u1, u2 }: { u1: U; u2: U }) {
  const { t } = useTranslation();
  const { locale, panteaoSlugById, eraSlugById, construcaoSlugById } = useCatalog();

  return (
    <div className="space-y-0">
      {hasTipoContent(u1.tipo) || hasTipoContent(u2.tipo) ? (
        <CompareInfoRow
          label={t("common.type")}
          left={hasTipoContent(u1.tipo) ? <UnidadeTipoLine tipo={u1.tipo} colored /> : "—"}
          right={hasTipoContent(u2.tipo) ? <UnidadeTipoLine tipo={u2.tipo} colored /> : "—"}
        />
      ) : null}
      {hasCategoriaContent(u1.categoria) || hasCategoriaContent(u2.categoria) ? (
        <CompareInfoRow
          label={t("common.category")}
          left={
            hasCategoriaContent(u1.categoria) ? (
              <NotionText text={categoriaItemsToNotionText(u1.categoria)} />
            ) : (
              "—"
            )
          }
          right={
            hasCategoriaContent(u2.categoria) ? (
              <NotionText text={categoriaItemsToNotionText(u2.categoria)} />
            ) : (
              "—"
            )
          }
        />
      ) : null}
      {showRefRow(u1, u2, "panteao") ? (
        <CompareInfoRow
          label={t("common.pantheon")}
          left={renderRefCell(u1.panteao, locale, "panteoes", panteaoSlugById)}
          right={renderRefCell(u2.panteao, locale, "panteoes", panteaoSlugById)}
        />
      ) : null}
      {showRefRow(u1, u2, "era") ? (
        <CompareInfoRow
          label={t("common.era")}
          left={renderRefCell(u1.era, locale, "eras", eraSlugById)}
          right={renderRefCell(u2.era, locale, "eras", eraSlugById)}
        />
      ) : null}
      {showRefRow(u1, u2, "construcao") ? (
        <CompareInfoRow
          label={t("spreadsheet.unidades.building")}
          left={renderRefCell(u1.construcao, locale, "construcoes", construcaoSlugById)}
          right={renderRefCell(u2.construcao, locale, "construcoes", construcaoSlugById)}
        />
      ) : null}
    </div>
  );
}

export function UnidadeCombateCompare({ u1, u2 }: { u1: U; u2: U }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      <CompareInfoRow
        label={t("spreadsheet.unidades.hitPoints")}
        icon="aomr_hit_points_icon"
        left={u1.pontos_de_vida ?? "—"}
        right={u2.pontos_de_vida ?? "—"}
        numericPair={numericPairFrom(u1.pontos_de_vida, u2.pontos_de_vida)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.range")}
        icon="rangeicon"
        left={u1.alcance ?? "—"}
        right={u2.alcance ?? "—"}
        numericPair={numericPairFrom(u1.alcance, u2.alcance)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.hackDamage")}
        icon="hackdamage"
        left={u1.dano_cortante ?? "—"}
        right={u2.dano_cortante ?? "—"}
        numericPair={numericPairFrom(u1.dano_cortante, u2.dano_cortante)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.pierceDamage")}
        icon="piercedamage"
        left={u1.dano_perfurante ?? "—"}
        right={u2.dano_perfurante ?? "—"}
        numericPair={numericPairFrom(u1.dano_perfurante, u2.dano_perfurante)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.attackSpeed")}
        icon="aomr_rate_of_fire_icon"
        left={u1.velocidade_de_ataque_atk_s ?? "—"}
        right={u2.velocidade_de_ataque_atk_s ?? "—"}
        numericPair={{
          ...numericPairFrom(u1.velocidade_de_ataque_atk_s, u2.velocidade_de_ataque_atk_s),
          lowerIsBetter: true,
        }}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.dps")}
        icon="attack_cur"
        left={u1.dps ?? "—"}
        right={u2.dps ?? "—"}
        numericPair={numericPairFrom(u1.dps, u2.dps)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.hackArmor")}
        icon="hackarmor"
        left={formatArmorPercent(u1.armadura_anticorte)}
        right={formatArmorPercent(u2.armadura_anticorte)}
        numericPair={numericPairFrom(u1.armadura_anticorte, u2.armadura_anticorte)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.pierceArmor")}
        icon="piercearmor"
        left={formatArmorPercent(u1.armadura_antiperfurante)}
        right={formatArmorPercent(u2.armadura_antiperfurante)}
        numericPair={numericPairFrom(u1.armadura_antiperfurante, u2.armadura_antiperfurante)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.counterOf")}
        left={u1.counter_de ? <NotionText text={u1.counter_de} /> : "—"}
        right={u2.counter_de ? <NotionText text={u2.counter_de} /> : "—"}
      />
      {(() => {
        const leftItems: UnidadeMultiplicadorItem[] =
          hasMultiplicadorContent(u1.multiplicador) && u1.multiplicador ? u1.multiplicador : [];
        const rightItems: UnidadeMultiplicadorItem[] =
          hasMultiplicadorContent(u2.multiplicador) && u2.multiplicador ? u2.multiplicador : [];
        const { left: tonesL, right: tonesR } = multiplicadorCompareTones(leftItems, rightItems);
        return (
          <CompareInfoRow
            label={t("spreadsheet.unidades.multiplier")}
            left={leftItems.length ? renderMultiplicadorCompareSide(leftItems, tonesL) : "—"}
            right={rightItems.length ? renderMultiplicadorCompareSide(rightItems, tonesR) : "—"}
          />
        );
      })()}
      <CompareInfoRow
        label={t("spreadsheet.unidades.strongAgainst")}
        icon="aomr_better_icon"
        left={u1.forte_contra ? <NotionText text={u1.forte_contra} /> : "—"}
        right={u2.forte_contra ? <NotionText text={u2.forte_contra} /> : "—"}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.weakAgainst")}
        icon="aomr_worse_icon"
        left={u1.fraco_contra ? <NotionText text={u1.fraco_contra} /> : "—"}
        right={u2.fraco_contra ? <NotionText text={u2.fraco_contra} /> : "—"}
      />
    </div>
  );
}

export function UnidadeCustoCompare({ u1, u2 }: { u1: U; u2: U }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      <CompareInfoRow
        label={t("common.food")}
        icon="foodaom"
        left={u1.comida ?? "—"}
        right={u2.comida ?? "—"}
        numericPair={{ ...numericPairFrom(u1.comida, u2.comida), lowerIsBetter: true }}
      />
      <CompareInfoRow
        label={t("common.wood")}
        icon="woodaom"
        left={u1.madeira ?? "—"}
        right={u2.madeira ?? "—"}
        numericPair={{ ...numericPairFrom(u1.madeira, u2.madeira), lowerIsBetter: true }}
      />
      <CompareInfoRow
        label={t("common.gold")}
        icon="goldaom"
        left={u1.ouro ?? "—"}
        right={u2.ouro ?? "—"}
        numericPair={{ ...numericPairFrom(u1.ouro, u2.ouro), lowerIsBetter: true }}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.population")}
        icon="aomr_population_provision_icon"
        left={u1.populacao ?? "—"}
        right={u2.populacao ?? "—"}
        numericPair={{ ...numericPairFrom(u1.populacao, u2.populacao), lowerIsBetter: true }}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.trainTime")}
        icon="aomr_time_icon"
        left={u1.tempo_treinamento ?? "—"}
        right={u2.tempo_treinamento ?? "—"}
        numericPair={{ ...numericPairFrom(u1.tempo_treinamento, u2.tempo_treinamento), lowerIsBetter: true }}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.moveSpeed")}
        icon="aomr_speed_icon"
        left={u1.velocidade_movimento ?? "—"}
        right={u2.velocidade_movimento ?? "—"}
        numericPair={numericPairFrom(u1.velocidade_movimento, u2.velocidade_movimento)}
      />
      <CompareInfoRow
        label={t("spreadsheet.unidades.attributeStrength")}
        icon="attack_cur"
        left={u1.forca_atributos ?? "—"}
        right={u2.forca_atributos ?? "—"}
        numericPair={numericPairFrom(u1.forca_atributos, u2.forca_atributos)}
      />
    </div>
  );
}
