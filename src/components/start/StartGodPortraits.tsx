import { DeusPortraitHeaderActions } from "@/components/deus/DeusPortraitHeaderActions";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import { resolveStartGodPortraitItems } from "@/lib/startGodPortraits";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";

type Props = {
  names: string[];
  /** Quando definido, cada retrato é um link para o deus (ex.: cabeçalho do detalhe). */
  linkState?: ListIndexLinkState;
  className?: string;
};

/**
 * Retratos quadrados dos deuses do start; nome só no hover (`title`).
 * Sem `linkState`, renderiza estático (uso dentro de `EntityCard`, que já é um link).
 */
export function StartGodPortraits({ names, linkState, className }: Props) {
  const items = resolveStartGodPortraitItems(names);
  if (items.length === 0) return null;

  if (linkState) {
    return (
      <DeusPortraitHeaderActions
        items={items}
        linkState={linkState}
        className={className}
        size="xs"
        justify="start"
      />
    );
  }

  return (
    <PortraitHeaderActions
      items={items.map((item) => ({
        key: item.key,
        to: `/deuses/${item.slug}`,
        nome: item.nome,
        src: item.src,
      }))}
      linked={false}
      hoverHighlight={false}
      className={className}
      size="xs"
      justify="start"
    />
  );
}
