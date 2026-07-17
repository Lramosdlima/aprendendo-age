import { useMemo, useState } from "react";
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
import { cn } from "@/lib/cn";

type MapFilterKey = "ranked" | "default" | "quickMatches" | "land" | "water";

function matchesMapFilter(m: LocaleCatalog["mapas"][number], filterKey: MapFilterKey | null) {
  if (!filterKey) return true;
  if (filterKey === "ranked") return m.mapas_da_ranqueada;
  if (filterKey === "default") return m.padrao;
  if (filterKey === "quickMatches") return m.partidas_rapidas;
  if (filterKey === "land") return m.tipo?.toLowerCase().includes("terra");
  return m.tipo?.toLowerCase().includes("naval");
}

function matches(
  m: LocaleCatalog["mapas"][number],
  q: string,
  index: number,
  filterKey: MapFilterKey | null,
) {
  if (!matchesMapFilter(m, filterKey)) return false;
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
  const [filterKey, setFilterKey] = useState<MapFilterKey | null>(null);
  const filtered = useMemo(
    () => mapas.map((m, i) => ({ m, i })).filter(({ m, i }) => matches(m, q, i, filterKey)),
    [mapas, q, filterKey],
  );
  const filterOptions: Array<{ key: MapFilterKey; label: string }> = [
    { key: "ranked", label: t("pages.mapas.filters.ranked") },
    { key: "default", label: t("pages.mapas.filters.default") },
    { key: "quickMatches", label: t("pages.mapas.filters.quickMatches") },
    { key: "land", label: t("pages.mapas.filters.land") },
    { key: "water", label: t("pages.mapas.filters.water") },
  ];

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title={t("pages.mapas.title")}
          description={t("pages.mapas.description")}
          className="!mb-0"
        />
        <div className="flex w-full flex-col gap-3">
          <SearchField
            value={q}
            onChange={setQ}
            placeholder={t("pages.mapas.filterPlaceholder")}
            id="mapas-search"
            className="relative w-full max-w-none"
          />
          <div
            className="flex min-w-0 flex-wrap items-center gap-2"
            aria-label={t("pages.mapas.filterTagLabel")}
          >
            <button
              type="button"
              onClick={() => setFilterKey(null)}
              aria-pressed={filterKey === null}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/35",
                filterKey === null
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-100"
                  : "border-aom-border bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
              )}
            >
              {t("pages.mapas.filterTagAll")}
            </button>
            {filterOptions.map((option) => {
              const active = filterKey === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilterKey(active ? null : option.key)}
                  aria-pressed={active}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/35",
                    active
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-100"
                      : "border-aom-border bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
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
