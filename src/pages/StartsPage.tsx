import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { StartAuthorsMeta, startAuthorsSearchText } from "@/components/start/StartAuthorsMeta";
import { StartFilterTags } from "@/components/start/StartFilterTags";
import { StartGodPortraits } from "@/components/start/StartGodPortraits";
import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import type { LocaleCatalog } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { cn } from "@/lib/cn";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import {
  buildStartFilterOptions,
  matchesStartFilter,
} from "@/lib/startFilterOptions";
import { resolveTokenIconSrc } from "@/lib/tokenIconUrl";

function matchesStart(
  s: LocaleCatalog["startsBuildOrder"][number],
  q: string,
  filterKey: string | null,
): boolean {
  if (!matchesStartFilter(s, filterKey)) return false;
  if (!q.trim()) return true;
  const needle = q.toLowerCase().trim();
  const hay = [s.titulo, startAuthorsSearchText(s.author), ...s.god].join(" ").toLowerCase();
  return hay.includes(needle);
}

const startNovoTagClassBase =
  "inline-flex shrink-0 items-center rounded border border-sky-700/55 bg-sky-950/80 font-semibold text-sky-200";

export const startNovoTagClass = cn(startNovoTagClassBase, "rounded-md px-2 py-0.5 text-xs");

/** Variação menor (menu lateral / navegação). */
export const startNovoTagClassNav = cn(
  startNovoTagClassBase,
  "px-1 py-px text-[0.6rem] leading-tight",
);

export function StartsPage() {
  const { t } = useTranslation();
  const { startsBuildOrder, panteoes } = useCatalog();
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const [filterKey, setFilterKey] = useState<string | null>(null);
  const filterOptions = useMemo(
    () => buildStartFilterOptions(startsBuildOrder, panteoes),
    [startsBuildOrder, panteoes],
  );
  const filtered = useMemo(() => {
    const list = startsBuildOrder.filter((s) => matchesStart(s, q, filterKey));
    return [...list].sort((a, b) => {
      const aNew = a.status === "new" ? 0 : 1;
      const bNew = b.status === "new" ? 0 : 1;
      return aNew - bNew;
    });
  }, [startsBuildOrder, q, filterKey]);
  const hasActiveFilter = Boolean(q.trim() || filterKey);

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title={t("pages.starts.title")}
          description={t("pages.starts.description")}
          className="!mb-0"
        />
        <div className="flex w-full flex-col gap-3">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder={t("pages.starts.filterPlaceholder")}
            id="starts-search"
          />
          <StartFilterTags options={filterOptions} value={filterKey} onChange={setFilterKey} />
        </div>
      </ListPageStickyHeader>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <li key={s.slug} className="min-h-[8.5rem]">
            <EntityCard
              className="h-full"
              to={`/starts/${s.slug}`}
              linkState={listIndexState}
              watermarkSrc={resolveTokenIconSrc(s.image)}
              title={
                <span className="flex w-full min-w-0 items-start justify-between gap-2">
                  <span className="min-w-0">
                    <NotionText text={s.titulo} />
                  </span>
                  {s.status === "new" ? (
                    <span className={startNovoTagClass} title={t("common.new")}>
                      {t("pages.starts.newBadge")}
                    </span>
                  ) : null}
                </span>
              }
              subtitleTag={false}
              subtitle={s.god.length ? <StartGodPortraits names={s.god} /> : undefined}
              cardTint={s.pantheon ? pantheonCardTint(s.pantheon) : undefined}
              meta={<StartAuthorsMeta authors={s.author} />}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">
          {hasActiveFilter ? t("pages.starts.filterEmpty") : t("common.noResults")}
        </p>
      ) : null}
    </div>
  );
}
