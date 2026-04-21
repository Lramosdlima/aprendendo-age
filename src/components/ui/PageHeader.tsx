import type { ReactNode } from "react";

import { AppTag } from "@/components/ui/AppTag";
import { cn } from "@/lib/cn";

type PageHeaderBlockProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Mesmo asset da marca d’água: ícone ao lado do título/descrição. */
  headerIconSrc?: string;
  /** Se true, a descrição é mostrada dentro de {@link AppTag} (comportamento análogo a `subtitleTag` em EntityCard). */
  descriptionTag?: boolean;
  /** `end`: ícone à direita e texto alinhado à direita (ex.: coluna numa comparação). */
  align?: "start" | "end";
  className?: string;
  /** Classes extra no `<h1>` (ex.: tamanho responsivo em páginas de comparação). */
  titleClassName?: string;
};

export function PageHeaderBlock({
  title,
  description,
  headerIconSrc,
  descriptionTag = false,
  align = "start",
  className,
  titleClassName,
}: PageHeaderBlockProps) {
  const icon =
    headerIconSrc ? (
      <img
        src={headerIconSrc}
        alt=""
        aria-hidden
        className="h-20 w-20 shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 object-contain p-1.5 shadow-sm shadow-black/30"
      />
    ) : null;

  const hasDescription =
    description != null && (typeof description !== "string" || description !== "");
  const useDescriptionTag = descriptionTag && hasDescription;
  const descriptionBody = useDescriptionTag ? (
    <AppTag className="mt-2 align-top leading-snug [word-break:break-word] normal-case">{description}</AppTag>
  ) : hasDescription ? (
    typeof description === "string" ? (
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</p>
    ) : (
      <div className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</div>
    )
  ) : null;

  const isEnd = align === "end";

  const inner = (
    <div
      className={cn(
        "inline-flex max-w-full min-w-0 items-start gap-4",
        isEnd ? "flex-row-reverse" : false,
        !isEnd ? className : false,
      )}
    >
      {icon}
      <div className={cn("min-w-0", isEnd && "text-right")}>
        <h1
          className={cn(
            "font-[family-name:var(--font-display)] font-semibold tracking-wide text-amber-100",
            titleClassName ?? "text-3xl",
          )}
        >
          {title}
        </h1>
        {descriptionBody}
      </div>
    </div>
  );

  if (isEnd) {
    return <div className={cn("flex min-w-0 justify-end", className)}>{inner}</div>;
  }

  return inner;
}

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Mesmo asset da marca d’água: ícone à esquerda do título/descrição. */
  headerIconSrc?: string;
  /** Se true, a descrição é mostrada dentro de `AppTag`. */
  descriptionTag?: boolean;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, headerIconSrc, descriptionTag, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <PageHeaderBlock title={title} description={description} headerIconSrc={headerIconSrc} descriptionTag={descriptionTag} />
      {actions ? <div className="shrink-0 sm:ml-auto">{actions}</div> : null}
    </header>
  );
}
