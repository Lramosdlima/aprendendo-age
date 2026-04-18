import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { unidades } from "@/data/catalog";

function matches(u: (typeof unidades)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [u.nome, u.tipo ?? "", u.panteao ?? "", u.era ?? "", u.categoria ?? "", u.forte_contra ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

export function UnidadesPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => unidades.filter((u) => matches(u, q)), [q]);

  return (
    <div>
      <PageHeader title="Unidades" description="Militares, mitológicas e heróis — filtros por nome ou papel." />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar…" id="unidades-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((u) => (
          <li key={u.id}>
            <EntityCard
              to={`/unidades/${u.id}`}
              title={u.nome}
              subtitle={u.tipo}
              meta={[u.panteao, u.era].filter(Boolean).join(" · ")}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
