import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { startsBuildOrder } from "@/data/catalog";
import { pantheonCardTint } from "@/lib/pantheonCardTint";

function matchesStart(
  s: (typeof startsBuildOrder)[number],
  q: string,
): boolean {
  if (!q.trim()) return true;
  const needle = q.toLowerCase().trim();
  const hay = [s.titulo, ...s.author, ...s.god].join(" ").toLowerCase();
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
        placeholder="Filtrar por título, autor ou deus (major/minor)…"
        id="starts-search"
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <li key={s.slug} className="min-h-[8.5rem]">
            <EntityCard
              className="h-full"
              to={`/starts/${s.slug}`}
              title={<NotionText text={s.titulo} />}
              subtitle={s.god.join(", ")}
              cardTint={s.pantheon ? pantheonCardTint(s.pantheon) : undefined}
              meta={
                <span
                  className={s.author.length ? "" : "invisible select-none"}
                  aria-hidden={s.author.length === 0}
                >
                  {s.author.length ? s.author.join(" · ") : "—"}
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
