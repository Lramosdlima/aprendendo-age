import { useParams } from "react-router-dom";

import { UnidadeCombateBody, UnidadeCustoBody, UnidadeVisaoGeralBody } from "@/components/unidade/UnidadeSectionBodies";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeaderBlock } from "@/components/ui/PageHeader";
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
        <PageHeaderBlock
          title={u1.nome}
          description={u1.ingles ? `Inglês: ${u1.ingles}` : undefined}
          headerIconSrc={icon1}
          descriptionTag
          className="max-w-[min(100%,28rem)] min-w-0 flex-1"
        />
        <PageHeaderBlock
          align="end"
          title={u2.nome}
          description={u2.ingles ? `Inglês: ${u2.ingles}` : undefined}
          headerIconSrc={icon2}
          descriptionTag
          className="max-w-[min(100%,28rem)] min-w-0 flex-1"
        />
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
