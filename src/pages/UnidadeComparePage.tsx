import { useParams } from "react-router-dom";

import { UnidadeCombateBody, UnidadeCustoBody, UnidadeVisaoGeralBody } from "@/components/unidade/UnidadeSectionBodies";
import { BackLink } from "@/components/ui/BackLink";
import { Section } from "@/components/ui/Section";
import { unidadeById } from "@/data/catalog";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";

export function UnidadeComparePage() {
  const { idA, idB } = useParams();
  const u1 = unidadeById.get(Number(idA));
  const u2 = unidadeById.get(Number(idB));

  if (!u1 || !u2) {
    return (
      <div>
        <BackLink to="/unidades">Unidades</BackLink>
        <p className="text-zinc-400">Uma ou ambas as unidades não foram encontradas.</p>
      </div>
    );
  }

  const icon1 = getUnidadeAssetUrl(u1.ingles);
  const icon2 = getUnidadeAssetUrl(u2.ingles);

  return (
    <div>
      <BackLink to="/unidades">Unidades</BackLink>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
        <div className="inline-flex min-w-0 max-w-[min(100%,28rem)] flex-1 items-start gap-4">
          {icon1 ? (
            <img
              src={icon1}
              alt=""
              aria-hidden
              className="h-20 w-20 shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 object-contain p-1.5 shadow-sm shadow-black/30"
            />
          ) : null}
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-amber-100">
              {u1.nome}
            </h1>
            {u1.ingles ? <p className="mt-2 text-sm text-zinc-400">EN: {u1.ingles}</p> : null}
          </div>
        </div>
        <div className="inline-flex min-w-0 max-w-[min(100%,28rem)] flex-1 items-start justify-end gap-4">
          <div className="min-w-0 text-right">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-amber-100">
              {u2.nome}
            </h1>
            {u2.ingles ? <p className="mt-2 text-sm text-zinc-400">EN: {u2.ingles}</p> : null}
          </div>
          {icon2 ? (
            <img
              src={icon2}
              alt=""
              aria-hidden
              className="h-20 w-20 shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 object-contain p-1.5 shadow-sm shadow-black/30"
            />
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Visão geral">
          <UnidadeVisaoGeralBody u={u1} />
        </Section>
        <Section title="Visão geral">
          <UnidadeVisaoGeralBody u={u2} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Combate">
          <UnidadeCombateBody u={u1} />
        </Section>
        <Section title="Combate">
          <UnidadeCombateBody u={u2} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Custo e treino">
          <UnidadeCustoBody u={u1} />
        </Section>
        <Section title="Custo e treino">
          <UnidadeCustoBody u={u2} />
        </Section>
      </div>
    </div>
  );
}
