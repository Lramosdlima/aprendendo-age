import { useMemo, useState } from "react";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
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

const godTagClass =
  "inline-flex max-w-full shrink-0 items-center rounded border border-amber-600/45 bg-amber-500/10 px-1.5 py-0.5 text-sm font-medium leading-snug text-amber-200/90 [word-break:break-word]";

const novoTagClass =
  "inline-flex shrink-0 items-center rounded-md border border-sky-700/55 bg-sky-950/80 px-2 py-0.5 text-xs font-semibold text-sky-200";

function StartGodTags({ names }: { names: string[] }) {
  if (!names.length) return null;
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1 align-top">
      {names.map((name, i) => (
        <span key={`${name}-${i}`} className={godTagClass}>
          {name}
        </span>
      ))}
    </span>
  );
}

export function StartsPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const list = startsBuildOrder.filter((s) => matchesStart(s, q));
    return [...list].sort((a, b) => {
      const aNew = a.status === "new" ? 0 : 1;
      const bNew = b.status === "new" ? 0 : 1;
      return aNew - bNew;
    });
  }, [q]);

  return (
    <div>
      <ListPageStickyHeader>
        <PageHeader
          title="Starts & build orders"
          description="Start ou Build Order é uma sequência de ações que se executa no início da partida com determinado deus/panteão. Geralmente é focada em um objetivo/intenção (seja rush ou um FH), que é construído a partir da disposição dos aldeões, ou seja, na economia."
          className="!mb-0"
        />
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Filtrar por título, autor ou deus (maior/menor)…"
          id="starts-search"
        />
      </ListPageStickyHeader>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <li key={s.slug} className="min-h-[8.5rem]">
            <EntityCard
              className="h-full"
              to={`/starts/${s.slug}`}
              title={
                <span className="flex w-full min-w-0 items-start justify-between gap-2">
                  <span className="min-w-0">
                    <NotionText text={s.titulo} />
                  </span>
                  {s.status === "new" ? (
                    <span className={novoTagClass} title="Novo">
                      🔷 Novo !
                    </span>
                  ) : null}
                </span>
              }
              subtitleTag={false}
              subtitle={s.god.length ? <StartGodTags names={s.god} /> : undefined}
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
