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
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { localeSectionPath } from "@/lib/localeRoutes";
import { getRelicAssetUrl } from "@/lib/relicAssetUrl";

function matches(r: LocaleCatalog["reliquias"][number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [r.nome, r.ingles ?? "", r.descricao_resumida ?? "", r.descricao_avancada ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

export function ReliquiasPage() {
  const { t, locale } = useTranslation();
  const { reliquias, reliquiaSlugById } = useCatalog();
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const filtered = useMemo(() => reliquias.filter((r) => matches(r, q)), [reliquias, q]);

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title={t("pages.reliquias.title")}
          description={t("pages.reliquias.description")}
          className="!mb-0"
        />
        <SearchField
          value={q}
          onChange={setQ}
          placeholder={t("pages.reliquias.filterPlaceholder")}
          id="relic-search"
        />
      </ListPageStickyHeader>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <li key={r.id}>
            <EntityCard
              to={localeSectionPath(locale, "reliquias", reliquiaSlugById.get(r.id) ?? r.id)}
              linkState={listIndexState}
              title={r.nome}
              subtitle={r.descricao_resumida}
              watermarkSrc={getRelicAssetUrl(r)}
              subtitleMinLines={3}
              subtitleTag={false}
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
