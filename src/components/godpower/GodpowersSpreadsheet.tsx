import { Link } from "react-router-dom";

import { SpreadsheetExpandableStack } from "@/components/spreadsheet/SpreadsheetExpandableStack";
import {
  SpreadsheetBody,
  SpreadsheetHead,
  SpreadsheetTable,
  SpreadsheetTd,
  SpreadsheetTh,
  SpreadsheetTr,
} from "@/components/spreadsheet/SpreadsheetTable";
import { SpreadsheetRefChip } from "@/components/spreadsheet/SpreadsheetRefChip";
import { NotionText } from "@/components/ui/NotionText";
import type { Godpower } from "@/data/catalog";
import { godpowerSlugById } from "@/data/catalog";
import { firstNumId } from "@/lib/entityRefs";
import {
  resolveDeusLink,
  resolveEntityNumRef,
  resolveGodpowerLink,
  type ResolvedEntityLink,
} from "@/lib/entityResolve";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";
import { cn } from "@/lib/cn";

type GodpowersSpreadsheetProps = {
  rows: Godpower[];
  linkState: ListIndexLinkState;
  onPreview?: (link: ResolvedEntityLink) => void;
  compareMode?: boolean;
  selectedSlugs?: string[];
  onToggleSelect?: (slug: string) => void;
};

function cellNum(n: number | undefined): string {
  return n != null && !Number.isNaN(n) ? String(n) : "—";
}

function cellStr(s: string | number | undefined | null): string {
  if (s == null) return "—";
  const text = typeof s === "string" ? s.trim() : String(s);
  return text ? text : "—";
}

function hasText(s: string | undefined | null): boolean {
  return Boolean(s?.trim());
}

export function GodpowersSpreadsheet({
  rows,
  linkState,
  onPreview,
  compareMode = false,
  selectedSlugs = [],
  onToggleSelect,
}: GodpowersSpreadsheetProps) {
  const showPreview = (link: ResolvedEntityLink) => {
    onPreview?.(link);
  };

  return (
    <SpreadsheetTable tableClassName="min-w-[1280px]">
      <SpreadsheetHead>
        <SpreadsheetTh className="min-w-[8rem]">GodPower</SpreadsheetTh>
        <SpreadsheetTh>Inglês</SpreadsheetTh>
        <SpreadsheetTh>God</SpreadsheetTh>
        <SpreadsheetTh>Era</SpreadsheetTh>
        <SpreadsheetTh>Cooldown (seg)</SpreadsheetTh>
        <SpreadsheetTh>Duração no mapa (seg)</SpreadsheetTh>
        <SpreadsheetTh>Custo repetir</SpreadsheetTh>
        <SpreadsheetTh>Incremento por uso</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[12rem]">Descrição resumida</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[12rem]">Descrição avançada</SpreadsheetTh>
        <SpreadsheetTh className="min-w-[7.5rem]">Panteão</SpreadsheetTh>
      </SpreadsheetHead>
      <SpreadsheetBody>
        {rows.map((g) => {
          const slug = godpowerSlugById.get(g.id) ?? String(g.id);
          const gpLink = resolveGodpowerLink(g.id, g.nome);
          const godId = firstNumId(g.god);
          const eraId = firstNumId(g.era);
          const panteaoId = firstNumId(g.panteao);
          const selected = selectedSlugs.includes(slug);
          const selectDisabled = compareMode && selectedSlugs.length >= 2 && !selected;

          const advContent = hasText(g.descricao_avancada)
            ? [
                <span key="adv" className="text-sm leading-snug text-zinc-300">
                  {g.descricao_avancada}
                </span>,
              ]
            : [];

          return (
            <SpreadsheetTr
              key={g.id}
              className={cn(
                compareMode && "cursor-pointer",
                compareMode && selected && "bg-amber-500/10 ring-1 ring-inset ring-amber-500/40",
                compareMode && selectDisabled && "cursor-not-allowed opacity-45",
              )}
              onClick={
                compareMode && (selected || !selectDisabled) ? () => onToggleSelect?.(slug) : undefined
              }
            >
              <SpreadsheetTd>
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
                    {gpLink?.imageSrc ? (
                      <img src={gpLink.imageSrc} alt="" className="h-6 w-6 shrink-0 rounded object-contain" />
                    ) : null}
                    <span>{g.nome}</span>
                  </span>
                ) : gpLink ? (
                  <Link
                    to={gpLink.to}
                    state={linkState}
                    onMouseEnter={() => showPreview(gpLink)}
                    onFocus={() => showPreview(gpLink)}
                    className="inline-flex max-w-full items-center gap-2 rounded-md px-1 py-0.5 font-medium text-zinc-100 hover:bg-amber-500/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/40"
                  >
                    {gpLink.imageSrc ? (
                      <img src={gpLink.imageSrc} alt="" className="h-6 w-6 shrink-0 rounded object-contain" />
                    ) : null}
                    <span>{g.nome}</span>
                  </Link>
                ) : (
                  g.nome
                )}
              </SpreadsheetTd>
              <SpreadsheetTd className="text-zinc-400">{cellStr(g.ingles)}</SpreadsheetTd>
              <SpreadsheetTd onClick={compareMode ? (e) => e.stopPropagation() : undefined}>
                {godId != null ? (
                  (() => {
                    const link = resolveDeusLink(godId, g.god?.[0]?.nome);
                    return link && !compareMode ? (
                      <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                    ) : (
                      <NotionText text={g.god?.[0]?.nome ?? "—"} />
                    );
                  })()
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd onClick={compareMode ? (e) => e.stopPropagation() : undefined}>
                {eraId != null ? (
                  (() => {
                    const link = resolveEntityNumRef("era", { id: eraId, nome: g.era?.[0]?.nome ?? "" });
                    return link && !compareMode ? (
                      <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                    ) : (
                      <NotionText text={g.era?.[0]?.nome ?? "—"} />
                    );
                  })()
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd className="tabular-nums">{cellNum(g.cooldown_seg)}</SpreadsheetTd>
              <SpreadsheetTd className="tabular-nums">{cellNum(g.duracao_no_mapa_seg)}</SpreadsheetTd>
              <SpreadsheetTd className="tabular-nums">{cellNum(g.custo_repetir)}</SpreadsheetTd>
              <SpreadsheetTd>{cellStr(g.incremento_por_uso)}</SpreadsheetTd>
              <SpreadsheetTd>
                {hasText(g.descricao_resumida) ? (
                  <p className="max-w-md text-sm leading-snug text-zinc-300">{g.descricao_resumida}</p>
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
              <SpreadsheetTd>
                {advContent.length > 0 ? <SpreadsheetExpandableStack items={advContent} /> : "—"}
              </SpreadsheetTd>
              <SpreadsheetTd onClick={compareMode ? (e) => e.stopPropagation() : undefined}>
                {panteaoId != null ? (
                  (() => {
                    const link = resolveEntityNumRef("panteao", {
                      id: panteaoId,
                      nome: g.panteao?.[0]?.nome ?? "",
                    });
                    return link && !compareMode ? (
                      <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                    ) : (
                      <NotionText text={g.panteao?.[0]?.nome ?? "—"} />
                    );
                  })()
                ) : (
                  "—"
                )}
              </SpreadsheetTd>
            </SpreadsheetTr>
          );
        })}
      </SpreadsheetBody>
    </SpreadsheetTable>
  );
}
