import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { startsBuildOrder } from "@/data/catalog";

function matchesStart(
  s: (typeof startsBuildOrder)[number],
  q: string,
): boolean {
  if (!q.trim()) return true;
  const needle = q.toLowerCase().trim();
  const hay = [s.titulo, s.god, ...(s.god.split(",").map((g) => g.trim()))].join(" ").toLowerCase();
  return hay.includes(needle);
}

export function StartsPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => startsBuildOrder.filter((s) => matchesStart(s, q)), [q]);

  return (
    <div>
      <PageHeader
        title="Starts & build orders"
        description="Sequências em tabela (comida, madeira, ouro, pop), callouts e links de vídeo. Ícones em /assets."
      />
      <SearchField
        value={q}
        onChange={setQ}
        placeholder="Filtrar por título ou deus (major/minor)…"
        id="starts-search"
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <li key={s.id} className="min-h-[8.5rem]">
            <EntityCard
              className="h-full"
              to={`/starts/${s.id}`}
              title={<NotionText text={s.titulo} />}
              subtitle={s.god}
              meta={
                <span className={s.youtube.length ? "" : "invisible select-none"} aria-hidden={s.youtube.length === 0}>
                  {s.youtube.length ? `${s.youtube.length} vídeo(s)` : "0 vídeo(s)"}
                </span>
              }
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
