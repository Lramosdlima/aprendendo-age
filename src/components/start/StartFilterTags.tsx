import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import type { StartFilterOption } from "@/lib/startFilterOptions";

type Props = {
  options: StartFilterOption[];
  value: string | null;
  onChange: (key: string | null) => void;
  className?: string;
};

function FilterChip({
  option,
  active,
  onClick,
}: {
  option: StartFilterOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="group/filter relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={option.label}
        title={option.label}
        className={cn(
          "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
          active
            ? "border-amber-500/55 ring-2 ring-amber-500/35 ring-offset-1 ring-offset-zinc-950"
            : "border-aom-border/80 hover:border-zinc-500",
        )}
        style={
          option.tint
            ? { backgroundColor: option.tint }
            : { backgroundColor: "rgba(39, 39, 42, 0.6)" }
        }
      >
        {option.iconSrc ? (
          <img
            src={option.iconSrc}
            alt=""
            className={cn(
              "h-6 w-6 object-contain",
              option.kind === "god" && "rounded-full",
            )}
            width={24}
            height={24}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="px-1 text-center text-[9px] font-semibold leading-tight text-zinc-300">
            {option.label.slice(0, 3)}
          </span>
        )}
      </button>

      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-700/80 bg-zinc-950/95 px-2 py-1 text-[10px] font-medium text-zinc-200 shadow-lg shadow-black/40",
          "opacity-0 transition duration-150 group-hover/filter:opacity-100 group-focus-within/filter:opacity-100",
        )}
      >
        {option.label}
      </span>
    </div>
  );
}

export function StartFilterTags({ options, value, onChange, className }: Props) {
  const { t } = useTranslation();

  if (options.length === 0) return null;

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
      <span className="sr-only">{t("pages.starts.filterTagLabel")}</span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/35",
          value === null
            ? "border-amber-500/50 bg-amber-500/15 text-amber-100"
            : "border-aom-border bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
        )}
      >
        {t("pages.starts.filterTagAll")}
      </button>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <FilterChip
            key={option.key}
            option={option}
            active={active}
            onClick={() => onChange(active ? null : option.key)}
          />
        );
      })}
    </div>
  );
}
