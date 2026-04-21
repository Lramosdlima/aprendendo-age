import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { mapas } from "@/data/catalog";
import { getMapaAssetUrl, getMapaPreviewUrl } from "@/lib/entityWatermarkUrls";

function matches(m: (typeof mapas)[number], q: string, index: number) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const blob = [m.nome, m.ingles ?? "", m.tipo ?? "", m.origem ?? "", String(index)].join(" ").toLowerCase();
  return blob.includes(s);
}

export function MapasPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => mapas.map((m, i) => ({ m, i })).filter(({ m, i }) => matches(m, q, i)),
    [q],
  );

  return (
    <div>
      <PageHeader title="Mapas" description="Origem, ranqueada e tipo — o detalhe usa o índice do JSON para mapas com nome repetido." />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome ou tipo…" id="mapas-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(({ m, i }) => (
          <li key={`${m.nome}-${i}`}>
            <EntityCard
              to={`/mapas/${i}`}
              title={m.nome}
              subtitle={m.tipo}
              meta={m.origem}
              backgroundCoverSrc={getMapaPreviewUrl(m.ingles)}
              watermarkSrc={getMapaAssetUrl(m.ingles)}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
