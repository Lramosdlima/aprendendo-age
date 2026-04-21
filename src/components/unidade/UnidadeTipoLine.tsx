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
   * Com `colored`: um único tipo → cápsula com borda/fundo da categoria; vários → só texto colorido
   * (o `AppTag` cinza fica no pai, se existir). `none` desativa a cápsula mesmo com um tipo.
   */
  shell?: "auto" | "none";
  className?: string;
};

/**
 * Renderiza `tipo` como antes (ícones inline), com separador `, ` e cores opcionais por categoria.
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

  const useShell = shell === "auto" && items.length === 1;

  if (useShell) {
    const it = items[0]!;
    return (
      <span
        className={cn(
          "inline-flex max-w-full shrink-0 items-center rounded border px-1.5 py-0.5 align-top text-sm font-medium normal-case leading-snug [word-break:break-word]",
          tipoTypeTagShellClass(it.type),
          className,
        )}
      >
        <NotionText text={tipoItemToNotionText(it)} className="inline" />
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
