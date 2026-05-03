import type { ReactNode } from "react";

/**
 * Mesma coluna de valor do {@link InfoRow} que o texto: alinha retratos à **esquerda**,
 * com altura mínima estável quando há vários ícones em fila (`flex-wrap`).
 */
export function InfoRowPortraitCluster({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[2.75rem] w-full min-w-0 flex-wrap items-center justify-start gap-1.5 sm:min-h-[3rem] sm:gap-2">
      {children}
    </div>
  );
}

/** Retratos quando existem; caso contrário o fallback (ex.: só `NotionText`). */
export function InfoRowPortraitOrText({ portraits, textFallback }: { portraits: ReactNode; textFallback: ReactNode }) {
  return <InfoRowPortraitCluster>{portraits != null ? portraits : textFallback}</InfoRowPortraitCluster>;
}
