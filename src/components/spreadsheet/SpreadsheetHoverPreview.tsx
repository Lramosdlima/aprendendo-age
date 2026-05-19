import { cn } from "@/lib/cn";
import type { ResolvedEntityLink } from "@/lib/entityResolve";

type SpreadsheetHoverPreviewProps = {
  preview: ResolvedEntityLink | null;
  className?: string;
};

/** Imagem + nome no canto superior (sem card); vazio quando não há foco. */
export function SpreadsheetHoverPreview({ preview, className }: SpreadsheetHoverPreviewProps) {
  if (!preview) return null;

  return (
    <div className={cn("flex max-w-[11rem] items-center gap-2 sm:max-w-[14rem]", className)} aria-live="polite">
      {preview.imageSrc ? (
        <img src={preview.imageSrc} alt="" className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12" />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center text-xs font-semibold text-zinc-500 sm:h-12 sm:w-12">
          {preview.label.slice(0, 3)}
        </span>
      )}
      <span className="min-w-0 truncate text-sm font-medium leading-tight text-zinc-200">{preview.label}</span>
    </div>
  );
}
