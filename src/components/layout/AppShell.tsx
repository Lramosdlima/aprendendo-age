import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/cn";

const nav = [
  { to: "/", label: "Início", end: true },
  { to: "/starts", label: "Starts (BO)" },
  { to: "/panteoes", label: "Panteões" },
  { to: "/deuses", label: "Deuses" },
  { to: "/eras", label: "Eras" },
  { to: "/poderes", label: "Poderes divinos" },
  { to: "/construcoes", label: "Construções" },
  { to: "/unidades", label: "Unidades" },
  { to: "/aldeoes", label: "Aldeões" },
  { to: "/mapas", label: "Mapas" },
  { to: "/tecnologias", label: "Tecnologias" },
] as const;

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "block rounded-lg px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35"
      : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white",
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-aom-border shrink-0 border-b bg-zinc-950/80 md:w-56 md:border-r md:border-b-0 md:py-6">
        <div className="px-4 pb-3 pt-4 md:px-5 md:pb-6 md:pt-0">
          <div className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wide text-amber-200">
            Aprendendo Age
          </div>
          <p className="mt-1 text-xs text-zinc-500">por Scooby Maníaco</p>
        </div>
        <nav className="flex flex-wrap gap-1 px-2 pb-3 md:flex-col md:px-3 md:pb-0">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={"end" in item ? item.end : false} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
