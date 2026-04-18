import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { tecnologias } from "@/data/catalog";

function matches(t: (typeof tecnologias)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [t.nome, t.beneficia ?? "", t.panteoes ?? "", t.eras ?? "", t.god_especifico ?? "", t.construcao_origem ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

export function TecnologiasPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => tecnologias.map((t, i) => ({ t, i })).filter(({ t }) => matches(t, q)),
    [q],
  );

  return (
    <div>
      <PageHeader
        title="Tecnologias"
        description="Melhorias e bônus — a lista é grande; use a busca. Entradas sem título único usam o índice no JSON."
      />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome, deus ou panteão…" id="tec-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(({ t, i }) => (
          <li key={`${i}-${t.nome}`}>
            <EntityCard
              to={`/tecnologias/${i}`}
              title={t.nome || `(sem título #${i})`}
              subtitle={t.beneficia ? <NotionText text={t.beneficia} /> : undefined}
              meta={[t.panteoes, t.eras].filter(Boolean).join(" · ")}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
