import { NotionText } from "@/components/ui/NotionText";
import { cn } from "@/lib/cn";
import type { ResolvedEntityLink } from "@/lib/entityResolve";

type SpreadsheetHoverPreviewProps = {
  preview: ResolvedEntityLink | null;
  className?: string;
};

const previewImgClass =
  "h-11 w-11 shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 object-contain p-1 shadow-sm shadow-black/30 sm:h-12 sm:w-12";

/** Imagem + nome no canto superior (sem card); rótulo com tokens Notion. */
export function SpreadsheetHoverPreview({ preview, className }: SpreadsheetHoverPreviewProps) {
  if (!preview) return null;

  return (
    <div className={cn("flex max-w-[11rem] items-center gap-2 sm:max-w-[14rem]", className)} aria-live="polite">
      {preview.imageSrc ? (
        <img src={preview.imageSrc} alt="" className={previewImgClass} />
      ) : (
        <span
          className={cn(
            previewImgClass,
            "flex items-center justify-center text-xs font-semibold text-zinc-500",
          )}
        >
          {preview.label.slice(0, 3)}
        </span>
      )}
      <span className="min-w-0 truncate text-sm font-medium leading-tight text-zinc-200">
        <NotionText text={preview.label} />
      </span>
    </div>
  );
}
