import { Link } from "react-router-dom";

import { SpreadsheetExpandableStack } from "@/components/spreadsheet/SpreadsheetExpandableStack";
import { SpreadsheetStatCell } from "@/components/spreadsheet/SpreadsheetStatCell";
import { SpreadsheetRefChip } from "@/components/spreadsheet/SpreadsheetRefChip";
import {
  SpreadsheetBody,
  SpreadsheetHead,
  SpreadsheetTable,
  SpreadsheetTd,
  SpreadsheetTh,
  SpreadsheetTr,
} from "@/components/spreadsheet/SpreadsheetTable";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { NotionCounterIconsRow } from "@/components/ui/NotionTokensOnly";
import { NotionText } from "@/components/ui/NotionText";
import { useTranslation } from "@/hooks/useTranslation";
import type { Unidade } from "@/data/catalog";
import { unidadeSlugById } from "@/data/catalog";
import { firstNumId } from "@/lib/entityRefs";
import { useEntityResolver } from "@/hooks/useEntityResolver";
import type { ResolvedEntityLink } from "@/lib/entityResolve";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";
import {
  hasMultiplicadorContent,
  multiplicadorItemsToNotionText,
} from "@/lib/unidadeMultiplicador";
import { hasTipoContent } from "@/lib/unidadeTipo";
import { cn } from "@/lib/cn";

type UnidadesSpreadsheetProps = {
  rows: Unidade[];
  linkState: ListIndexLinkState;
  onPreview?: (link: ResolvedEntityLink) => void;
  compareMode?: boolean;
  selectedSlugs?: string[];
  onToggleSelect?: (slug: string) => void;
};

function cellStr(s: string | undefined | null): string {
  if (s == null) return "—";
  const text = s.trim();
  return text ? text : "—";
}

function hasText(s: string | undefined | null): boolean {
  return Boolean(s?.trim());
}

export function UnidadesSpreadsheet({
  rows,
  linkState,
  onPreview,
  compareMode = false,
  selectedSlugs = [],
  onToggleSelect,
}: UnidadesSpreadsheetProps) {
  const { resolveConstrucaoLink, resolveEntityNumRef, resolveUnidadeLink } = useEntityResolver();
  const { t } = useTranslation();
  const showPreview = (link: ResolvedEntityLink) => {
    onPreview?.(link);
  };

  return (
    <SpreadsheetTable tableClassName="min-w-[2600px]">
      <SpreadsheetHead>
        <SpreadsheetTh className="min-w-[8.5rem]" stickyColumn>
          {t("spreadsheet.unidades.soldier")}
        </SpreadsheetTh>
        <SpreadsheetTh>{t("spreadsheet.english")}</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[7rem]">{t("common.type")}</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[8rem]" icon="aomr_better_icon">
          {t("spreadsheet.unidades.strongAgainst")}
        </SpreadsheetTh>
        <SpreadsheetTh className="min-w-[8rem]" icon="aomr_worse_icon">
          {t("spreadsheet.unidades.weakAgainst")}
        </SpreadsheetTh>
        <SpreadsheetTh>{t("common.pantheon")}</SpreadsheetTh>
        <SpreadsheetTh>{t("common.era")}</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[7rem]">{t("spreadsheet.unidades.counterOf")}</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[7rem]">{t("spreadsheet.unidades.multiplier")}</SpreadsheetTh>
        <SpreadsheetTh icon="aomr_type_building_icon" className="min-w-[8rem]">
          {t("spreadsheet.unidades.building")}
        </SpreadsheetTh>
        <SpreadsheetTh className="min-w-[6.5rem]" icon="aomr_hit_points_icon">
          {t("spreadsheet.unidades.hitPoints")}
        </SpreadsheetTh>
        <SpreadsheetTh icon="hackdamage">{t("spreadsheet.unidades.hackDamage")}</SpreadsheetTh>
        <SpreadsheetTh icon="piercedamage">{t("spreadsheet.unidades.pierceDamage")}</SpreadsheetTh>
        <SpreadsheetTh icon="rangeicon">{t("spreadsheet.unidades.range")}</SpreadsheetTh>
        <SpreadsheetTh icon="crushdamage">{t("spreadsheet.unidades.crushDamage")}</SpreadsheetTh>
        <SpreadsheetTh icon="aomr_divine_damage_icon">{t("spreadsheet.unidades.divineDamage")}</SpreadsheetTh>
        <SpreadsheetTh icon="attack_cur">{t("spreadsheet.unidades.areaDamage")}</SpreadsheetTh>
        <SpreadsheetTh icon="aomr_rate_of_fire_icon">{t("spreadsheet.unidades.attackSpeed")}</SpreadsheetTh>
        <SpreadsheetTh icon="attack_cur">{t("spreadsheet.unidades.dps")}</SpreadsheetTh>
        <SpreadsheetTh icon="hackarmor">{t("spreadsheet.unidades.hackArmor")}</SpreadsheetTh>
        <SpreadsheetTh icon="piercearmor">{t("spreadsheet.unidades.pierceArmor")}</SpreadsheetTh>
        <SpreadsheetTh icon="foodaom">{t("spreadsheet.food")}</SpreadsheetTh>
        <SpreadsheetTh icon="woodaom">{t("spreadsheet.wood")}</SpreadsheetTh>
        <SpreadsheetTh icon="goldaom">{t("spreadsheet.gold")}</SpreadsheetTh>
        <SpreadsheetTh icon="favoraom">{t("spreadsheet.favor")}</SpreadsheetTh>
        <SpreadsheetTh icon="aomr_population_provision_icon">{t("spreadsheet.unidades.population")}</SpreadsheetTh>
        <SpreadsheetTh icon="aomr_time_icon">{t("spreadsheet.unidades.trainTime")}</SpreadsheetTh>
        <SpreadsheetTh icon="aomr_speed_icon">{t("spreadsheet.unidades.moveSpeed")}</SpreadsheetTh>
        <SpreadsheetTh icon="attack_cur">{t("spreadsheet.unidades.attributeStrength")}</SpreadsheetTh>
      </SpreadsheetHead>
      <SpreadsheetBody>
        {rows.map((u) => {
          const slug = unidadeSlugById.get(u.id) ?? String(u.id);
          const unitLink = resolveUnidadeLink(u.id, u.nome);
          const panteaoId = firstNumId(u.panteao);
          const eraId = firstNumId(u.era);
          const selected = selectedSlugs.includes(slug);
          const selectDisabled = compareMode && selectedSlugs.length >= 2 && !selected;

          const construcaoItems = (u.construcao ?? []).map((ref, i) => {
            const link = resolveConstrucaoLink(ref.id, ref.nome);
            return link && !compareMode ? (
              <SpreadsheetRefChip
                key={`${ref.id}-${i}`}
                link={link}
                linkState={linkState}
                onPreview={showPreview}
              />
            ) : (
              <span key={`${ref.id}-${i}`} className="text-sm text-zinc-400">
                <NotionText text={ref.nome} />
              </span>
            );
          });

          return (
            <SpreadsheetTr
              key={u.id}
              selected={compareMode && selected}
              className={cn(
                compareMode && "cursor-pointer",
                compareMode && selected && "bg-amber-500/10 ring-1 ring-inset ring-amber-500/40",
                compareMode && selectDisabled && "cursor-not-allowed opacity-45",
              )}
              onClick={
                compareMode && (selected || !selectDisabled) ? () => onToggleSelect?.(slug) : undefined
              }
            >
              <SpreadsheetTd stickyColumn>
                {compareMode ? (
                  <span className="inline-flex max-w-full items-center gap-2 font-medium text-zinc-100">
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-amber-500 bg-amber-500/30"
                          : "border-zinc-600 bg-zinc-900/80",
                      )}
                      aria-hidden
                    >
                      {selected ? <span className="text-[10px] text-amber-100">✓</span> : null}
                    </span>
                    {unitLink?.imageSrc ? (
                      <img src={unitLink.imageSrc} alt="" className="h-6 w-6 shrink-0 rounded object-contain" />
                    ) : null}
                    <span>{u.nome}</span>
                  </span>
                ) : unitLink ? (
                  <Link
                    to={unitLink.to}
                    state={linkState}
                    onMouseEnter={() => showPreview(unitLink)}
                    onFocus={() => showPreview(unitLink)}
                    className="inline-flex max-w-full items-center gap-2 rounded-md px-1 py-0.5 font-medium text-zinc-100 hover:bg-amber-500/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/40"
                  >
                    {unitLink.imageSrc ? (
                      <img src={unitLink.imageSrc} alt="" className="h-6 w-6 shrink-0 rounded object-contain" />
                    ) : null}
                    <span>{u.nome}</span>
                  </Link>
                ) : (
                  u.nome
                )}
              </SpreadsheetTd>
              <SpreadsheetTd className="text-zinc-400">{cellStr(u.ingles)}</SpreadsheetTd>
              <SpreadsheetTd>
                {hasTipoContent(u.tipo) ? <UnidadeTipoLine tipo={u.tipo} colored shell="auto" /> : "—"}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {hasText(u.forte_contra) ? (
                  <NotionCounterIconsRow text={u.forte_contra!} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {hasText(u.fraco_contra) ? (
                  <NotionCounterIconsRow text={u.fraco_contra!} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd onClick={compareMode ? (e) => e.stopPropagation() : undefined}>
                {panteaoId != null ? (
                  (() => {
                    const link = resolveEntityNumRef("panteao", {
                      id: panteaoId,
                      nome: u.panteao?.[0]?.nome ?? "",
                    });
                    return link && !compareMode ? (
                      <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                    ) : (
                      <NotionText text={u.panteao?.[0]?.nome ?? "—"} />
                    );
                  })()
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd onClick={compareMode ? (e) => e.stopPropagation() : undefined}>
                {eraId != null ? (
                  (() => {
                    const link = resolveEntityNumRef("era", {
                      id: eraId,
                      nome: u.era?.[0]?.nome ?? "",
                    });
                    return link && !compareMode ? (
                      <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                    ) : (
                      <NotionText text={u.era?.[0]?.nome ?? "—"} />
                    );
                  })()
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {hasText(u.counter_de) ? <NotionText text={u.counter_de!} /> : "—"}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {hasMultiplicadorContent(u.multiplicador) ? (
                  <NotionText text={multiplicadorItemsToNotionText(u.multiplicador)} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd onClick={compareMode ? (e) => e.stopPropagation() : undefined}>
                {construcaoItems.length > 0 ? (
                  <SpreadsheetExpandableStack items={construcaoItems} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="pontos_de_vida" value={u.pontos_de_vida} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="dano_cortante" value={u.dano_cortante} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="dano_perfurante" value={u.dano_perfurante} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="alcance" value={u.alcance} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="dano_contundente" value={u.dano_contundente} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="dano_divino" value={u.dano_divino} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="dano_area" value={u.dano_area} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="velocidade_de_ataque_atk_s" value={u.velocidade_de_ataque_atk_s} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="dps" value={u.dps} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="armadura_anticorte" value={u.armadura_anticorte} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="armadura_antiperfurante" value={u.armadura_antiperfurante} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="comida" value={u.comida} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="madeira" value={u.madeira} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="ouro" value={u.ouro} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="favor" value={u.favor} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="populacao" value={u.populacao} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="tempo_treinamento" value={u.tempo_treinamento} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="velocidade_movimento" value={u.velocidade_movimento} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="forca_atributos" value={u.forca_atributos} />
              </SpreadsheetTd>
            </SpreadsheetTr>
          );
        })}
      </SpreadsheetBody>
    </SpreadsheetTable>
  );
}
