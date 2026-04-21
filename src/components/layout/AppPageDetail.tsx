import type { ReactNode } from "react";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";

/** Mesmo fade do detalhe de mapa: opaco no topo, some para baixo. */
const HERO_BACKGROUND_MASK =
  "linear-gradient(to bottom, #000 0%, #000 18%, rgba(0,0,0,0.45) 42%, transparent 100%)";

export type AppPageDetailProps = {
  backTo: string;
  backLabel: string;
  title: ReactNode;
  description?: ReactNode;
  headerIconSrc?: string;
  descriptionTag?: boolean;
  actions?: ReactNode;
  /**
   * Imagem de fundo no topo do detalhe (URL em `/public`), com fade para baixo.
   * Compensa o padding do `<main>` para o fundo ir até ao topo da coluna.
   */
  heroBackgroundSrc?: string;
  /** Junta-se ao `PageHeader` (por omissão `mb-0` porque o bloco hero já tem `mb-8`). */
  pageHeaderClassName?: string;
  className?: string;
  /** Corpo da página: `Section`, listas, etc. */
  children: ReactNode;
};

/**
 * Esqueleto comum de página de detalhe: volta + cabeçalho + corpo opcionalmente com hero de fundo.
 */
export function AppPageDetail({
  backTo,
  backLabel,
  title,
  description,
  headerIconSrc,
  descriptionTag,
  actions,
  heroBackgroundSrc,
  pageHeaderClassName,
  className,
  children,
}: AppPageDetailProps) {
  return (
    <div className={cn(className)}>
      <div className="relative -mx-4 -mt-6 mb-8 md:-mx-10 md:-mt-10">
        {heroBackgroundSrc ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(46vh,400px)] overflow-hidden"
          >
            <img
              src={heroBackgroundSrc}
              alt=""
              className="h-full w-full object-cover object-center opacity-[0.22] saturate-125"
              style={{
                maskImage: HERO_BACKGROUND_MASK,
                WebkitMaskImage: HERO_BACKGROUND_MASK,
              }}
              draggable={false}
            />
          </div>
        ) : null}
        <div className="relative z-10 px-4 pt-6 md:px-10 md:pt-10">
          <BackLink to={backTo}>{backLabel}</BackLink>
          <PageHeader
            title={title}
            description={description}
            headerIconSrc={headerIconSrc}
            descriptionTag={descriptionTag}
            actions={actions}
            className={cn("mb-0", pageHeaderClassName)}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
