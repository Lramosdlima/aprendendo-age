import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { godpowers, godpowerSlugById, panteaoById } from "@/data/catalog";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";
import { pantheonCardTint } from "@/lib/pantheonCardTint";

function matches(g: (typeof godpowers)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [g.nome, g.god ?? "", g.era ?? "", g.panteao ?? "", g.descricao_resumida ?? ""].join(" ").toLowerCase().includes(s);
}

const toolbarBtn =
  "rounded-xl border border-aom-border bg-zinc-900/50 px-3.5 py-2 text-sm font-medium text-amber-100/95 transition-colors hover:border-amber-500/40 hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-45";

export function GodpowersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const filtered = useMemo(() => godpowers.filter((g) => matches(g, q)), [q]);

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
          title="Poderes divinos"
          description="Myth powers: cooldown, custo de repetição e descrições."
          className="!mb-0"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchField value={q} onChange={setQ} placeholder="Filtrar…" id="gp-search" />
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
                    navigate(`/poderes/compare/${selectedSlugs[0]}/${selectedSlugs[1]}`);
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
        {filtered.map((g) => {
          const slug = godpowerSlugById.get(g.id) ?? String(g.id);
          const selected = selectedSlugs.includes(slug);
          const selectDisabled = compareMode && selectedSlugs.length >= 2 && !selected;

          return (
            <li key={g.id}>
              <EntityCard
                to={`/poderes/${slug}`}
                title={g.nome}
                cardTint={pantheonCardTint(panteaoById.get(g.panteao_id)?.nome ?? "")}
                subtitle={g.descricao_resumida}
                meta={<MetaNotionLine parts={[g.god, g.era, g.panteao]} />}
                watermarkSrc={getGodPowerAssetUrl(g.ingles)}
                subtitleMinLines={3}
                subtitleTag={false}
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
