import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import {
  LIST_PAGE_STICKY_BOTTOM_VAR,
  SPREADSHEET_VIEWPORT_HEIGHT_VAR,
} from "@/lib/listPageStickyOffset";

type ListPageStickyHeaderProps = {
  children: ReactNode;
};

/**
 * Cabeçalho de listagem fixo ao rolar (título + filtros), com card escuro em largura total.
 * Abaixo do breakpoint `md`, `top-16` alinha sob a barra do AppShell; em `md` ou maior usa `top-0`.
 */
export function ListPageStickyHeader({ children }: ListPageStickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const threshold = 10;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sync = () => {
      const bottom = root.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty(LIST_PAGE_STICKY_BOTTOM_VAR, `${bottom}px`);
      document.documentElement.style.setProperty(
        SPREADSHEET_VIEWPORT_HEIGHT_VAR,
        `calc(100dvh - ${bottom}px - 1.25rem)`,
      );
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(root);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.documentElement.style.removeProperty(LIST_PAGE_STICKY_BOTTOM_VAR);
      document.documentElement.style.removeProperty(SPREADSHEET_VIEWPORT_HEIGHT_VAR);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "sticky top-16 z-20 mb-4 box-border w-[calc(100%+2rem)] max-w-none shrink-0",
        "-mx-4 md:top-0 md:w-[calc(100%+5rem)] md:-mx-10",
      )}
    >
      <div
        className={cn(
          "box-border w-full rounded-xl border border-aom-border bg-zinc-950/95 px-4 py-4 shadow-[0_8px_32px_-10px_rgba(0,0,0,0.75)] backdrop-blur-sm md:px-5 md:py-5",
          "transition-[box-shadow,ring-color] duration-200 ease-out",
          scrolled ? "shadow-[0_12px_40px_-8px_rgba(0,0,0,0.88)] ring-1 ring-zinc-800/80" : "ring-1 ring-aom-border/60",
        )}
      >
        <div className="flex w-full max-w-full flex-col items-start gap-8">{children}</div>
      </div>
    </div>
  );
}
