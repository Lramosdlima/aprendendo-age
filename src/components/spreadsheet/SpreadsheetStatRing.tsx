import { cn } from "@/lib/cn";
import { formatSpreadsheetStatValue, spreadsheetStatRatio } from "@/lib/unidadeSpreadsheetVisual";

const R = 10;
const C = 2 * Math.PI * R;

type SpreadsheetStatRingProps = {
  value: number;
  max: number;
  ringClass?: string;
  /** Rótulo exibido ao lado do anel (padrão: valor numérico). */
  label?: string;
  className?: string;
};

/** Anel circular proporcional ao máximo de referência (ex.: Comida ÷ 100). */
export function SpreadsheetStatRing({
  value,
  max,
  ringClass = "stroke-amber-400",
  label,
  className,
}: SpreadsheetStatRingProps) {
  const ratio = spreadsheetStatRatio(value, max);
  const offset = C * (1 - ratio);
  const display = label ?? formatSpreadsheetStatValue(value);

  return (
    <div
      className={cn("flex min-w-[4.75rem] items-center gap-2", className)}
      title={`${display} / ${max}`}
    >
      <span className="min-w-[1.75rem] shrink-0 text-sm tabular-nums text-zinc-200">{display}</span>
      <svg width="26" height="26" viewBox="0 0 28 28" className="shrink-0 -rotate-90" aria-hidden>
        <circle cx="14" cy="14" r={R} className="stroke-zinc-800" strokeWidth="3" fill="none" />
        <circle
          cx="14"
          cy="14"
          r={R}
          className={cn(ringClass, "fill-none")}
          strokeWidth="3"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
