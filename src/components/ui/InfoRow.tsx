import type { ReactNode } from "react";

import { resolveTokenIconSrc } from "@/lib/tokenIconUrl";

type InfoRowProps = {
  label: string;
  children: ReactNode;
  /** Chave em `token_asset_map.json` (ex.: `foodaom`) ou caminho `/assets/...`. */
  icon?: string;
};

export function InfoRow({ label, children, icon }: InfoRowProps) {
  const iconSrc = icon ? resolveTokenIconSrc(icon) : undefined;

  return (
    <div className="grid gap-1 border-b border-zinc-800/80 py-3 last:border-0 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start sm:gap-6">
      <div className="flex min-w-0 items-center gap-2">
        {iconSrc ? (
          <img src={iconSrc} alt="" aria-hidden className="size-5 shrink-0 object-contain opacity-90" />
        ) : null}
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      </div>
      <div className="min-w-0 text-sm text-zinc-200">{children}</div>
    </div>
  );
}
