import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPantheonHeroBackgroundUrl, getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import { SearchField } from "@/components/ui/SearchField";
import { panteoes, panteaoSlugById } from "@/data/catalog";

function matches(p: (typeof panteoes)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const blob = [
    p.nome,
    p.description ?? "",
    ...(Array.isArray(p.deuses) ? p.deuses.map((d) => d.nome) : []),
    ...(Array.isArray(p.vill) ? p.vill.map((v) => v.nome) : []),
    ...(Array.isArray(p.starts) ? p.starts.map((st) => st.nome) : []),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(s);
}

export function PanteoesPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => panteoes.filter((p) => matches(p, q)), [q]);

  return (
    <div>
      <PageHeader title="Panteões" description="Civilizações jogáveis e resumo do estilo de jogo." />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome ou trecho…" id="panteoes-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <li key={p.id}>
            <EntityCard
              to={`/panteoes/${panteaoSlugById.get(p.id) ?? p.id}`}
              title={p.nome}
              cardTint={pantheonCardTint(p.nome)}
              subtitle={p.description}
              meta={`${(Array.isArray(p.deuses) ? p.deuses : []).length} deuses`}
              subtitleTag={false}
              backgroundCoverSrc={getPantheonHeroBackgroundUrl(p)}
              watermarkSrc={getPantheonWatermarkUrl(p)}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
