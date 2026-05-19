import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Container da planilha — largura total, sem margem extra inferior (scroll fica no card). */
export function SpreadsheetPageWidth({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full min-w-0 pb-4", className)}>{children}</div>;
}
