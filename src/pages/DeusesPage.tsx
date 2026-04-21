import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { NotionText } from "@/components/ui/NotionText";
import { PantheonMetaIcon } from "@/components/ui/PantheonMetaIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { deuses } from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { pantheonCardTint } from "@/lib/pantheonCardTint";

function matches(d: (typeof deuses)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [d.nome, d.panteao, d.hierarquia ?? "", d.era ?? "", d.foco ?? ""].join(" ").toLowerCase().includes(s);
}

export function DeusesPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => deuses.filter((d) => matches(d, q)), [q]);

  return (
    <div>
      <PageHeader title="Deuses" description="Escolhas de maiores e menores com foco e referências de build." />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome, panteão ou era…" id="deuses-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <li key={d.id}>
            <EntityCard
              to={`/deuses/${d.id}`}
              title={d.nome}
              cardTint={pantheonCardTint(d.panteao)}
              subtitle={d.foco ? <NotionText text={d.foco} /> : undefined}
              meta={
                <span className="inline-flex flex-wrap items-baseline gap-x-0">
                  {d.panteao_id != null ? <PantheonMetaIcon panteaoId={d.panteao_id} /> : null}
                  <MetaNotionLine parts={[d.panteao, d.era]} />
                </span>
              }
              watermarkSrc={getDeusAssetUrl(d.nome)}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
