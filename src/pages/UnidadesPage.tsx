import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { EntityCard } from "@/components/ui/EntityCard";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { panteaoById, unidadeSlugById, unidades } from "@/data/catalog";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import {
  hasTipoContent,
  tipoItemsToSearchBlob,
} from "@/lib/unidadeTipo";

function matches(u: (typeof unidades)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [
    u.nome,
    tipoItemsToSearchBlob(u.tipo),
    u.panteao ?? "",
    u.era ?? "",
    tipoItemsToSearchBlob(u.categoria),
    u.forte_contra ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

const toolbarBtn =
  "rounded-xl border border-aom-border bg-zinc-900/50 px-3.5 py-2 text-sm font-medium text-amber-100/95 transition-colors hover:border-amber-500/40 hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-45";

export function UnidadesPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const filtered = useMemo(() => unidades.filter((u) => matches(u, q)), [q]);

  function toggleSelect(unitSlug: string) {
    setSelectedSlugs((prev) => {
      if (prev.includes(unitSlug)) return prev.filter((x) => x !== unitSlug);
      if (prev.length >= 2) return prev;
      return [...prev, unitSlug];
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
          title="Unidades"
          description="Militares, mitológicas e heróis — filtros por nome ou papel."
          className="!mb-0"
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchField value={q} onChange={setQ} placeholder="Filtrar…" id="unidades-search" />
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
                    navigate(`/unidades/compare/${selectedSlugs[0]}/${selectedSlugs[1]}`);
                  }}
                >
                  Comparar
                </button>
              </>
            )}
          </div>
        </div>
      </ListPageStickyHeader>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((u) => {
          const slug = unidadeSlugById.get(u.id) ?? String(u.id);
          const selected = selectedSlugs.includes(slug);
          const selectDisabled = compareMode && selectedSlugs.length >= 2 && !selected;
          const multiTipo = hasTipoContent(u.tipo) && u.tipo!.length > 1;

          return (
            <li key={u.id}>
              <EntityCard
                to={`/unidades/${slug}`}
                title={u.nome}
                cardTint={pantheonCardTint(panteaoById.get(u.panteao_id)?.nome ?? "")}
                subtitleTag={multiTipo}
                subtitleTagVariant="rich"
                subtitle={
                  hasTipoContent(u.tipo) ? <UnidadeTipoLine tipo={u.tipo} colored /> : undefined
                }
                meta={<MetaNotionLine parts={[u.panteao, u.era]} />}
                watermarkSrc={getUnidadeAssetUrl(u.ingles)}
                compareMode={compareMode}
                selected={selected}
                selectDisabled={selectDisabled}
                onToggleSelect={() => toggleSelect(slug)}
              />
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
