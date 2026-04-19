import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { panteaoById, unidades } from "@/data/catalog";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";
import { pantheonCardTint } from "@/lib/pantheonCardTint";

function matches(u: (typeof unidades)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [u.nome, u.tipo ?? "", u.panteao ?? "", u.era ?? "", u.categoria ?? "", u.forte_contra ?? ""]
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filtered = useMemo(() => unidades.filter((u) => matches(u, q)), [q]);

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function exitCompareMode() {
    setCompareMode(false);
    setSelectedIds([]);
  }

  function enterCompareMode() {
    setCompareMode(true);
    setSelectedIds([]);
  }

  const canCompare = selectedIds.length === 2;

  return (
    <div>
      <PageHeader title="Unidades" description="Militares, mitológicas e heróis — filtros por nome ou papel." />

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
                  navigate(`/unidades/compare/${selectedIds[0]}/${selectedIds[1]}`);
                }}
              >
                Comparar
              </button>
            </>
          )}
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((u) => {
          const selected = selectedIds.includes(u.id);
          const selectDisabled = compareMode && selectedIds.length >= 2 && !selected;

          return (
            <li key={u.id}>
              <EntityCard
                to={`/unidades/${u.id}`}
                title={u.nome}
                cardTint={pantheonCardTint(panteaoById.get(u.panteao_id)?.nome ?? "")}
                subtitle={u.tipo ? <NotionText text={u.tipo} /> : undefined}
                meta={<MetaNotionLine parts={[u.panteao, u.era]} />}
                watermarkSrc={getUnidadeAssetUrl(u.ingles)}
                compareMode={compareMode}
                selected={selected}
                selectDisabled={selectDisabled}
                onToggleSelect={() => toggleSelect(u.id)}
              />
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
