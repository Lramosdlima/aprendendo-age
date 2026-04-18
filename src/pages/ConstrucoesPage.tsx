import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { construcoes } from "@/data/catalog";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";

function matches(c: (typeof construcoes)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [c.nome, c.tipo ?? "", c.panteao ?? "", c.era ?? "", c.ingles ?? ""].join(" ").toLowerCase().includes(s);
}

export function ConstrucoesPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => construcoes.filter((c) => matches(c, q)), [q]);

  return (
    <div>
      <PageHeader title="Construções" description="Edifícios, custos e estatísticas de combate quando aplicável." />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome ou tipo…" id="constr-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <li key={c.id}>
            <EntityCard
              to={`/construcoes/${c.id}`}
              title={c.nome}
              subtitle={c.tipo}
              meta={[c.panteao, c.era].filter(Boolean).join(" · ")}
              watermarkSrc={getConstrucaoAssetUrl(c.ingles)}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
