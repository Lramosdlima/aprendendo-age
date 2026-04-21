import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type ListPageStickyHeaderProps = {
  children: ReactNode;
};

/**
 * Cabeçalho de listagem fixo ao rolar (título + filtros), com fundo escuro e sombra
 * após pequeno scroll — mesmo padrão em Unidades, Deuses, etc.
 * Abaixo do breakpoint `md`, `top-16` alinha sob a barra do AppShell (hambúrguer); em `md` ou maior usa `top-0`.
 */
export function ListPageStickyHeader({ children }: ListPageStickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const threshold = 10;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-16 z-20 mb-8 -mx-4 px-4 py-2.5 md:top-0 md:-mx-10 md:px-10",
        "border-b border-transparent transition-[background-color,box-shadow,backdrop-filter,border-color] duration-200 ease-out",
        scrolled
          ? "border-zinc-800/90 bg-zinc-950/93 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.82)] backdrop-blur-md ring-1 ring-black/45"
          : "bg-transparent shadow-none ring-0",
      )}
    >
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
