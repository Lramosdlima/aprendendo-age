import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { construcoes, construcaoSlugById } from "@/data/catalog";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { hasTipoContent, tipoItemsToSearchBlob } from "@/lib/unidadeTipo";

function matches(c: (typeof construcoes)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const tipoBlob = hasTipoContent(c.tipo) ? tipoItemsToSearchBlob(c.tipo) : "";
  return [c.nome, tipoBlob, c.panteao ?? "", c.era ?? "", c.ingles ?? ""].join(" ").toLowerCase().includes(s);
}

export function ConstrucoesPage() {
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const filtered = useMemo(() => construcoes.filter((c) => matches(c, q)), [q]);

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title="Construções"
          description="Edifícios, custos e estatísticas de combate quando aplicável."
          className="!mb-0"
        />
        <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome ou tipo…" id="constr-search" />
      </ListPageStickyHeader>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <li key={c.id}>
            <EntityCard
              to={`/construcoes/${construcaoSlugById.get(c.id) ?? c.id}`}
              linkState={listIndexState}
              title={c.nome}
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
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
