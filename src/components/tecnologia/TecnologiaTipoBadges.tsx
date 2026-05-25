import { NotionText } from "@/components/ui/NotionText";
import { cn } from "@/lib/cn";
import {
  hasTecnologiaTipo,
  parseTecnologiaTipos,
  TECNOLOGIA_TIPO_DEFS,
} from "@/lib/tecnologiaTipo";

const badgeLayout =
  "inline-flex max-w-full shrink-0 cursor-default items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium leading-snug [word-break:break-word]";

type TecnologiaTipoBadgesProps = {
  tipo?: string | null;
  className?: string;
};

/**
 * Badges coloridas para Econômico / Ofensivo / Defensivo / Utilidade (legado Notion).
 * Tooltip nativo via `title` ao passar o mouse.
 */
export function TecnologiaTipoBadges({ tipo, className }: TecnologiaTipoBadgesProps) {
  const kinds = parseTecnologiaTipos(tipo);
  if (!kinds.length) {
    if (!tipo?.trim()) return null;
    return (
      <span className={cn("text-sm text-zinc-300", className)}>
        <NotionText text={tipo} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex max-w-full flex-wrap items-center gap-1", className)}>
      {kinds.map((kind) => {
        const def = TECNOLOGIA_TIPO_DEFS[kind];
        return (
          <span
            key={kind}
            title={def.description}
            className={cn(badgeLayout, def.shellClass)}
          >
            <span>{def.label}</span>
            <span aria-hidden>{def.emoji}</span>
          </span>
        );
      })}
    </span>
  );
}

export { hasTecnologiaTipo };
