import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type SpreadsheetExpandableStackProps = {
  items: ReactNode[];
  className?: string;
  /** Rótulos do botão (recebe quantidade oculta). */
  moreLabel?: (hiddenCount: number) => string;
  lessLabel?: string;
};

/** Lista em célula com “Mostrar mais…” / “Mostrar menos…” (fechada por padrão). */
export function SpreadsheetExpandableStack({
  items,
  className,
  moreLabel = () => "Mostrar mais…",
  lessLabel = "Mostrar menos…",
}: SpreadsheetExpandableStackProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {expanded ? items : null}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-fit text-left text-xs text-amber-300/90 underline-offset-2 hover:text-amber-200 hover:underline"
      >
        {expanded ? lessLabel : moreLabel(items.length)}
      </button>
    </div>
  );
}
