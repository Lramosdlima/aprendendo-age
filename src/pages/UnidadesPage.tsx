import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { ListViewModeToggle } from "@/components/list/ListViewModeToggle";
import { SpreadsheetHoverPreview } from "@/components/spreadsheet/SpreadsheetHoverPreview";
import { SpreadsheetPageWidth } from "@/components/spreadsheet/SpreadsheetPageWidth";
import { UnidadesSpreadsheet } from "@/components/unidade/UnidadesSpreadsheet";
import { EntityCard } from "@/components/ui/EntityCard";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { ModalApp } from "@/components/ui/ModalApp";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { panteaoById, unidadeSlugById, unidades } from "@/data/catalog";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";
import { firstNumId, joinRefNomes } from "@/lib/entityRefs";
import type { ResolvedEntityLink } from "@/lib/entityResolve";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import {
  hasTipoContent,
  tipoItemsToSearchBlob,
} from "@/lib/unidadeTipo";
import {
  hasMultiplicadorContent,
  multiplicadorItemsToNotionText,
} from "@/lib/unidadeMultiplicador";

function matches(u: (typeof unidades)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [
    u.nome,
    u.ingles ?? "",
    tipoItemsToSearchBlob(u.tipo),
    joinRefNomes(u.panteao),
    joinRefNomes(u.era),
    tipoItemsToSearchBlob(u.categoria),
    u.forte_contra ?? "",
    u.fraco_contra ?? "",
    u.counter_de ?? "",
    hasMultiplicadorContent(u.multiplicador) ? multiplicadorItemsToNotionText(u.multiplicador) : "",
    u.pontos_de_vida != null ? String(u.pontos_de_vida) : "",
    u.comida != null ? String(u.comida) : "",
    u.dps != null ? String(u.dps) : "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

const toolbarBtn =
  "rounded-xl border border-aom-border bg-zinc-900/50 px-3.5 py-2 text-sm font-medium text-amber-100/95 transition-colors hover:border-amber-500/40 hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-45";

export function UnidadesPage() {
  const navigate = useNavigate();
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const [viewMode, setViewMode] = useListViewMode("unidades");
  const [spreadsheetPreview, setSpreadsheetPreview] = useState<ResolvedEntityLink | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [beneficiosOpen, setBeneficiosOpen] = useState(false);

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
  const showSpreadsheetPreview = viewMode === "planilha" && !compareMode;
  const beneficiosImgSrc = "/trilha-de-aprendizado/tipos-unidades-multiplicadores/Militares_Beneficios.png";

  const beneficiosAction = (
    <>
      <button
        type="button"
        onClick={() => setBeneficiosOpen(true)}
        title="Benefícios de Tropa"
        aria-label="Abrir modal: Benefícios de Tropa"
        className="group shrink-0 cursor-pointer rounded-xl border border-aom-border bg-zinc-900/60 shadow-sm shadow-black/30 transition hover:border-amber-400/50 hover:ring-1 hover:ring-amber-400/30"
      >
        <img
          src={beneficiosImgSrc}
          alt=""
          aria-hidden
          className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20"
        />
      </button>
      <ModalApp
        open={beneficiosOpen}
        onClose={() => setBeneficiosOpen(false)}
        title="Benefícios de Tropa"
        description={
          <img
            src={beneficiosImgSrc}
            alt="Benefícios de Tropa"
            className="mt-1 w-full rounded-xl border border-aom-border bg-zinc-950/40 object-contain"
          />
        }
      />
    </>
  );

  return (
    <div className="w-full min-w-0">
      <ListPageStickyHeader>
        <PageHeader
          title="Unidades"
          description="Militares, mitológicas e heróis — filtros por nome ou papel."
          className="!mb-0 w-full"
          actions={
            <div className="flex flex-wrap items-start justify-end gap-3">
              {showSpreadsheetPreview ? (
                <SpreadsheetHoverPreview preview={spreadsheetPreview} className="sm:pt-1" />
              ) : null}
              {beneficiosAction}
            </div>
          }
        />

        <div className="flex flex-col items-start gap-3">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <SearchField value={q} onChange={setQ} placeholder="Filtrar…" id="unidades-search" />
            <div className="flex flex-wrap items-center justify-end gap-2">
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
          {!compareMode ? (
            <ListViewModeToggle mode={viewMode} onChange={setViewMode} id="unidades-view-mode" />
          ) : null}
        </div>
      </ListPageStickyHeader>

      {viewMode === "planilha" ? (
        <SpreadsheetPageWidth>
          <UnidadesSpreadsheet
            rows={filtered}
            linkState={listIndexState}
            onPreview={compareMode ? undefined : setSpreadsheetPreview}
            compareMode={compareMode}
            selectedSlugs={selectedSlugs}
            onToggleSelect={toggleSelect}
          />
        </SpreadsheetPageWidth>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((u) => {
            const slug = unidadeSlugById.get(u.id) ?? String(u.id);
            const selected = selectedSlugs.includes(slug);
            const selectDisabled = compareMode && selectedSlugs.length >= 2 && !selected;
            const categoriaText = u.categoria && u.categoria.map((c) => c.type).join(", ");
            const pIdUn = firstNumId(u.panteao);
            const panteaoNomeCard = pIdUn != null ? (panteaoById.get(pIdUn)?.nome ?? "") : "";

            return (
              <li key={u.id}>
                <EntityCard
                  to={`/unidades/${slug}`}
                  linkState={listIndexState}
                  title={u.nome}
                  cardTint={pantheonCardTint(panteaoNomeCard)}
                  subtitleTag={false}
                  subtitle={
                    hasTipoContent(u.tipo) ? <UnidadeTipoLine tipo={u.tipo} colored /> : undefined
                  }
                  meta={
                    <MetaNotionLine parts={[joinRefNomes(u.panteao), joinRefNomes(u.era), categoriaText]} />
                  }
                  watermarkSrc={getUnidadeAssetUrl(u)}
                  compareMode={compareMode}
                  selected={selected}
                  selectDisabled={selectDisabled}
                  onToggleSelect={() => toggleSelect(slug)}
                />
              </li>
            );
          })}
        </ul>
      )}
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
