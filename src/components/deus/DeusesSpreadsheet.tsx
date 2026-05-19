import { Link } from "react-router-dom";

import {
  SpreadsheetBody,
  SpreadsheetCellStack,
  SpreadsheetHead,
  SpreadsheetTable,
  SpreadsheetTd,
  SpreadsheetTh,
  SpreadsheetTr,
} from "@/components/spreadsheet/SpreadsheetTable";
import { SpreadsheetExpandableStack } from "@/components/spreadsheet/SpreadsheetExpandableStack";
import { SpreadsheetRefChip } from "@/components/spreadsheet/SpreadsheetRefChip";
import { AppTag } from "@/components/ui/AppTag";
import { NotionText } from "@/components/ui/NotionText";
import type { Deus } from "@/lib/godMajorTree";
import { firstNumId } from "@/lib/entityRefs";
import {
  resolveDeusLink,
  resolveEntityNumRef,
  resolveGodpowerLink,
  resolveTecnologiaLink,
  type ResolvedEntityLink,
} from "@/lib/entityResolve";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";
import { cn } from "@/lib/cn";

type DeusesSpreadsheetProps = {
  rows: Deus[];
  linkState: ListIndexLinkState;
  onPreview?: (link: ResolvedEntityLink) => void;
};

function hierarquiaTagClass(h: string | undefined): string {
  if (h?.toLowerCase() === "maior") {
    return "border-red-900/60 bg-red-950/70 text-red-100/90 normal-case";
  }
  return "border-zinc-700/60 bg-zinc-800/80 text-zinc-300 normal-case";
}

export function DeusesSpreadsheet({ rows, linkState, onPreview }: DeusesSpreadsheetProps) {
  const showPreview = (link: ResolvedEntityLink) => {
    onPreview?.(link);
  };

  return (
    <SpreadsheetTable>
        <SpreadsheetHead>
          <SpreadsheetTh>Deus</SpreadsheetTh>
          <SpreadsheetTh>Foco</SpreadsheetTh>
          <SpreadsheetTh>Panteão</SpreadsheetTh>
          <SpreadsheetTh>Era</SpreadsheetTh>
          <SpreadsheetTh>GodPower</SpreadsheetTh>
          <SpreadsheetTh className="min-w-[9rem]">Unidades exclusivas</SpreadsheetTh>
          <SpreadsheetTh className="min-w-[9rem]">God maior relação</SpreadsheetTh>
          <SpreadsheetTh className="min-w-[9rem]">Tecnologias</SpreadsheetTh>
          <SpreadsheetTh>Hierarquia</SpreadsheetTh>
        </SpreadsheetHead>
        <SpreadsheetBody>
          {rows.map((d) => {
            const deusLink = resolveDeusLink(d.id, d.nome);
            const panteaoId = firstNumId(d.panteao);
            const eraId = firstNumId(d.era);
            const gpId = firstNumId(d.godpower);

            const tecnologiaItems = (d.tecnologias ?? []).map((ref, i) => {
              const link = resolveTecnologiaLink(ref);
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

            return (
              <SpreadsheetTr key={d.id}>
                <SpreadsheetTd>
                  {deusLink ? (
                    <Link
                      to={deusLink.to}
                      state={linkState}
                      onMouseEnter={() => showPreview(deusLink)}
                      onFocus={() => showPreview(deusLink)}
                      className="inline-flex max-w-full items-center gap-2 rounded-md px-1 py-0.5 font-medium text-zinc-100 hover:bg-amber-500/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/40"
                    >
                      {deusLink.imageSrc ? (
                        <img src={deusLink.imageSrc} alt="" className="h-6 w-6 shrink-0 rounded object-contain" />
                      ) : null}
                      <span>{d.nome}</span>
                    </Link>
                  ) : (
                    d.nome
                  )}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {d.foco ? <NotionText text={d.foco} className="text-sm" /> : "—"}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {panteaoId != null ? (
                    (() => {
                      const link = resolveEntityNumRef("panteao", { id: panteaoId, nome: d.panteao?.[0]?.nome ?? "" });
                      return link ? (
                        <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                      ) : (
                        d.panteao?.[0]?.nome ?? "—"
                      );
                    })()
                  ) : (
                    "—"
                  )}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {eraId != null ? (
                    (() => {
                      const link = resolveEntityNumRef("era", { id: eraId, nome: d.era?.[0]?.nome ?? "" });
                      return link ? (
                        <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                      ) : (
                        <NotionText text={d.era?.[0]?.nome ?? "—"} />
                      );
                    })()
                  ) : (
                    "—"
                  )}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {gpId != null ? (
                    (() => {
                      const link = resolveGodpowerLink(gpId, d.godpower?.[0]?.nome);
                      return link ? (
                        <SpreadsheetRefChip link={link} linkState={linkState} onPreview={showPreview} />
                      ) : (
                        d.godpower?.[0]?.nome ?? "—"
                      );
                    })()
                  ) : (
                    "—"
                  )}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {(d.unidades_exclusivas ?? []).length > 0 ? (
                    <SpreadsheetCellStack>
                      {d.unidades_exclusivas!.map((ref) => {
                        const link = resolveEntityNumRef("unidade", ref);
                        return link ? (
                          <SpreadsheetRefChip
                            key={ref.id}
                            link={link}
                            linkState={linkState}
                            onPreview={showPreview}
                          />
                        ) : (
                          <span key={ref.id} className="text-sm text-zinc-400">
                            <NotionText text={ref.nome} />
                          </span>
                        );
                      })}
                    </SpreadsheetCellStack>
                  ) : (
                    "—"
                  )}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {(d.god_maior_relacao ?? []).length > 0 ? (
                    <SpreadsheetCellStack>
                      {d.god_maior_relacao!.map((ref) => {
                        const link = resolveDeusLink(ref.id, ref.nome);
                        return link ? (
                          <SpreadsheetRefChip
                            key={ref.id}
                            link={link}
                            linkState={linkState}
                            onPreview={showPreview}
                          />
                        ) : (
                          <span key={ref.id} className="text-sm text-zinc-400">
                            {ref.nome}
                          </span>
                        );
                      })}
                    </SpreadsheetCellStack>
                  ) : (
                    "—"
                  )}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {tecnologiaItems.length > 0 ? (
                    <SpreadsheetExpandableStack items={tecnologiaItems} />
                  ) : (
                    "—"
                  )}
                </SpreadsheetTd>
                <SpreadsheetTd>
                  {d.hierarquia ? (
                    <AppTag variant="rich" className={cn("text-xs", hierarquiaTagClass(d.hierarquia))}>
                      {d.hierarquia}
                    </AppTag>
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
