import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";

export type DeusPortraitHeaderItem = {
  key: string;
  slug: string;
  nome: string;
  src: string | null | undefined;
};

const cardClass =
  "group shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 shadow-sm shadow-black/30 transition hover:border-amber-400/50 hover:ring-1 hover:ring-amber-400/30";

type Props = {
  items: DeusPortraitHeaderItem[];
  linkState: ListIndexLinkState;
  /** Ex.: `justify-start` quando o bloco fica dentro de `InfoRow` (não no canto do `PageHeader`). */
  className?: string;
};

export function DeusPortraitHeaderActions({ items, linkState, className }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-row flex-wrap items-center justify-end gap-2", className)}>
      {items.map((item) => (
        <Link
          key={item.key}
          to={`/deuses/${item.slug}`}
          state={linkState}
          title={item.nome}
          aria-label={`Ver página de ${item.nome}`}
          className={cardClass}
        >
          {item.src ? (
            <img
              src={item.src}
              alt=""
              className="h-16 w-16 rounded-xl object-contain p-1.5 sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl p-1.5 text-center text-xs font-semibold leading-tight text-zinc-400 sm:h-20 sm:w-20">
              {item.nome.slice(0, 3)}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
