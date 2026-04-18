import type { ReactNode } from "react";

type InfoRowProps = {
  label: string;
  children: ReactNode;
};

export function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="grid gap-1 border-b border-zinc-800/80 py-3 last:border-0 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start sm:gap-6">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="min-w-0 text-sm text-zinc-200">{children}</div>
    </div>
  );
}
