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
import type { LocaleCatalog } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { firstNumId, joinRefNomesOrString } from "@/lib/entityRefs";
import type { ResolvedEntityLink } from "@/lib/entityResolve";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { getTecnologiaAssetUrl } from "@/lib/tecnologiaAssetUrl";
import { campoSearchBlob } from "@/lib/tecnologiaCampo";

function matches(t: LocaleCatalog["tecnologias"][number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [
    t.nome,
    t.ingles ?? "",
    t.tipo ?? "",
    t.beneficia ?? "",
    campoSearchBlob(t.campo),
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
  const { t } = useTranslation();
  const { tecnologias, tecnologiaSlugByIndex } = useCatalog();
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
        .map((tec, index) => ({ t: tec, index }))
        .filter(({ t: tec }) => matches(tec, q)),
    [tecnologias, q],
  );

  return (
    <div className="w-full min-w-0">
      <ListPageStickyHeader>
        <PageHeader
          title={t("pages.tecnologias.title")}
          description={t("pages.tecnologias.description")}
          className="!mb-0 w-full"
          actions={
            viewMode === "planilha" ? (
              <SpreadsheetHoverPreview preview={spreadsheetPreview} className="sm:pt-1" />
            ) : undefined
          }
        />
        <div className="flex flex-col items-start gap-3">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder={t("pages.tecnologias.filterPlaceholder")}
            id="tec-search"
          />
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
          {filtered.map(({ t: tec, index }) => (
            <li key={`${index}-${tec.nome}`}>
              <EntityCard
                to={`/tecnologias/${tecnologiaSlugByIndex.get(index) ?? index}`}
                linkState={listIndexState}
                title={tec.nome || t("pages.tecnologias.untitled", { index })}
                cardTint={pantheonCardTint(joinRefNomesOrString(tec.panteoes))}
                watermarkSrc={getTecnologiaAssetUrl(tec)}
                subtitle={tec.beneficia ? <NotionText text={tec.beneficia} /> : undefined}
                meta={
                  <span className="flex flex-col gap-1.5">
                    <span className="inline-flex flex-wrap items-baseline gap-x-0">
                      {Array.isArray(tec.panteoes) && firstNumId(tec.panteoes) != null ? (
                        <PantheonMetaIcon panteaoId={firstNumId(tec.panteoes)!} />
                      ) : null}
                      <MetaNotionLine parts={[joinRefNomesOrString(tec.panteoes), joinRefNomesOrString(tec.eras)]} />
                    </span>
                    {tec.tipo?.trim() ? <TecnologiaTipoBadges tipo={tec.tipo} /> : null}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">{t("common.noResults")}</p>
      ) : null}
    </div>
  );
}
