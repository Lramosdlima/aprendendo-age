import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";

export type PortraitHeaderItem = {
  key: string;
  to: string;
  nome: string;
  src?: string | null;
};

const cardClass =
  "group shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 shadow-sm shadow-black/30 transition hover:border-amber-400/50 hover:ring-1 hover:ring-amber-400/30";

const sizeImgClass: Record<"md" | "sm", string> = {
  md: "h-16 w-16 rounded-xl object-contain p-1.5 sm:h-20 sm:w-20",
  sm: "h-11 w-11 rounded-lg object-contain p-1 sm:h-12 sm:w-12",
};

const sizeFallbackClass: Record<"md" | "sm", string> = {
  md: "flex h-16 w-16 items-center justify-center rounded-xl p-1.5 text-center text-xs font-semibold leading-tight text-zinc-400 sm:h-20 sm:w-20",
  sm: "flex h-11 w-11 items-center justify-center rounded-lg p-1 text-center text-[10px] font-semibold leading-tight text-zinc-400 sm:h-12 sm:w-12",
};

type Props = {
  items: PortraitHeaderItem[];
  linkState: ListIndexLinkState;
  className?: string;
  /** `md` = cabeçalho; `sm` = `InfoRow` / vários ícones em fila. */
  size?: "md" | "sm";
  /** Alinhamento do grupo de retratos na célula do `InfoRow`. */
  justify?: "end" | "center" | "start";
};

export function PortraitHeaderActions({
  items,
  linkState,
  className,
  size = "md",
  justify = "end",
}: Props) {
  if (items.length === 0) return null;

  const justifyCls =
    justify === "center" ? "justify-center" : justify === "start" ? "justify-start" : "justify-end";
  const gapCls = size === "sm" ? "gap-1.5" : "gap-2";

  return (
    <div className={cn("flex w-full min-w-0 flex-row flex-wrap items-center", justifyCls, gapCls, className)}>
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          state={linkState}
          title={item.nome}
          aria-label={`Ver página de ${item.nome}`}
          className={cardClass}
        >
          {item.src ? (
            <img src={item.src} alt="" className={sizeImgClass[size]} />
          ) : (
            <div className={sizeFallbackClass[size]}>{item.nome.slice(0, 3)}</div>
          )}
        </Link>
      ))}
    </div>
  );
}
