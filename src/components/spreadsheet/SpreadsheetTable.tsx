import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { SPREADSHEET_VIEWPORT_HEIGHT_VAR } from "@/lib/listPageStickyOffset";
import { resolveTokenIconSrc } from "@/lib/tokenIconUrl";

/** Primeira coluna fixa ao rolar horizontalmente (canto com thead sticky). */
export const spreadsheetStickyColThClass =
  "sticky left-0 top-0 z-20 bg-zinc-950 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.85)]";

/** Corpo: acompanha hover/seleção da linha (`group` no `SpreadsheetTr`). */
export const spreadsheetStickyColTdClass =
  "sticky left-0 z-[5] bg-zinc-950 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.7)] group-hover:bg-zinc-900 group-data-[selected]:bg-amber-950";

type SpreadsheetTableProps = {
  children: ReactNode;
  className?: string;
  tableClassName?: string;
};

/** Planilha com altura limitada à viewport e scroll vertical + horizontal internos. */
export function SpreadsheetTable({ children, className, tableClassName }: SpreadsheetTableProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col rounded-xl border border-aom-border bg-zinc-950/30",
        "px-4 py-4 md:px-5 md:py-5",
        className,
      )}
    >
      <div
        className="spreadsheet-scroll min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain"
        style={{ maxHeight: `var(${SPREADSHEET_VIEWPORT_HEIGHT_VAR}, min(60vh, 32rem))` }}
      >
        <table className={cn("w-max min-w-full border-collapse text-sm", tableClassName ?? "min-w-[960px]")}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function SpreadsheetHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 border-b border-aom-border bg-zinc-950 shadow-[0_1px_0_0] shadow-zinc-800/80">
      <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">{children}</tr>
    </thead>
  );
}

export function SpreadsheetTh({
  children,
  className,
  icon,
  stickyColumn,
}: {
  children: ReactNode;
  className?: string;
  /** Chave em `token_asset_map.json` (mesmo padrão do `InfoRow`). */
  icon?: string;
  /** Fixa a coluna à esquerda durante scroll horizontal. */
  stickyColumn?: boolean;
}) {
  const iconSrc = icon ? resolveTokenIconSrc(icon) : undefined;

  return (
    <th
      className={cn(
        "whitespace-nowrap bg-zinc-950 px-3 py-2.5 font-medium",
        stickyColumn && spreadsheetStickyColThClass,
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {iconSrc ? (
          <img src={iconSrc} alt="" aria-hidden className="size-4 shrink-0 object-contain opacity-90" />
        ) : null}
        <span>{children}</span>
      </span>
    </th>
  );
}

export function SpreadsheetBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-aom-border/80">{children}</tbody>;
}

export function SpreadsheetTr({
  children,
  className,
  onClick,
  selected,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Destaca linha no modo comparação; sincroniza fundo da coluna fixa. */
  selected?: boolean;
}) {
  return (
    <tr
      className={cn("group bg-zinc-950/40 transition-colors hover:bg-zinc-900/50", className)}
      data-selected={selected ? "" : undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function SpreadsheetTd({
  children,
  className,
  onClick,
  stickyColumn,
}: {
  children: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLTableCellElement>;
  stickyColumn?: boolean;
}) {
  return (
    <td
      className={cn(
        "align-top px-3 py-2.5 text-zinc-200",
        stickyColumn && spreadsheetStickyColTdClass,
        className,
      )}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

/** Lista vertical de chips na mesma célula (como no Notion). */
export function SpreadsheetCellStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-0.5", className)}>{children}</div>;
}
