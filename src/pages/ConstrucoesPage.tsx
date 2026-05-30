import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import type { LocaleCatalog } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { panteaoFieldHasMultiplePantheons, pantheonCardTint } from "@/lib/pantheonCardTint";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { hasTipoContent, tipoItemsToSearchBlob } from "@/lib/unidadeTipo";

function matches(c: LocaleCatalog["construcoes"][number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const tipoBlob = hasTipoContent(c.tipo) ? tipoItemsToSearchBlob(c.tipo) : "";
  return [c.nome, tipoBlob, c.panteao ?? "", c.era ?? "", c.ingles ?? ""].join(" ").toLowerCase().includes(s);
}

export function ConstrucoesPage() {
  const { t } = useTranslation();
  const { construcoes, construcaoSlugById, panteaoById } = useCatalog();
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const filtered = useMemo(() => construcoes.filter((c) => matches(c, q)), [construcoes, q]);

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title={t("pages.construcoes.title")}
          description={t("pages.construcoes.description")}
          className="!mb-0"
        />
        <SearchField
          value={q}
          onChange={setQ}
          placeholder={t("pages.construcoes.filterPlaceholder")}
          id="constr-search"
        />
      </ListPageStickyHeader>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <li key={c.id}>
            <EntityCard
              to={`/construcoes/${construcaoSlugById.get(c.id) ?? c.id}`}
              linkState={listIndexState}
              title={c.nome}
              cardTint={
                panteaoFieldHasMultiplePantheons(c.panteao)
                  ? undefined
                  : pantheonCardTint(
                      (c.panteao_id != null ? panteaoById.get(c.panteao_id) : undefined)?.nome ?? "",
                    )
              }
              subtitle={
                hasTipoContent(c.tipo) ? (
                  <UnidadeTipoLine tipo={c.tipo} colored shell="none" />
                ) : undefined
              }
              meta={<MetaNotionLine parts={[c.panteao, c.era]} />}
              watermarkSrc={getConstrucaoAssetUrl(c)}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">{t("common.noResults")}</p>
      ) : null}
    </div>
  );
}
