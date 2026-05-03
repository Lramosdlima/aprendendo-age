import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { NotionText } from "@/components/ui/NotionText";
import { PantheonMetaIcon } from "@/components/ui/PantheonMetaIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { deuses, deusSlugById } from "@/data/catalog";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { firstNome, firstNumId, joinRefNomes } from "@/lib/entityRefs";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { pantheonCardTint } from "@/lib/pantheonCardTint";

function matches(d: (typeof deuses)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const blob = [
    d.nome,
    firstNome(d.panteao) ?? "",
    d.hierarquia ?? "",
    firstNome(d.era) ?? "",
    d.foco ?? "",
    joinRefNomes(d.god_maior_relacao),
    joinRefNomes(d.tecnologias),
    joinRefNomes(d.unidades_exclusivas),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(s);
}

function isHierarquiaMaior(h: string | undefined): boolean {
  return h?.toLowerCase() === "maior";
}

export function DeusesPage() {
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
  const filtered = useMemo(() => {
    const list = deuses.filter((d) => matches(d, q));
    return [...list].sort((a, b) => {
      const aM = isHierarquiaMaior(a.hierarquia) ? 0 : 1;
      const bM = isHierarquiaMaior(b.hierarquia) ? 0 : 1;
      if (aM !== bM) return aM - bM;
      return a.id - b.id;
    });
  }, [q]);

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title="Deuses"
          description="Escolhas de maiores e menores com foco e referências de build."
          className="!mb-0"
        />
        <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome, panteão ou era…" id="deuses-search" />
      </ListPageStickyHeader>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <li key={d.id}>
            <EntityCard
              to={`/deuses/${deusSlugById.get(d.id) ?? d.id}`}
              linkState={listIndexState}
              title={d.nome}
              cardTint={pantheonCardTint(firstNome(d.panteao) ?? "")}
              subtitle={d.foco ? <NotionText text={d.foco} /> : undefined}
              meta={
                <span className="inline-flex flex-wrap items-baseline gap-x-0">
                  {firstNumId(d.panteao) != null ? <PantheonMetaIcon panteaoId={firstNumId(d.panteao)!} /> : null}
                  <MetaNotionLine parts={[firstNome(d.panteao), firstNome(d.era)]} />
                </span>
              }
              watermarkSrc={getDeusAssetUrl(d)}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
