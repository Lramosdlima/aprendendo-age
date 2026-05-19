import { SpreadsheetStatBar } from "@/components/spreadsheet/SpreadsheetStatBar";
import { SpreadsheetStatRing } from "@/components/spreadsheet/SpreadsheetStatRing";
import { formatArmorPercent } from "@/lib/armorDisplay";
import {
  formatSpreadsheetStatValue,
  UNIDADE_STAT_VISUAL,
  type SpreadsheetStatVisualSpec,
  type UnidadeSpreadsheetStatField,
} from "@/lib/unidadeSpreadsheetVisual";

function parseStatNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function renderVisual(n: number, spec: SpreadsheetStatVisualSpec) {
  if (spec.kind === "bar") {
    return <SpreadsheetStatBar value={n} max={spec.max} barClass={spec.barClass} />;
  }
  if (spec.kind === "percentRing") {
    return (
      <SpreadsheetStatRing
        value={n}
        max={spec.max}
        ringClass={spec.ringClass}
        label={formatArmorPercent(n)}
      />
    );
  }
  return <SpreadsheetStatRing value={n} max={spec.max} ringClass={spec.ringClass} />;
}

/** Célula numérica com barra ou anel conforme `UNIDADE_STAT_VISUAL`. */
export function SpreadsheetStatCell({
  field,
  value,
}: {
  field: UnidadeSpreadsheetStatField;
  value: unknown;
}) {
  const n = parseStatNumber(value);
  if (n == null) return <span className="text-zinc-500">—</span>;

  const spec = UNIDADE_STAT_VISUAL[field];
  if (!spec) {
    return <span className="text-sm tabular-nums text-zinc-200">{formatSpreadsheetStatValue(n)}</span>;
  }

  return renderVisual(n, spec);
}

/** Campo numérico opcional (dano, alcance, etc.) — só texto. */
export function SpreadsheetPlainNumCell({ value }: { value: unknown }) {
  const n = parseStatNumber(value);
  if (n == null) return <span className="text-zinc-500">—</span>;
  return <span className="text-sm tabular-nums text-zinc-200">{formatSpreadsheetStatValue(n)}</span>;
}
