import { Link } from "react-router-dom";

import { NotionText } from "@/components/ui/NotionText";
import { cn } from "@/lib/cn";
import type { ResolvedEntityLink } from "@/lib/entityResolve";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";

type SpreadsheetRefChipProps = {
  link: ResolvedEntityLink;
  linkState: ListIndexLinkState;
  onPreview?: (link: ResolvedEntityLink) => void;
  className?: string;
};

/** Célula compacta estilo Notion: ícone + nome, link para o detalhe. */
export function SpreadsheetRefChip({ link, linkState, onPreview, className }: SpreadsheetRefChipProps) {
  return (
    <Link
      to={link.to}
      state={linkState}
      title={link.label}
      onMouseEnter={() => onPreview?.(link)}
      onFocus={() => onPreview?.(link)}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md px-1 py-0.5 text-left text-sm text-amber-200/95",
        "underline-offset-2 hover:bg-amber-500/10 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/40",
        className,
      )}
    >
      {link.imageSrc ? (
        <img src={link.imageSrc} alt="" className="h-5 w-5 shrink-0 rounded object-contain" />
      ) : null}
      <span className="min-w-0 truncate">
        <NotionText text={link.label} />
      </span>
    </Link>
  );
}
