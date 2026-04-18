import type { ReactNode } from "react";

import { NotionText } from "@/components/ui/NotionText";

type MetaNotionLineProps = {
  /** Partes concatenadas com ` · `; strings vazias são ignoradas. */
  parts: (string | undefined | null)[];
};

/** Meta de card com `NotionText` (emojis de tipo + panteão → ícones). */
export function MetaNotionLine({ parts }: MetaNotionLineProps): ReactNode {
  const items = parts.filter((p): p is string => typeof p === "string" && p.length > 0);
  if (items.length === 0) return null;
  return (
    <>
      {items.map((s, i) => (
        <span key={`${i}-${s.slice(0, 24)}`}>
          {i > 0 ? " · " : null}
          <NotionText text={s} />
        </span>
      ))}
    </>
  );
}
