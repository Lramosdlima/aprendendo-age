import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { aldeaoSlugById, aldeoes, panteaoById } from "@/data/catalog";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { firstNome, firstNumId, joinRefNomes } from "@/lib/entityRefs";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { pantheonCardTint } from "@/lib/pantheonCardTint";

function matches(a: (typeof aldeoes)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [a.nome, a.ingles ?? "", joinRefNomes(a.panteao)].join(" ").toLowerCase().includes(s);
}

const toolbarBtn =
  "rounded-xl border border-aom-border bg-zinc-900/50 px-3.5 py-2 text-sm font-medium text-amber-100/95 transition-colors hover:border-amber-500/40 hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-45";

export function AldeoesPage() {
  const navigate = useNavigate();
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const filtered = useMemo(() => aldeoes.filter((a) => matches(a, q)), [q]);

  function toggleSelect(slug: string) {
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((x) => x !== slug);
      if (prev.length >= 2) return prev;
      return [...prev, slug];
    });
  }

  function exitCompareMode() {
    setCompareMode(false);
    setSelectedSlugs([]);
  }

  function enterCompareMode() {
    setCompareMode(true);
    setSelectedSlugs([]);
  }

  const canCompare = selectedSlugs.length === 2;

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title="Aldeões e trabalhadores"
          description="Coleta base e variações por civilização — filtros por nome ou panteão."
          className="!mb-0"
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchField value={q} onChange={setQ} placeholder="Filtrar…" id="aldeoes-search" />
          <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
            {!compareMode ? (
              <button type="button" className={toolbarBtn} onClick={enterCompareMode}>
                Modo Comparação
              </button>
            ) : (
              <>
                <button type="button" className={toolbarBtn} onClick={exitCompareMode}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className={toolbarBtn}
                  disabled={!canCompare}
                  onClick={() => {
                    if (!canCompare) return;
                    navigate(`/aldeoes/compare/${selectedSlugs[0]}/${selectedSlugs[1]}`);
                  }}
                >
                  Comparar
                </button>
              </>
            )}
          </div>
        </div>
      </ListPageStickyHeader>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => {
          const slug = aldeaoSlugById.get(a.id) ?? String(a.id);
          const selected = selectedSlugs.includes(slug);
          const selectDisabled = compareMode && selectedSlugs.length >= 2 && !selected;
          const panteaoId = firstNumId(a.panteao);
          const tintNome = panteaoId != null ? (panteaoById.get(panteaoId)?.nome ?? "") : "";

          return (
            <li key={a.id}>
              <EntityCard
                to={`/aldeoes/${slug}`}
                linkState={listIndexState}
                title={a.nome}
                cardTint={pantheonCardTint(tintNome)}
                subtitle={firstNome(a.panteao) ? <NotionText text={firstNome(a.panteao)!} /> : undefined}
                meta={<MetaNotionLine parts={[a.ingles]} />}
                watermarkSrc={getAldeaoAssetUrl(a)}
                compareMode={compareMode}
                selected={selected}
                selectDisabled={selectDisabled}
                onToggleSelect={() => toggleSelect(slug)}
              />
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p>
      ) : null}
    </div>
  );
}
