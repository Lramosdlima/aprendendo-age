import type { ListIndexLinkState } from "@/lib/listIndexReturnState";
import { PortraitHeaderActions, type PortraitHeaderItem } from "@/components/ui/PortraitHeaderActions";

export type DeusPortraitHeaderItem = {
  key: string;
  slug: string;
  nome: string;
  src: string | null | undefined;
};

type Props = {
  items: DeusPortraitHeaderItem[];
  linkState: ListIndexLinkState;
  className?: string;
  size?: "md" | "sm";
  justify?: "end" | "center" | "start";
};

export function DeusPortraitHeaderActions({ items, linkState, className, size, justify }: Props) {
  const mapped: PortraitHeaderItem[] = items.map((item) => ({
    key: item.key,
    to: `/deuses/${item.slug}`,
    nome: item.nome,
    src: item.src,
  }));
  return (
    <PortraitHeaderActions
      items={mapped}
      linkState={linkState}
      className={className}
      size={size}
      justify={justify}
    />
  );
}
