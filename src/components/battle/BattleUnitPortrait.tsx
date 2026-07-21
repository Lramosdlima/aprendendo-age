import { cn } from "@/lib/cn";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";

type Props = {
  nome: string;
  icon?: string | null;
  selected?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
};

const SIZE = {
  sm: "size-14",
  md: "size-20",
  lg: "size-28 sm:size-32",
} as const;

export function BattleUnitPortrait({
  nome,
  icon,
  selected,
  disabled,
  size = "md",
  onClick,
  className,
}: Props) {
  const src = getUnidadeAssetUrl({ icon });

  const body = (
    <>
      {src ? (
        <img src={src} alt="" aria-hidden className="size-full object-contain p-1.5" />
      ) : (
        <span className="px-1 text-center text-[10px] leading-tight text-zinc-400">{nome}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        title={nome}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border bg-zinc-900/80 shadow-md shadow-black/40 transition",
          SIZE[size],
          selected
            ? "border-amber-400 ring-2 ring-amber-400/40"
            : "border-aom-border hover:border-amber-400/60 hover:bg-zinc-900",
          disabled && "cursor-not-allowed opacity-40 hover:border-aom-border",
          className,
        )}
      >
        {body}
        <span className="sr-only">{nome}</span>
      </button>
    );
  }

  return (
    <div
      title={nome}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl border border-aom-border bg-zinc-900/80 shadow-md shadow-black/40",
        SIZE[size],
        className,
      )}
    >
      {body}
    </div>
  );
}
