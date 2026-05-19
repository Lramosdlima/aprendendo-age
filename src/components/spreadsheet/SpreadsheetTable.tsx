import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SpreadsheetTableProps = {
  children: ReactNode;
  className?: string;
};

/** Sem `overflow-x` no ancestral — evita quebrar `position: sticky` do thead no scroll da página. */
export function SpreadsheetTable({ children, className }: SpreadsheetTableProps) {
  return (
    <div className={cn("min-w-0 rounded-xl border border-aom-border", className)}>
      <table className="w-full min-w-[960px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function SpreadsheetHead({ children }: { children: ReactNode }) {
  return (
    <thead
      className={cn(
        "sticky z-[15] border-b border-aom-border bg-zinc-950/95 shadow-[0_1px_0_0] shadow-zinc-800/80 backdrop-blur-md",
        "top-[var(--list-page-sticky-bottom,11rem)]",
      )}
    >
      <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">{children}</tr>
    </thead>
  );
}

export function SpreadsheetTh({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap bg-zinc-950/95 px-3 py-2.5 font-medium", className)}>{children}</th>;
}

export function SpreadsheetBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-aom-border/80">{children}</tbody>;
}

export function SpreadsheetTr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("bg-zinc-950/40 transition-colors hover:bg-zinc-900/50", className)}>{children}</tr>;
}

export function SpreadsheetTd({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("align-top px-3 py-2 text-zinc-200", className)}>{children}</td>;
}

/** Lista vertical de chips na mesma célula (como no Notion). */
export function SpreadsheetCellStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-0.5", className)}>{children}</div>;
}
