import { cn } from "@/lib/cn";
import type { ListViewMode } from "@/lib/listViewMode";

type ListViewModeToggleProps = {
  mode: ListViewMode;
  onChange: (mode: ListViewMode) => void;
  className?: string;
  id?: string;
};

export function ListViewModeToggle({ mode, onChange, className, id = "list-view-mode" }: ListViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className={cn(
        "inline-flex w-fit shrink-0 self-start rounded-lg border border-aom-border bg-zinc-900/50 p-0.5",
        className,
      )}
    >
      <button
        type="button"
        id={`${id}-grade`}
        aria-pressed={mode === "grade"}
        onClick={() => onChange("grade")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition",
          mode === "grade"
            ? "bg-amber-500/20 text-amber-100 shadow-sm"
            : "text-zinc-400 hover:text-zinc-200",
        )}
      >
        Grade
      </button>
      <button
        type="button"
        id={`${id}-planilha`}
        aria-pressed={mode === "planilha"}
        onClick={() => onChange("planilha")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition",
          mode === "planilha"
            ? "bg-amber-500/20 text-amber-100 shadow-sm"
            : "text-zinc-400 hover:text-zinc-200",
        )}
      >
        Planilha
      </button>
    </div>
  );
}
