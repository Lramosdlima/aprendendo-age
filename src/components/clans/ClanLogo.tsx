import { cn } from "@/lib/cn";

function logoInitials(tag: string) {
  const t = tag.replace(/[^a-zA-Z0-9]/g, "");
  if (t.length <= 2) return t.toUpperCase() || "?";
  return (t.slice(0, 1) + t.slice(-1)).toUpperCase();
}

type ClanLogoProps = {
  tag: string;
  logoSrc?: string;
  logoComingSoonLabel?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  hero: "h-28 w-28 sm:h-36 sm:w-36",
} as const;

export function ClanLogo({
  tag,
  logoSrc,
  logoComingSoonLabel,
  size = "sm",
  className,
}: ClanLogoProps) {
  const box = SIZE_CLASS[size];

  if (logoSrc) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl border border-zinc-600/80 bg-zinc-950 shadow-inner shadow-black/40",
          box,
          className,
        )}
        aria-hidden
      >
        <img src={logoSrc} alt="" className="absolute inset-0 size-full scale-150 object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border border-dashed border-zinc-600/90 bg-zinc-950/80 font-mono font-semibold uppercase tracking-tight text-zinc-500 shadow-inner shadow-black/30",
        size === "hero" ? "text-lg" : "text-xs",
        box,
        className,
      )}
      title={logoComingSoonLabel}
      aria-hidden
    >
      {logoInitials(tag)}
    </div>
  );
}
