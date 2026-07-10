import { Link } from "react-router-dom";

import { useTranslation } from "@/hooks/useTranslation";
import { useCatalog } from "@/hooks/useCatalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";

const HERO_BG = "/assets/others/AprendendoAge_BG.webp";

export function HomePage() {
  const { t } = useTranslation();
  const { deuses, mapas, startsBuildOrder, unidades } = useCatalog();

  const tiles = [
    {
      to: "/starts",
      label: t("pages.home.tiles.starts.label"),
      count: startsBuildOrder.length,
      hint: t("pages.home.tiles.starts.hint"),
    },
    {
      to: "/deuses",
      label: t("pages.home.tiles.gods.label"),
      count: deuses.length,
      hint: t("pages.home.tiles.gods.hint"),
    },
    {
      to: "/unidades",
      label: t("pages.home.tiles.units.label"),
      count: unidades.length,
      hint: t("pages.home.tiles.units.hint"),
    },
    {
      to: "/mapas",
      label: t("pages.home.tiles.maps.label"),
      count: mapas.length,
      hint: t("pages.home.tiles.maps.hint"),
    },
  ] as const;

  return (
    <div className="-mx-4 -mt-6 space-y-10 md:-mx-10 md:-mt-10">
      <section
        className="relative flex min-h-[76dvh] flex-col overflow-hidden border-b border-aom-border/80 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] sm:min-h-[82dvh] md:min-h-[88dvh]"
        aria-labelledby="home-hero-heading"
      >
        <div className="pointer-events-none absolute inset-0 bg-zinc-950" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-top bg-no-repeat brightness-[1.08] saturate-[1.03]"
          style={{ backgroundImage: `url(${HERO_BG})` }}
          role="presentation"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-zinc-950/68 via-zinc-950/48 to-zinc-950/28"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)]" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[min(92dvh,52rem)] bg-[linear-gradient(to_top,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0.88)_10%,rgba(9,9,11,0.78)_24%,rgba(9,9,11,0.62)_42%,rgba(9,9,11,0.48)_58%,rgba(9,9,11,0.28)_74%,rgba(9,9,11,0.12)_88%,transparent_100%)] sm:h-[min(90dvh,56rem)] md:h-[min(88dvh,60rem)]"
        />

        <div className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-16 pt-[max(4.5rem,env(safe-area-inset-top,0px)+2.5rem)] sm:pb-20 sm:pt-24 md:px-10 md:pb-28 md:pt-28">
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.2em] text-amber-400/90">
              {t("pages.home.subtitle")}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-zinc-300 sm:text-lg">
              {t("pages.home.hero")}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-zinc-300 sm:text-lg">
              {t("pages.home.startHere")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/trilha-de-aprendizado"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
              >
                {t("pages.home.trilhaCta")}
              </Link>
              <Link
                to="/starts"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-500/50 bg-zinc-950/40 px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-sm transition hover:border-amber-500/40 hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
              >
                {t("pages.home.buildOrdersCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pb-6 md:px-10">
        <PageHeader
          className="mb-6 sm:mb-8"
          title={t("pages.home.mainContent")}
          description={t("pages.home.mainContentDesc")}
        />

        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {tiles.map((tile) => (
            <li key={tile.to}>
              <Link
                to={tile.to}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-aom-border bg-aom-card/80 p-5 shadow-sm shadow-black/20 backdrop-blur-sm",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/45 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/25",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100 transition group-hover:text-amber-50">
                    {tile.label}
                  </span>
                  <span className="rounded-full bg-zinc-800/90 px-2 py-0.5 text-xs tabular-nums text-zinc-400 ring-1 ring-zinc-700/80">
                    {tile.count}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">
                  {tile.hint}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
