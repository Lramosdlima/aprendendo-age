import { Link } from "react-router-dom";

import { deuses, mapas, startsBuildOrder, unidades } from "@/data/catalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";

const HERO_BG = "/assets/others/AprendendoAge_BG.png";

const tiles = [
  {
    to: "/starts",
    label: "Starts (Build Orders)",
    count: startsBuildOrder.length,
    hint: "Build Orders ou Starts.",
  },
  {
    to: "/deuses",
    label: "Deuses",
    count: deuses.length,
    hint: "Árvore tecnológica e bônus.",
  },
  {
    to: "/unidades",
    label: "Unidades",
    count: unidades.length,
    hint: "Militares e mitológicas.",
  },
  {
    to: "/mapas",
    label: "Mapas",
    count: mapas.length,
    hint: "Ranqueada, origem e tipo.",
  },
] as const;

export function HomePage() {
  return (
    <div className="-mx-4 -mt-6 space-y-10 md:-mx-10 md:-mt-10">
      <section
        className="relative overflow-hidden border-b border-aom-border/80 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)]"
        aria-labelledby="home-hero-heading"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
          role="presentation"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-zinc-950/92 via-zinc-950/78 to-zinc-950/55"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)]" aria-hidden />

        <div className="relative px-4 py-12 sm:py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.2em] text-amber-400/90">
              Age of Mythology
            </p>
            <h1
              id="home-hero-heading"
              className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-amber-50 sm:text-5xl"
            >
              Aprendendo Age
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-zinc-300 sm:text-lg">
              Fala galeeera! Aqui é o Scooby Maníaco — um cantinho feito com carinho para a comunidade: listas, dicas e trilhas para evoluir no jogo! Comece por aqui:
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/trilha-de-aprendizado"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
              >
                Trilha de aprendizado
              </Link>
              <Link
                to="/starts"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-500/50 bg-zinc-950/40 px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-sm transition hover:border-amber-500/40 hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
              >
                Ver build orders
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pb-6 md:px-10">
        <PageHeader
          className="mb-6 sm:mb-8"
          title="Principais Conteúdos"
          description="Esses são os conteúdos que eu indico para vocês!"
        />

        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {tiles.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-aom-border bg-aom-card/80 p-5 shadow-sm shadow-black/20 backdrop-blur-sm",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/45 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/25",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100 transition group-hover:text-amber-50">
                    {t.label}
                  </span>
                  <span className="rounded-full bg-zinc-800/90 px-2 py-0.5 text-xs tabular-nums text-zinc-400 ring-1 ring-zinc-700/80">
                    {t.count}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">
                  {t.hint}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
