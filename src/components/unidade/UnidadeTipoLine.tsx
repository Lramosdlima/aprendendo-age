import { Fragment } from "react";

import { NotionText } from "@/components/ui/NotionText";
import { cn } from "@/lib/cn";
import {
  hasTipoContent,
  tipoItemToNotionText,
  tipoItemsToNotionText,
  tipoTypeTextClass,
  type UnidadeTipoItem,
} from "@/lib/unidadeTipo";

type UnidadeTipoLineProps = {
  tipo: UnidadeTipoItem[] | null | undefined;
  /** Se true, aplica cores por categoria (lista de unidades, etc.). */
  colored?: boolean;
  className?: string;
};

/**
 * Renderiza `tipo` como antes (ícones inline), com separador `, ` e cores opcionais por categoria.
 */
export function UnidadeTipoLine({ tipo, colored = false, className }: UnidadeTipoLineProps) {
  if (!hasTipoContent(tipo)) return null;

  if (!colored) {
    return <NotionText text={tipoItemsToNotionText(tipo)} className={cn("inline", className)} />;
  }

  return (
    <span className={cn("inline", className)}>
      {tipo!.map((it, i) => (
        <Fragment key={i}>
          {i > 0 ? <span className="text-zinc-500">, </span> : null}
          <span className={tipoTypeTextClass(it.type)}>
            <NotionText text={tipoItemToNotionText(it)} className="inline" />
          </span>
        </Fragment>
      ))}
    </span>
  );
}
