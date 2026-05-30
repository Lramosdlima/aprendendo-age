import { Link } from "react-router-dom";

import { SpreadsheetExpandableStack } from "@/components/spreadsheet/SpreadsheetExpandableStack";
import { SpreadsheetRefChip } from "@/components/spreadsheet/SpreadsheetRefChip";
import { SpreadsheetStatCell } from "@/components/spreadsheet/SpreadsheetStatCell";
import {
  SpreadsheetBody,
  SpreadsheetHead,
  SpreadsheetTable,
  SpreadsheetTd,
  SpreadsheetTh,
  SpreadsheetTr,
} from "@/components/spreadsheet/SpreadsheetTable";
import { TecnologiaTipoBadges } from "@/components/tecnologia/TecnologiaTipoBadges";
import { NotionText } from "@/components/ui/NotionText";
import { useTranslation } from "@/hooks/useTranslation";
import type { Tecnologia } from "@/data/catalog";
import { firstNumId, joinRefNomesOrString } from "@/lib/entityRefs";
import { useEntityResolver } from "@/hooks/useEntityResolver";
import type { ResolvedEntityLink } from "@/lib/entityResolve";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";

export type TecnologiaSpreadsheetRow = {
  t: Tecnologia;
  index: number;
};

type TecnologiasSpreadsheetProps = {
  rows: TecnologiaSpreadsheetRow[];
  linkState: ListIndexLinkState;
  onPreview?: (link: ResolvedEntityLink) => void;
};

function cellStr(s: string | undefined | null): string {
  if (s == null) return "—";
  const text = s.trim();
  return text ? text : "—";
}

function hasText(s: string | undefined | null): boolean {
  return Boolean(s?.trim());
}

function refList(
  v: string | { id: number; nome: string }[] | null | undefined,
): v is { id: number; nome: string }[] {
  return Array.isArray(v) && v.length > 0;
}

export function TecnologiasSpreadsheet({ rows, linkState, onPreview }: TecnologiasSpreadsheetProps) {
  const { t: tr } = useTranslation();
  const { resolveConstrucaoLink, resolveDeusLink, resolveEntityNumRef, resolveTecnologiaLinkByIndex } =
    useEntityResolver();
  const showPreview = (link: ResolvedEntityLink) => {
    onPreview?.(link);
  };

  return (
    <SpreadsheetTable tableClassName="min-w-[1500px]">
      <SpreadsheetHead>
        <SpreadsheetTh className="min-w-[9rem]" stickyColumn>
          {tr("spreadsheet.tecnologias.up")}
        </SpreadsheetTh>
        <SpreadsheetTh className="min-w-[8rem]">{tr("common.benefits")}</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[7rem]">{tr("common.type")}</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[7rem]">{tr("common.specificGod")}</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[9rem]">{tr("common.originBuilding")}</SpreadsheetTh>
        <SpreadsheetTh>{tr("common.era")}</SpreadsheetTh>
        <SpreadsheetTh>{tr("spreadsheet.english")}</SpreadsheetTh>
        <SpreadsheetTh>{tr("spreadsheet.pantheons")}</SpreadsheetTh>
        <SpreadsheetTh icon="foodaom">{tr("spreadsheet.food")}</SpreadsheetTh>
        <SpreadsheetTh icon="woodaom">{tr("spreadsheet.wood")}</SpreadsheetTh>
        <SpreadsheetTh icon="goldaom">{tr("spreadsheet.gold")}</SpreadsheetTh>
        <SpreadsheetTh icon="favoraom">{tr("spreadsheet.favor")}</SpreadsheetTh>
        <SpreadsheetTh icon="aomr_time_icon">{tr("spreadsheet.timeSeconds")}</SpreadsheetTh>
      </SpreadsheetHead>
      <SpreadsheetBody>
        {rows.map(({ t, index }) => {
          const tecLink = resolveTecnologiaLinkByIndex(index, t.nome);
          const panteaoId = refList(t.panteoes) ? firstNumId(t.panteoes) : undefined;

          const construcaoItems = refList(t.construcao_origem)
            ? t.construcao_origem.map((ref, i) => {
                const link = resolveConstrucaoLink(ref.id, ref.nome);
                return link ? (
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
              })
            : [];

          const eraItems = (t.eras ?? []).map((ref, i) => {
            const link = resolveEntityNumRef("era", ref);
            return link ? (
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

          const godItems = refList(t.god_especifico)
            ? t.god_especifico.map((ref, i) => {
                const link = resolveDeusLink(ref.id, ref.nome);
                return link ? (
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
              })
            : [];

          return (
            <SpreadsheetTr key={`${index}-${t.nome}`}>
              <SpreadsheetTd stickyColumn>
                {tecLink ? (
                  <Link
                    to={tecLink.to}
                    state={linkState}
                    onMouseEnter={() => showPreview(tecLink)}
                    onFocus={() => showPreview(tecLink)}
                    className="inline-flex max-w-full items-center gap-2 rounded-md px-1 py-0.5 font-medium text-zinc-100 hover:bg-amber-500/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/40"
                  >
                    {tecLink.imageSrc ? (
                      <img src={tecLink.imageSrc} alt="" className="h-6 w-6 shrink-0 rounded object-contain" />
                    ) : null}
                    <span>{t.nome || tr("spreadsheet.noTitle", { index })}</span>
                  </Link>
                ) : (
                  t.nome || tr("spreadsheet.noTitle", { index })
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {hasText(t.beneficia) ? (
                  <span className="text-sm text-zinc-300">
                    <NotionText text={t.beneficia!} />
                  </span>
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {hasText(t.tipo) ? (
                  <TecnologiaTipoBadges tipo={t.tipo} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {godItems.length > 0 ? (
                  <SpreadsheetExpandableStack items={godItems} />
                ) : hasText(typeof t.god_especifico === "string" ? t.god_especifico : undefined) ? (
                  <NotionText text={t.god_especifico as string} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {construcaoItems.length > 0 ? (
                  <SpreadsheetExpandableStack items={construcaoItems} />
                ) : typeof t.construcao_origem === "string" && hasText(t.construcao_origem) ? (
                  <NotionText text={t.construcao_origem} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {eraItems.length > 0 ? <SpreadsheetExpandableStack items={eraItems} /> : "—"}
              </SpreadsheetTd>
              <SpreadsheetTd className="text-zinc-400">{cellStr(t.ingles)}</SpreadsheetTd>
              <SpreadsheetTd>
                {panteaoId != null ? (
                  (() => {
                    const link = resolveEntityNumRef("panteao", {
                      id: panteaoId,
                      nome: (t.panteoes as { id: number; nome: string }[])[0]?.nome ?? "",
                    });
                    return link ? (
                      <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                    ) : (
                      <NotionText text={joinRefNomesOrString(t.panteoes)} />
                    );
                  })()
                ) : typeof t.panteoes === "string" && hasText(t.panteoes) ? (
                  <NotionText text={t.panteoes} />
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="comida" value={t.comida} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="madeira" value={t.madeira} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="ouro" value={t.ouro} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="favor" value={t.favor} />
              </SpreadsheetTd>
              <SpreadsheetTd>
                <SpreadsheetStatCell field="tempo_s" value={t.tempo_s} />
              </SpreadsheetTd>
            </SpreadsheetTr>
          );
        })}
      </SpreadsheetBody>
    </SpreadsheetTable>
  );
}
