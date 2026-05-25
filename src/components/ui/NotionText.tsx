import { cn } from "@/lib/cn";
import { parseStartMiniMarkup } from "@/lib/startMiniMarkup";

type NotionTextProps = {
  text: string;
  className?: string;
};

/**
 * Texto exportado do Notion: `:token:` viram ícones; `<highlight-*>` usam as cores do legado (starts).
 */
export function NotionText({ text, className }: NotionTextProps) {
  if (!text) return null;
  return <span className={cn("notion-rich-text", className)}>{parseStartMiniMarkup(text)}</span>;
}
