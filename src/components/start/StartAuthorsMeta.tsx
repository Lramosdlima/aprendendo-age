import { StartAuthorAvatar } from "@/components/start/StartAuthorAvatar";
import type { StartBuildOrderAuthor } from "@/data/catalog";
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
    <span className={className ?? "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1"}>
      {authors.map((author, i) => (
        <span key={`${author.name}-${i}`} className="inline-flex min-w-0 items-center gap-1.5">
          {i > 0 ? <span className="shrink-0 text-zinc-500" aria-hidden>{separator.trim()}</span> : null}
          <StartAuthorAvatar name={author.name} imageUrl={author.imageUrl} />
          <span className="min-w-0 truncate">{author.name}</span>
        </span>
      ))}
    </span>
  );
}

/** Texto plano para busca / aria quando só o nome importa. */
export function startAuthorsSearchText(authors: StartBuildOrderAuthor[]): string {
  return formatStartAuthors(authors, " ");
}
