import { Link } from "react-router-dom";

import {
  aldeoes,
  construcoes,
  deuses,
  eras,
  godpowers,
  mapas,
  panteoes,
  startsBuildOrder,
  tecnologias,
  unidades,
} from "@/data/catalog";
import { AppBanner } from "@/components/ui/AppBanner";
import { PageHeader } from "@/components/ui/PageHeader";

const tiles = [
    {
    to: "/starts",
    label: "Starts (Build Orders)",
    count: startsBuildOrder.length,
    hint: "Build Orders ou Starts.",
  },
  {
    to: "/panteoes",
    label: "Panteões",
    count: panteoes.length,
    hint: "Civilizações e visão geral.",
  },
  {
    to: "/deuses",
    label: "Deuses",
    count: deuses.length,
    hint: "Árvore tecnológica e bônus.",
  },
  {
    to: "/eras",
    label: "Eras",
    count: eras.length,
    hint: "Custos e tempos de avanço.",
  },
  {
    to: "/poderes",
    label: "Poderes divinos",
    count: godpowers.length,
    hint: "Mitos, cooldowns e efeitos.",
  },
  {
    to: "/construcoes",
    label: "Construções",
    count: construcoes.length,
    hint: "Edifícios e estatísticas.",
  },
  {
    to: "/unidades",
    label: "Unidades",
    count: unidades.length,
    hint: "Militares e mitológicas.",
  },
  {
    to: "/aldeoes",
    label: "Aldeões",
    count: aldeoes.length,
    hint: "Coleta e trabalhadores.",
  },
  {
    to: "/mapas",
    label: "Mapas",
    count: mapas.length,
    hint: "Ranqueada, origem e tipo.",
  },
  {
    to: "/tecnologias",
    label: "Tecnologias",
    count: tecnologias.length,
    hint: "Melhorias e bônus.",
  },
] as const;

export function HomePage() {
  return (
    <div>
      <PageHeader
        title="Aprendendo Age"
        description="Fala galeeera!! Aqui é o Scooby Maníaco e sejam bem vindos ao Aprendendo Age! Um site feito com muito carinho para a comunidade de Age of Mythology!"
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.to}>
            <Link
              to={t.to}
              className="flex h-full flex-col rounded-2xl border border-aom-border bg-aom-card/70 p-5 transition-colors hover:border-amber-500/40 hover:bg-zinc-900/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100">
                  {t.label}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs tabular-nums text-zinc-400">
                  {t.count}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm text-zinc-400">{t.hint}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
