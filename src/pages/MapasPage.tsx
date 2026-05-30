import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import type { LocaleCatalog } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { getMapaAssetUrl, getMapaPreviewUrl } from "@/lib/entityWatermarkUrls";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";

function matches(m: LocaleCatalog["mapas"][number], q: string, index: number) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const blob = [m.nome, m.ingles ?? "", m.tipo ?? "", m.origem ?? "", String(index)].join(" ").toLowerCase();
  return blob.includes(s);
}

export function MapasPage() {
  const { t } = useTranslation();
  const { mapas, mapaSlugByIndex } = useCatalog();
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const filtered = useMemo(
    () => mapas.map((m, i) => ({ m, i })).filter(({ m, i }) => matches(m, q, i)),
    [mapas, q],
  );

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title={t("pages.mapas.title")}
          description={t("pages.mapas.description")}
          className="!mb-0"
        />
        <SearchField
          value={q}
          onChange={setQ}
          placeholder={t("pages.mapas.filterPlaceholder")}
          id="mapas-search"
        />
      </ListPageStickyHeader>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(({ m, i }) => (
          <li key={`${m.nome}-${i}`}>
            <EntityCard
              to={`/mapas/${mapaSlugByIndex.get(i) ?? i}`}
              linkState={listIndexState}
              title={m.nome}
              subtitle={m.tipo}
              meta={m.origem}
              backgroundCoverSrc={getMapaPreviewUrl(m)}
              backgroundCoverFallbackSrc={getMapaAssetUrl(m)}
              watermarkSrc={getMapaAssetUrl(m)}
              titleIcons={
                m.mapas_da_ranqueada
                  ? [{ icon: "aomr_type_hero_icon", label: t("common.ranked") }]
                  : undefined
              }
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
