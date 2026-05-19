import { cn } from "@/lib/cn";
import { formatSpreadsheetStatValue, spreadsheetStatRatio } from "@/lib/unidadeSpreadsheetVisual";

type SpreadsheetStatBarProps = {
  value: number;
  max: number;
  barClass?: string;
  className?: string;
};

/** Barra horizontal proporcional ao máximo de referência (ex.: PV ÷ 500). */
export function SpreadsheetStatBar({ value, max, barClass = "bg-red-500", className }: SpreadsheetStatBarProps) {
  const pct = spreadsheetStatRatio(value, max) * 100;

  return (
    <div className={cn("flex min-w-[5.5rem] items-center gap-2", className)}>
      <span className="w-9 shrink-0 text-right text-sm tabular-nums text-zinc-200">
        {formatSpreadsheetStatValue(value)}
      </span>
      <div
        className="h-2 min-w-[3.25rem] flex-1 overflow-hidden rounded-full bg-zinc-800/90 ring-1 ring-inset ring-zinc-700/50"
        title={`${formatSpreadsheetStatValue(value)} / ${max}`}
      >
        <div className={cn("h-full rounded-full transition-[width]", barClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
