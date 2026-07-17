import type { ReactNode } from "react";

import { NotionText } from "@/components/ui/NotionText";
import type { DeusExplicacaoBloco } from "@/data/catalog";
import { resolveTokenIconSrc } from "@/lib/tokenIconUrl";

export type EntityCardPreviewStat = {
  icon?: string;
  label: string;
  value: ReactNode;
};

export function EntityCardPreviewStats({ items }: { items: EntityCardPreviewStat[] }) {
  const visibleItems = items.filter((item) => item.value != null && item.value !== "");
  if (!visibleItems.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {visibleItems.map((item, index) => {
        const iconSrc = item.icon ? resolveTokenIconSrc(item.icon) : undefined;
        return (
          <div
            key={`${item.label}-${index}`}
            title={item.label}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-zinc-800/90 bg-zinc-900/65 px-2.5 py-2"
          >
            {iconSrc ? (
              <img src={iconSrc} alt="" aria-hidden className="size-5 shrink-0 object-contain" />
            ) : (
              <span className="max-w-16 shrink-0 truncate text-[9px] font-medium uppercase tracking-wide text-zinc-500">
                {item.label}
              </span>
            )}
            <span className="min-w-0 truncate text-xs font-semibold tabular-nums text-zinc-100">
              {item.value}
            </span>
            <span className="sr-only">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function EntityCardPreviewText({
  lines,
  maxLines = 4,
}: {
  lines: string[];
  maxLines?: number;
}) {
  const visible = lines.filter(Boolean).slice(0, maxLines);
  if (!visible.length) return null;

  return (
    <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
      {visible.map((line, index) => (
        <p key={index} className="line-clamp-3">
          <NotionText text={line} />
        </p>
      ))}
      {lines.length > visible.length ? (
        <p className="text-[10px] font-medium text-zinc-500">+{lines.length - visible.length}</p>
      ) : null}
    </div>
  );
}

export function EntityCardPreviewDescription({ text }: { text: string }) {
  return (
    <p className="line-clamp-6 text-xs leading-relaxed text-zinc-300">
      <NotionText text={text} />
    </p>
  );
}

export function EntityCardPreviewGodBonuses({ blocks }: { blocks: DeusExplicacaoBloco[] }) {
  const lines = blocks.flatMap((block) => {
    if (block.tipo === "lista") return block.itens;
    return [block.texto];
  });

  return <EntityCardPreviewText lines={lines} maxLines={6} />;
}
