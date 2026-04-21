import { Fragment } from "react";

import { NotionText } from "@/components/ui/NotionText";
import { cn } from "@/lib/cn";
import {
  hasTipoContent,
  tipoItemToNotionText,
  tipoItemsToNotionText,
  tipoTypeTagShellClass,
  tipoTypeTextClass,
  type UnidadeTipoItem,
} from "@/lib/unidadeTipo";

type UnidadeTipoLineProps = {
  tipo: UnidadeTipoItem[] | null | undefined;
  /** Se true, aplica cores por categoria (lista de unidades, etc.). */
  colored?: boolean;
  /**
   * Com `colored`: cada tipo → cápsula com borda/fundo da categoria (uma por item quando `auto`).
   * `none` desativa a cápsula (só cor de texto, separado por vírgula).
   */
  shell?: "auto" | "none";
  className?: string;
};

const tipoTagShellLayoutClass =
  "inline-flex max-w-full shrink-0 items-center rounded border px-1.5 py-0.5 align-top text-sm font-medium normal-case leading-snug [word-break:break-word]";

/**
 * Renderiza `tipo` com ícones inline; com `colored` + `shell="auto"`, uma cápsula por tipo.
 */
export function UnidadeTipoLine({
  tipo,
  colored = false,
  shell = "auto",
  className,
}: UnidadeTipoLineProps) {
  if (!hasTipoContent(tipo)) return null;

  const items = tipo!;

  if (!colored) {
    return <NotionText text={tipoItemsToNotionText(tipo)} className={cn("inline", className)} />;
  }

  if (shell === "auto") {
    if (items.length === 1) {
      const it = items[0]!;
      return (
        <span className={cn(tipoTagShellLayoutClass, tipoTypeTagShellClass(it.type), className)}>
          <NotionText text={tipoItemToNotionText(it)} className="inline" />
        </span>
      );
    }

    return (
      <span
        className={cn(
          "inline-flex max-w-full flex-wrap items-center gap-1 align-top",
          className,
        )}
      >
        {items.map((it, i) => (
          <span
            key={`${it.type}-${it.icon ?? ""}-${i}`}
            className={cn(tipoTagShellLayoutClass, tipoTypeTagShellClass(it.type))}
          >
            <NotionText text={tipoItemToNotionText(it)} className="inline" />
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={cn("inline", className)}>
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 ? <span className="text-amber-600/85">, </span> : null}
          <span className={tipoTypeTextClass(it.type)}>
            <NotionText text={tipoItemToNotionText(it)} className="inline" />
          </span>
        </Fragment>
      ))}
    </span>
  );
}
