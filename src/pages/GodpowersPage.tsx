import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { godpowers } from "@/data/catalog";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";

function matches(g: (typeof godpowers)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [g.nome, g.god ?? "", g.era ?? "", g.panteao ?? "", g.descricao_resumida ?? ""].join(" ").toLowerCase().includes(s);
}

export function GodpowersPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => godpowers.filter((g) => matches(g, q)), [q]);

  return (
    <div>
      <PageHeader title="Poderes divinos" description="Myth powers: cooldown, custo de repetição e descrições." />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar…" id="gp-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((g) => (
          <li key={g.id}>
            <EntityCard
              to={`/poderes/${g.id}`}
              title={g.nome}
              subtitle={g.descricao_resumida}
              meta={[g.god, g.era].filter(Boolean).join(" · ")}
              watermarkSrc={getGodPowerAssetUrl(g.ingles)}
              subtitleMinLines={3}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
