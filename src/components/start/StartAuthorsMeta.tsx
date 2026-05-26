import { Fragment } from "react";

import { StartAuthorAvatar } from "@/components/start/StartAuthorAvatar";
import type { StartBuildOrderAuthor } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatStartAuthors } from "@/lib/startAuthor";

type Props = {
  authors: StartBuildOrderAuthor[];
  /** Separador entre autores quando não há avatar (só texto). */
  separator?: string;
  className?: string;
};

export function StartAuthorsMeta({ authors, separator = " · ", className }: Props) {
  if (!authors.length) {
    return (
      <span className={className ?? "invisible select-none"} aria-hidden>
        —
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1.5", className)}
    >
      {authors.map((author, i) => (
        <Fragment key={`${author.name}-${i}`}>
          {i > 0 ? (
            <span className="shrink-0 self-center text-zinc-500" aria-hidden>
              {separator}
            </span>
          ) : null}
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
              <StartAuthorAvatar name={author.name} imageUrl={author.imageUrl} className="h-5 w-5" />
            </span>
            <span className="min-w-0 truncate leading-5">{author.name}</span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/** Texto plano para busca / aria quando só o nome importa. */
export function startAuthorsSearchText(authors: StartBuildOrderAuthor[]): string {
  return formatStartAuthors(authors, " ");
}
