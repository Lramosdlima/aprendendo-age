import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { ListPageStickyHeader } from "@/components/layout/ListPageStickyHeader";
import { StartAuthorsMeta, startAuthorsSearchText } from "@/components/start/StartAuthorsMeta";
import { StartGodPortraits } from "@/components/start/StartGodPortraits";
import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { startsBuildOrder } from "@/data/catalog";
import { useListPageSearchQuery } from "@/hooks/useListPageSearchQuery";
import { listIndexLinkStateFromLocation } from "@/lib/listIndexReturnState";
import { cn } from "@/lib/cn";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import { resolveTokenIconSrc } from "@/lib/tokenIconUrl";

function matchesStart(
  s: (typeof startsBuildOrder)[number],
  q: string,
): boolean {
  if (!q.trim()) return true;
  const needle = q.toLowerCase().trim();
  const hay = [s.titulo, startAuthorsSearchText(s.author), ...s.god].join(" ").toLowerCase();
  return hay.includes(needle);
}

const startNovoTagClassBase =
  "inline-flex shrink-0 items-center rounded border border-sky-700/55 bg-sky-950/80 font-semibold text-sky-200";

export const startNovoTagClass = cn(startNovoTagClassBase, "rounded-md px-2 py-0.5 text-xs");

/** Variação menor (menu lateral / navegação). */
export const startNovoTagClassNav = cn(
  startNovoTagClassBase,
  "px-1 py-px text-[0.6rem] leading-tight",
);

export function StartsPage() {
  const { pathname, search: locSearch } = useLocation();
  const listIndexState = useMemo(
    () => listIndexLinkStateFromLocation(pathname, locSearch),
    [pathname, locSearch],
  );
  const [q, setQ] = useListPageSearchQuery();
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
              linkState={listIndexState}
              watermarkSrc={resolveTokenIconSrc(s.image)}
              title={
                <span className="flex w-full min-w-0 items-start justify-between gap-2">
                  <span className="min-w-0">
                    <NotionText text={s.titulo} />
                  </span>
                  {s.status === "new" ? (
                    <span className={startNovoTagClass} title="Novo">
                      🔷 Novo !
                    </span>
                  ) : null}
                </span>
              }
              subtitleTag={false}
              subtitle={s.god.length ? <StartGodPortraits names={s.god} /> : undefined}
              cardTint={s.pantheon ? pantheonCardTint(s.pantheon) : undefined}
              meta={<StartAuthorsMeta authors={s.author} />}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
