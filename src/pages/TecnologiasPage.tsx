import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { ListViewModeToggle } from "@/components/list/ListViewModeToggle";
import { SpreadsheetHoverPreview } from "@/components/spreadsheet/SpreadsheetHoverPreview";
import { SpreadsheetPageWidth } from "@/components/spreadsheet/SpreadsheetPageWidth";
import { TecnologiaTipoBadges } from "@/components/tecnologia/TecnologiaTipoBadges";
import { TecnologiasSpreadsheet } from "@/components/tecnologia/TecnologiasSpreadsheet";
import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { NotionText } from "@/components/ui/NotionText";
import { PantheonMetaIcon } from "@/components/ui/PantheonMetaIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { tecnologias, tecnologiaSlugByIndex } from "@/data/catalog";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { firstNumId, joinRefNomesOrString } from "@/lib/entityRefs";
import type { ResolvedEntityLink } from "@/lib/entityResolve";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { getTecnologiaAssetUrl } from "@/lib/tecnologiaAssetUrl";

function matches(t: (typeof tecnologias)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [
    t.nome,
    t.ingles ?? "",
    t.tipo ?? "",
    t.beneficia ?? "",
    t.campo ?? "",
    joinRefNomesOrString(t.panteoes),
    joinRefNomesOrString(t.eras),
    joinRefNomesOrString(t.god_especifico),
    joinRefNomesOrString(t.construcao_origem),
    t.comida != null ? String(t.comida) : "",
    t.madeira != null ? String(t.madeira) : "",
    t.ouro != null ? String(t.ouro) : "",
    t.favor != null ? String(t.favor) : "",
    t.tempo_s != null ? String(t.tempo_s) : "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

export function TecnologiasPage() {
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const [viewMode, setViewMode] = useListViewMode("tecnologias");
  const [spreadsheetPreview, setSpreadsheetPreview] = useState<ResolvedEntityLink | null>(null);

  const filtered = useMemo(
    () =>
      tecnologias
        .map((t, index) => ({ t, index }))
        .filter(({ t }) => matches(t, q)),
    [q],
  );

  return (
    <div className="w-full min-w-0">
      <ListPageStickyHeader>
        <PageHeader
          title="Tecnologias"
          description="Melhorias e bônus — a lista é grande; use a busca!"
          className="!mb-0 w-full"
          actions={
            viewMode === "planilha" ? (
              <SpreadsheetHoverPreview preview={spreadsheetPreview} className="sm:pt-1" />
            ) : undefined
          }
        />
        <div className="flex flex-col items-start gap-3">
          <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome, deus ou panteão…" id="tec-search" />
          <ListViewModeToggle mode={viewMode} onChange={setViewMode} id="tecnologias-view-mode" />
        </div>
      </ListPageStickyHeader>
      {viewMode === "planilha" ? (
        <SpreadsheetPageWidth>
          <TecnologiasSpreadsheet
            rows={filtered}
            linkState={listIndexState}
            onPreview={setSpreadsheetPreview}
          />
        </SpreadsheetPageWidth>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ t, index }) => (
            <li key={`${index}-${t.nome}`}>
              <EntityCard
                to={`/tecnologias/${tecnologiaSlugByIndex.get(index) ?? index}`}
                linkState={listIndexState}
                title={t.nome || `(sem título #${index})`}
                cardTint={pantheonCardTint(joinRefNomesOrString(t.panteoes))}
                watermarkSrc={getTecnologiaAssetUrl(t)}
                subtitle={t.beneficia ? <NotionText text={t.beneficia} /> : undefined}
                meta={
                  <span className="flex flex-col gap-1.5">
                    <span className="inline-flex flex-wrap items-baseline gap-x-0">
                      {Array.isArray(t.panteoes) && firstNumId(t.panteoes) != null ? (
                        <PantheonMetaIcon panteaoId={firstNumId(t.panteoes)!} />
                      ) : null}
                      <MetaNotionLine parts={[joinRefNomesOrString(t.panteoes), joinRefNomesOrString(t.eras)]} />
                    </span>
                    {t.tipo?.trim() ? <TecnologiaTipoBadges tipo={t.tipo} /> : null}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
